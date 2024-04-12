const cloudinary = require("cloudinary").v2;
const { response } = require("express");
const House = require("../models/House");
const User = require("../models/Users");
const streamifier = require("streamifier");

const jwt = require("jsonwebtoken");
const NotificationService = require("../utils/notificationservice");

cloudinary.config({
  cloud_name: "ds3wsc8as",
  api_key: "714722695687768",
  api_secret: "iTi78ih5itaEnbiFF8oc7raVbvw",
});

const uploadImages = async (req, res) => {
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
            const folder = "Houses";

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
    await Promise.all(uploadDocumentPromises);
    await Promise.all(uploadPromises);
    if (
      req.body.ContractType === "" ||
      req.body.HouseType === "" ||
      req.body.Bedroom === "" ||
      req.body.Bathroom === "" ||
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
    if (!/^\d+$/.test(req.body.Bedroom)) {
      return res
        .status(400)
        .json({ success: false, message: "Bedroom only contains numbers." });
    }
    if (!/^\d+$/.test(req.body.Bathroom)) {
      return res
        .status(400)
        .json({ success: false, message: "Bathroom only contains numbers." });
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

    const newHouse = new House({
      ContractType: req.body.ContractType,
      HouseType: req.body.HouseType,
      Bedroom: req.body.Bedroom,
      Bathroom: req.body.Bathroom,
      Area: req.body.Area,
      Location: req.body.Location,
      City: req.body.City,
      Description: req.body.Description,
      Price: req.body.Price,
      Rating: req.body.Rating,
      UploadedBy: userEmail,
      imageUrls: imageUrls,
      documentUrls: documentUrls,
    });

    const savedHouse = await newHouse.save();

    res.json({
      success: true,
      message: "House information added successfully",
      data: {
        newHouse: savedHouse,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
};

const showHouse = (req, res, next) => {
  House.find()
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

const deleteProperty = async (req, res) => {
  try {
    const { propertyId } = req.body;

    const deletedProperty = await House.findByIdAndDelete(propertyId);

    if (!deletedProperty) {
      return res
        .status(404)
        .json({ success: false, error: "Property not found" });
    }

    res.json({
      success: true,
      message: "Property deleted successfully",
      deletedProperty,
    });
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
};
const updateProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const updatedData = {
      ContractType: req.body.ContractType,
      HouseType: req.body.HouseType,
      Bedroom: req.body.Bedroom,
      Bathroom: req.body.Bathroom,
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

          const folder = "Houses";
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

    const updatedProperty = await House.findByIdAndUpdate(
      propertyId,
      updatedData,
      { new: true }
    );

    if (!updatedProperty) {
      return res
        .status(404)
        .json({ success: false, error: "Property not found." });
    }

    res.json({
      success: true,
      message: "Property updated successfully",
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
const gethousebyid = async (req, res, next) => {
  try {
    let houseId = req.params.houseId;

    const house = await House.findById(houseId).populate({
      path: "Broker",
      select: "FirstName LastName Phone",
    });

    if (!house) {
      return res
        .status(404)
        .json({ success: false, message: "House not found." });
    }

    res.json({
      success: true,
      data: house,
    });
  } catch (error) {
    console.error("Error while fetching house:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching house.",
    });
  }
};

const assignBrokerToHouse = async (req, res) => {
  try {
    const { houseId, Email } = req.params;

    const house = await House.findById(houseId);
    if (!house) {
      return res
        .status(404)
        .json({ success: false, error: "House not found." });
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

    house.Broker = broker.Email;
    await house.save();
    const message = `You have been assigned to house ${houseId} by your broker manager.`;
    await NotificationService.sendNotification(broker.Email, message);
    res.json({
      success: true,
      message: "Broker assigned successfully.",
      data: house,
    });
  } catch (error) {
    console.error("Error assigning broker to house:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const approveHouse = async (req, res) => {
  try {
    const { houseId, Email } = req.params;

    const user = await User.findOne({ Email: Email });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const house = await House.findById(houseId);
    if (!house) {
      return res
        .status(404)
        .json({ success: false, error: "House not found." });
    }

    if (!isAuthorizedToApprove(user)) {
      return res.status(403).json({
        success: false,
        error: "User is not authorized to approve houses.",
      });
    }

    (house.Status = "Approved"), (house.approvedBy = user._id);
    await house.save();

    res.json({
      success: true,
      message: "House approved successfully.",
      data: house,
    });
  } catch (error) {
    console.error("Error approving house:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const rejectHouse = async (req, res) => {
  try {
    const { houseId, Email } = req.params;
    const house = await House.findById(houseId);

    const user = await User.findOne({ Email: Email });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    if (!house) {
      return res
        .status(404)
        .json({ success: false, error: "House not found." });
    }

    if (!isAuthorizedToReject(user)) {
      return res.status(403).json({
        success: false,
        error: "User is not authorized to reject houses.",
      });
    }

    house.Status = "Rejected";
    house.approvedBy = user._id;

    await house.save();

    res.json({
      success: true,
      message: "House rejected successfully.",
      data: house,
    });
  } catch (error) {
    console.error("Error rejecting house:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const isAuthorizedToApprove = (User) => {
  return User && User.Role === "BrokerAdmin";
};

const isAuthorizedToReject = (User) => {
  return User && User.Role === "BrokerAdmin";
};
const isAuthorizedToAssign = (User) => {
  return User && User.Role === "Agent";
};

module.exports = {
  uploadImages,
  showHouse,
  deleteProperty,
  updateProperty,
  gethousebyid,
  rejectHouse,
  approveHouse,
  assignBrokerToHouse,
};
