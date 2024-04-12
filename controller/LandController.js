const cloudinary = require("cloudinary").v2;
const { response } = require("express");
const Land = require("../models/Land");
const User = require("../models/Users");
const streamifier = require("streamifier");
const jwt = require("jsonwebtoken");
const NotificationService = require("../utils/notificationservice");
cloudinary.config({
  cloud_name: "ds3wsc8as",
  api_key: "714722695687768",
  api_secret: "iTi78ih5itaEnbiFF8oc7raVbvw",
});

const uploadland = async (req, res) => {
  console.log(req.files);
  try {
    const imageUrls = [];
    const documentUrls = [];

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No files uploaded." });
    }
    if (req.files.length > 4) {
      return res
        .status(400)
        .json({ success: false, error: "Maximum of 3 files allowed." });
    }
    const uploadPromises = req.files
      .filter((file) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        return allowedTypes.includes(file.mimetype);
      })
      .map((file) => {
        return new Promise((resolve, reject) => {
          if (file.size > 10485760) {
            reject({
              success: false,
              error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
            });
          } else {
            const folder = "Land";

            const stream = cloudinary.uploader.upload_stream(
              { resource_type: "auto", folder: folder },
              (error, result) => {
                if (error) {
                  console.error("Error uploading to Cloudinary:", error);
                  reject({
                    success: false,
                    error: "Error uploading to Cloudinary",
                  });
                }
                imageUrls.push(result.secure_url);
                resolve();
              }
            );

            streamifier.createReadStream(file.buffer).pipe(stream);
          }
        });
      });
    const uploadDocumentPromises = req.files
      .filter((file) => file.mimetype.startsWith("application/pdf"))
      .map((file) => {
        return new Promise((resolve, reject) => {
          if (file.size > 10485760) {
            reject({
              success: false,
              error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
            });
          }

          const folder = "Documents";

          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: folder },
            (error, result) => {
              if (error) {
                console.error("Error uploading document to Cloudinary:", error);
                reject({
                  success: false,
                  error: "Error uploading document to Cloudinary",
                });
              }
              documentUrls.push(result.secure_url);
              resolve();
            }
          );

          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });

    if (
      req.body.ContractType === "" ||
      req.body.Area === "" ||
      req.body.imageUrls === "" ||
      req.body.Location === "" ||
      req.body.City === "" ||
      req.body.Description === "" ||
      req.body.Price === ""
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    if (!/^\d+$/.test(req.body.Area)) {
      return res
        .status(400)
        .json({ success: false, message: "Area only contains numbers." });
    }
    if (!/^\d+$/.test(req.body.Price)) {
      return res
        .status(400)
        .json({ success: false, message: "Price only contains numbers." });
    }
    if (!/^\d+$/.test(req.body.Rating)) {
      return res
        .status(400)
        .json({ success: false, message: "Rating only contains numbers." });
    }
    if (!/^[a-zA-Z]+$/.test(req.body.City)) {
      return res
        .status(400)
        .json({ success: false, message: "City must contain only letters." });
    }
    await Promise.all(uploadPromises);
    await Promise.all(uploadDocumentPromises);

    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "Token is missing." });
    }

    const decodedToken = jwt.verify(token.split(" ")[1], "AZQ,PI)0(");

    if (!decodedToken) {
      return res.status(401).json({ success: false, error: "Invalid token." });
    }

    const userEmail = decodedToken.Email;

    const newland = new Land({
      ContractType: req.body.ContractType,
      Area: req.body.Area,
      Location: req.body.Location,
      City: req.body.City,
      Description: req.body.Description,
      Price: req.body.Price,
      Rating: req.body.Rating,
      imageUrls: imageUrls,
      UploadedBy: userEmail,
      documentUrls: documentUrls,
    });

    const savedland = await newland.save();

    res.json({
      success: true,
      message: "Land information added successfully",
      data: {
        newland: savedland,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
};

const showland = (req, res, next) => {
  Land.find()
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((error) => {
      res.json({
        message: "An error Occurred!",
      });
    });
};

const deleteland = async (req, res) => {
  try {
    const { LandId } = req.body;

    const deletedland = await Land.findByIdAndDelete(LandId);

    if (!deletedland) {
      return res.status(404).json({ success: false, error: "Land not found" });
    }

    res.json({
      success: true,
      message: "Land deleted successfully",
      deletedland,
    });
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
};
const updateland = async (req, res) => {
  try {
    const { LandId } = req.params;
    const updatedData = {
      ContractType: req.body.ContractType,
      Area: req.body.Area,
      Location: req.body.Location,
      City: req.body.City,
      Description: req.body.Description,
      Price: req.body.Price,
    };

    if (req.files && req.files.length > 0) {
      const newImageUrls = [];
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          if (file.size > 10485760) {
            reject({
              success: false,
              error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
            });
          }

          const folder = "Land";
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: folder },
            (error, result) => {
              if (error) {
                console.error("Error uploading to Cloudinary:", error);
                reject({
                  success: false,
                  error: "Error uploading to Cloudinary",
                  file: file.originalname,
                });
              }
              newImageUrls.push(result.secure_url);
              resolve();
            }
          );

          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });

      await Promise.all(uploadPromises);
      updatedData.imageUrls = newImageUrls;
    }

    const updatedProperty = await Land.findByIdAndUpdate(LandId, updatedData, {
      new: true,
    });

    if (!updatedProperty) {
      return res.status(404).json({ success: false, error: "Land not found." });
    }

    res.json({
      success: true,
      message: "Land Information updated successfully",
      data: updatedProperty,
    });
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ success: false, error: "Internal Server Error", data: null });
    }
  }
};
const getlandbyid = async (req, res, next) => {
  try {
    let landID = req.params.landID;

    const Landing = await Land.findById(landID).populate({
      path: "Broker",
      select: "FirstName LastName Phone",
    });

    if (!Landing) {
      return res
        .status(404)
        .json({ success: false, message: "Land not found." });
    }

    res.json({
      success: true,
      data: Landing,
    });
  } catch (error) {
    console.error("Error while fetching Land:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching Land.",
    });
  }
};

