var request = require("request");
var secret = process.env.SECRET_KEY;
var crypto = require("crypto");
const Doc = require("../models/Doc");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");

function generateRandomString() {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 8; i++) {
    if (i % 2 === 0) {
      result += "x";
    } else {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
  }

  result += "-";
  for (let i = 0; i < 4; i++) {
    result += Math.floor(Math.random() * 10);
  }

  return result;
}

const Payment = async (req, res) => {
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
      response = json;
      if (
        json.recipients[0].status === "finalized" &&
        json.recipients[1].status === "finalized" &&
        doc.paymentStatus === "Not Paid"
      ) {
        console.log("here");
        var options = {
          method: "POST",
          url: "https://api.chapa.co/v1/transaction/initialize",
          headers: {
            Authorization:
              "Bearer CHASECK_TEST-qdTEq6YnHFFhFIPBePj9z51xJV5Hv5d5",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: doc.price,
            email: "wkusw203@gmail.com",
            currency: "ETB",
            tx_ref: generateRandomString(),
            return_url: "http://localhost:3000/dashboard/seller/",
          }),
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
          const resp = JSON.parse(response.body);
          console.log(resp);
          res.json({
            success: true,
            paymentStatus: doc.paymentStatus,
            url: resp.data.checkout_url,
          });
        });
      } else if (
        json.recipients[0].status === "finalized" &&
        json.recipients[1].status === "finalized" &&
        doc.paymentStatus === "Paid"
      ) {
        const pendId = Number(doc.pendingId);
        const originalId = Number(doc.originalId);
        const signedId = Number(doc.signedId);

        let options = {
          method: "GET",
          url: `https://api.signeasy.com/v3/rs/envelope/signed/pending/${pendId}`,
          headers: {
            Authorization: "Bearer " + process.env.SIGNEASY_ACCESS_TOKEN,
          },
        };
        request(options, async function (error, response) {
          if (error) res.json({ error: error });
          let resp = JSON.parse(response.body);
          console.log(resp.id);
          if (resp.id) {
            const doc = await Doc.findOne({});
            doc.signedId = resp.id;
            await doc.save();
            let options = {
              method: "GET",
              url: `https://api.signeasy.com/v3/rs/envelope/signed/${signedId}/${originalId}/download`,
              headers: {
                Authorization: "Bearer " + process.env.SIGNEASY_ACCESS_TOKEN,
              },
              encoding: null,
            };
            request(options, function (error, response, body) {
              if (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
                return;
              }
              if (response.statusCode !== 200) {
                console.error(
                  "Request failed with status code:",
                  response.statusCode
                );
                res.status(response.statusCode).send("Request Failed");
                return;
              }
              res.setHeader("Content-Type", "application/pdf");
              res.setHeader(
                "Content-Disposition",
                "attachment; filename=certificate.pdf"
              );

              const pdfData = body;
              const base64PdfData = pdfData.toString("base64");
              // const filename = `${uuid.v4()}.pdf`;
              // const filePath = path.join(__dirname, "..", "pdfs", filename);
              // fs.writeFileSync(filePath, pdfData, "binary");
              // const pdfUrl = `http://localhost:3001/pdfs/${filename}`;
              res.json({
                success: true,
                paymentStatus: doc.paymentStatus,
                pdfBase64Data: base64PdfData,
              });
            });
          }
        });
      }
    })
    .catch((err) => console.error("error:" + err));
};

const verifyPayment = async (req, res) => {
  console.log(req.body);
  if (req.body.status === "success") {
    const doc = await Doc.findOne({});
    console.log(doc);
    doc.paymentStatus = "Paid";
    await doc.save();
  }
  const hash = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");
  if (hash == req.headers["Chapa-Signature"]) {
  }

  res.sendStatus(200);
};

const TranferMoney = () => {
  var options = {
    method: "GET",
    url: "https://api.chapa.co/v1/transfers",
    headers: {
      Authorization: "Bearer CHASECK_TEST-qdTEq6YnHFFhFIPBePj9z51xJV5Hv5d5",
    },
    body: JSON.stringify({
      account_name: "Israel Goytom",
      account_number: "32423423",
      amount: "1",
      currency: "ETB",
      reference: "3241342142sfdd",
      bank_code: "fe087651-4910-43af-b666-bbd393d8e81f",
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    const resp = JSON.parse(response.body);
    console.log(resp);
  });
};

module.exports = { Payment, verifyPayment, TranferMoney };
