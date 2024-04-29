const { ObjectId } = require("mongodb");
const Doc = require("../models/Doc");
const request = require("request");
const fs = require("fs");

module.exports.uploadOriginal = async (req, res) => {
  let options = {
    method: "POST",
    url: "https://api.signeasy.com/v3/original/",
    headers: {
      Authorization: "Bearer " + process.env.SIGNEASY_ACCESS_TOKEN,
    },
    formData: {
      file: {
        value: fs.createReadStream(req.file.path),
        options: {
          filename: "",
          contentType: null,
        },
      },
      name: req.file.originalname,
      rename_if_exists: "1",
    },
  };

  request(options, async function (error, response) {
    console.log(req.body);
    if (error) res.json({ error: error });
    let resp = JSON.parse(response.body);

    try {
      const doc = new Doc({
        billingId: 2,
        originalId: resp.id,
        amount: 10,
        sellerEmail: req.body.sellerEmail,
        buyerEmail: req.body.buyerEmail,
        price: req.body.Price,
        x: 100,
        y: 400,
      });
      await doc.save();
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error,
      });
    }
    fs.unlink(req.file.path, (err) => {
      if (err) console.log(err);
      else {
        console.log("Deleted file after uploading");
      }
    });

    const doc = await Doc.find({});
    let options = {
      method: "POST",
      url: "https://api.signeasy.com/v3/rs/envelope/",
      headers: {
        Authorization: "Bearer " + process.env.SIGNEASY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embedded_signing: true,
        is_ordered: false,
        message: "This is for you to confirm your agreement",
        sources: [
          {
            id: Number(doc[0].originalId),
            type: "original",
            name: "CONFIDENTIAL",
            source_id: 1,
          },
        ],
        recipients: [
          {
            first_name: "test",
            last_name: "father",
            email: doc[0].sellerEmail,
            recipient_id: 1,
          },
          {
            first_name: "test",
            last_name: "father",
            email: doc[0].buyerEmail,
            recipient_id: 2,
          },
        ],

        signature_panel_types: ["draw", "type"],
        initial_panel_types: ["draw"],
        fields_payload: [
          {
            recipient_id: 1,
            source_id: 1,
            type: "signature",
            required: true,
            page_number: "1",
            position: {
              height: 100,
              width: 100,
              x: 1,
              y: 1,
              mode: "fixed",
            },
            additional_info: {},
          },
          {
            recipient_id: 2,
            source_id: 1,
            type: "signature",
            required: true,
            page_number: "2",
            position: {
              height: 100,
              width: 100,
              x: 1,
              y: 1,
              mode: "fixed",
            },
            additional_info: {},
          },
        ],
      }),
    };

    request(options, async function (error, response) {
      if (error) res.json({ error: error });
      let resp = JSON.parse(response.body);
      doc[0].pendingId = resp.id;
      await doc[0].save();
    });

    return res.status(200).json({
      success: true,
      message: "file uploaded successfully " + resp,
    });
  });
};

module.exports.sendEnvelope = async (req, res) => {
  console.log(req.body.user.Email);
  let signedStatus = false;
  let response;
  const doc = await Doc.findOne({
    $or: [
      { sellerEmail: req.body.user.Email },
      { buyerEmail: req.body.user.Email },
    ],
  });

  if (doc.length == 0) {
    return res.status(404).json({ error: "Document Not Found" }); // Send signed document response
  }

  const pendNumber = Number(doc.pendingId);
  const url = `https://api.signeasy.com/v3/rs/envelope/${pendNumber}`;
  const options = {
    method: "GET",
    headers: {
      Authorization: "Bearer " + process.env.SIGNEASY_ACCESS_TOKEN,
      accept: "application/json",
    },
  };

  fetch(url, options)
    .then((res) => res.json())
    .then((json) => {
      console.log(json);
      response = json;
      const userRecipient = response.recipients.find(
        (recipient) => recipient.email === req.body.user.Email
      );

      if (userRecipient) {
        if (userRecipient.status === "finalized") {
          return res.status(404).json({ error: "Document Signed" }); // Send signed document response
        } else {
          const url = `https://api.signeasy.com/v3/rs/envelope/${pendNumber}/signing/url/`;
          const options = {
            method: "POST",
            headers: {
              Authorization: "Bearer " + process.env.SIGNEASY_ACCESS_TOKEN,
              accept: "application/json",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              recipient_email: req.body.user.Email,
              redirect_url: "http://localhost:3000/dashboard/seller",
            }),
          };
          fetch(url, options)
            .then((res) => res.json())
            .then((json) => res.send(json))
            .catch((err) => console.error("error:" + err));
        }
      }
    })
    .catch((err) => console.error("error:" + err));
};

module.exports.getSignedId = async (req, res) => {
  let options = {
    method: "GET",
    url: `https://api.signeasy.com/v3/rs/envelope/signed/pending/${req.body.pending_id}`,

    headers: {
      Authorization: "Bearer " + process.env.SIGNEASY_ACCESS_TOKEN,
    },
  };

  request(options, async function (error, response) {
    if (error) res.json({ error: error });
    // res.send(response.body);
    let resp = JSON.parse(response.body);
    if (resp.id) {
      const doc = await Doc.findById(new ObjectId(req.body.doc_id));
      doc.signedId = resp.id;
      await doc.save();
      return res.status(200).json({
        success: true,
        message: "signed ID added successfully, signed ID is " + resp.id,
      });
    }
    res.send(resp);
  });
};

module.exports.getDoc = async (req, res) => {
  const doc = await Doc.findOne({
    $or: [
      { sellerEmail: req.body.user.Email },
      { buyerEmail: req.body.user.Email },
    ],
  });

  if (doc.length == 0) {
    return res.status(404).json({ error: "Document Not Found" });
  }

  const pendNumber = Number(doc.pendingId);
  const url = `https://api.signeasy.com/v3/rs/envelope/${pendNumber}`;
  const options = {
    method: "GET",
    headers: {
      Authorization: "Bearer " + process.env.SIGNEASY_ACCESS_TOKEN,
      accept: "application/json",
    },
  };

  fetch(url, options)
    .then((res) => res.json())
    .then((json) => {
      console.log(json);
      response = json;
      if (
        json.recipients[0].status === "finalized" &&
        json.recipients[1].status === "finalized"
      ) {
        console.log("both sign");
      }
    })
    .catch((err) => console.error("error:" + err));
};

module.exports.downloadEnvelopeAndCertificate = async (req, res) => {
  let options = {
    method: "GET",
    url: `https://api.signeasy.com/v3/rs/envelope/signed/${req.body.signed_id}/${req.body.original_id}/download`,
    headers: {
      Authorization: "Bearer " + process.env.SIGNEASY_ACCESS_TOKEN,
    },
    encoding: null,
  };

  request(options, function (error, response, body) {
    if (error) {
      console.error(error);
      return;
    }
    if (response.statusCode !== 200) {
      console.error("Request failed with status code:", response.statusCode);
      return;
    }

    // Write binary data to a file
    const filePath = `${__dirname}/downloads/certificate.pdf`;
    fs.writeFile(filePath, body, "binary", function (writeError) {
      if (writeError) {
        console.error("Error writing file:", writeError);
      } else {
        console.log("File saved successfully at:", filePath);
      }
    });
  });
};