const approveLand = async (req, res) => {
  try {
    const { landID, Email } = req.params;

    const user = await User.findOne({ Email: Email });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const land = await Land.findById(landID);
    if (!land) {
      return res.status(404).json({ success: false, error: "Land not found." });
    }

    if (!isAuthorizedToApprove(user)) {
      return res.status(403).json({
        success: false,
        error: "User is not authorized to approve land.",
      });
    }

    (land.Status = "Approved"), (land.approvedBy = user._id);
    await land.save();

    res.json({
      success: true,
      message: "Land approved successfully.",
      data: land,
    });
  } catch (error) {
    console.error("Error approving land:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const rejectLand = async (req, res) => {
  try {
    const { landID, Email } = req.params;
    const land = await Land.findById(landID);

    const user = await User.findOne({ Email: Email });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    if (!land) {
      return res.status(404).json({ success: false, error: "land not found." });
    }

    if (!isAuthorizedToReject(user)) {
      return res.status(403).json({
        success: false,
        error: "User is not authorized to reject land.",
      });
    }

    land.Status = "Rejected";
    land.approvedBy = user._id;

    await land.save();

    res.json({
      success: true,
      message: "Land rejected successfully.",
      data: land,
    });
  } catch (error) {
    console.error("Error rejecting land:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const assignBrokerToLand = async (req, res) => {
  try {
    const { landID, Email } = req.params;

    const land = await Land.findById(landID);
    if (!land) {
      return res.status(404).json({ success: false, error: "Land not found." });
    }

    const broker = await User.findOne({ Email: Email });
    if (!broker) {
      return res
        .status(404)
        .json({ success: false, error: "Broker not found." });
    }

    if (!isAuthorizedToAssign(broker)) {
      return res.status(403).json({
        success: false,
        error: "Broker is not authorized to be assigned.",
      });
    }

    land.Broker = broker.Email;
    await land.save();
    const message = `You have been assigned to house ${houseId} by your broker manager.`;
    await NotificationService.sendNotification(broker.Email, message);
    res.json({
      success: true,
      message: "Broker assigned successfully.",
      data: land,
    });
  } catch (error) {
    console.error("Error assigning broker to land:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const isAuthorizedToApprove = (User) => {
  return User && User.Role === "BrokerAdmin";
};
const isAuthorizedToAssign = (User) => {
  return User && User.Role === "Agent";
};
const isAuthorizedToReject = (User) => {
  return User && User.Role === "BrokerAdmin";
};

module.exports = {
  uploadland,
  showland,
  deleteland,
  updateland,
  rejectLand,
  approveLand,
  getlandbyid,
  assignBrokerToLand,
};
