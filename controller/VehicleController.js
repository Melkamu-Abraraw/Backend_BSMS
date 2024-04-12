const cloudinary = require("cloudinary").v2;
const { response } = require("express");
const Vehicle = require("../models/Vehicle");
const User = require("../models/Users");
const streamifier = require("streamifier");
const mongoose = require("mongoose");
const vehicle = require("../models/Vehicle");
const jwt = require("jsonwebtoken");

cloudinary.config({
  cloud_name: "ds3wsc8as",
  api_key: "714722695687768",
  api_secret: "iTi78ih5itaEnbiFF8oc7raVbvw",
});

const uploadvehicle = async (req, res) => {
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
            const folder = "Vehicles";

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
      req.body.VehiclesType === "" ||
      req.body.FuelType === "" ||
      req.body.Colour === "" ||
      req.body.Transmission === "" ||
      req.body.ManufacturingYear === "" ||
      req.body.imageUrls === "" ||
      req.body.VIN === "" ||
      req.body.Description === "" ||
      req.body.Price === ""
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
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
    if (!/^[a-zA-Z]+$/.test(req.body.Colour)) {
      return res
        .status(400)
        .json({ success: false, message: "Colour must contain only letters." });
    }
    if (!/^\d+$/.test(req.body.Rating)) {
      return res
        .status(400)
        .json({ success: false, message: "Rating only contains numbers." });
    }
    if (!/^\d+$/.test(req.body.ManufacturingYear)) {
      return res.status(400).json({
        success: false,
        message: "ManufacturingYear only contains numbers.",
      });
    }
    if (!/^\d+$/.test(req.body.VIN)) {
      return res
        .status(400)
        .json({ success: false, message: "VIN only contains numbers." });
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

    const newvehicle = new Vehicle({
      ContractType: req.body.ContractType,
      VehiclesType: req.body.VehiclesType,
      FuelType: req.body.FuelType,
      Colour: req.body.Colour,
      Transmission: req.body.Transmission,
      VIN: req.body.VIN,
      ManufacturingYear: req.body.ManufacturingYear,
      Price: req.body.Price,
      Description: req.body.Description,
      Rating: req.body.Rating,
      uploadedby: userEmail,
      imageUrls: imageUrls,
      documentUrls: documentUrls,
    });

    const savedvehicle = await newvehicle.save();

    res.json({
      success: true,
      message: "vehicle information added successfully",
      data: {
        newvehicle: savedvehicle,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
};

const showvehicle = (req, res, next) => {
  Vehicle.find()
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

const deletevehicle = async (req, res) => {
  try {
    const { VehicleId } = req.body;

    const deletedvehicle = await Vehicle.findByIdAndDelete(VehicleId);

    if (!deletedvehicle) {
      return res
        .status(404)
        .json({ success: false, error: "vehicle not found" });
    }

    res.json({
      success: true,
      message: "vehicle deleted successfully",
      deletedvehicle,
    });
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
};

const updatevehicle = async (req, res) => {
  try {
    const { VehicleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(VehicleId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid vehicleId." });
    }

    const updatedData = {
      ContractType: req.body.ContractType,
      VehiclesType: req.body.VehiclesType,
      FuelType: req.body.FuelType,
      Colour: req.body.Colour,
      Transmission: req.body.Transmission,
      VIN: req.body.VIN,
      ManufacturingYear: req.body.ManufacturingYear,
      Price: req.body.Price,
      Description: req.body.Description,
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

          const folder = "Vehicles";
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

    const updatedvehicle = await Vehicle.findByIdAndUpdate(
      VehicleId,
      updatedData,
      { new: true }
    );

    if (!updatedvehicle) {
      return res
        .status(404)
        .json({ success: false, error: "vehicle not found." });
    }

    res.json({
      success: true,
      message: "vehicle information updated successfully",
      data: updatedvehicle,
    });
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
};
const getvehiclebyid = async (req, res, next) => {
  try {
    let vehicleId = req.params.vehicleId;

    const vehicle = await Vehicle.findById(vehicleId).populate({
      path: "Broker",
      select: "FirstName LastName Phone",
    });

    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found." });
    }

    res.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error("Error while fetching vehicle:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching vehicle.",
    });
  }
};
const approveVehicle = async (req, res) => {
  try {
    const { vehicleId, Email } = req.params;

    const user = await User.findOne({ Email: Email });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, error: "vehicle not found." });
    }

    if (!isAuthorizedToApprove(user)) {
      return res.status(403).json({
        success: false,
        error: "User is not authorized to approve vehicle.",
      });
    }

    (vehicle.Status = "Approved"), (vehicle.approvedBy = user._id);
    await vehicle.save();

    res.json({
      success: true,
      message: "Vehicle approved successfully.",
      data: vehicle,
    });
  } catch (error) {
    console.error("Error approving vehicle:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const rejectVehicle = async (req, res) => {
  try {
    const { vehicleId, Email } = req.params;
    const vehicle = await Vehicle.findById(vehicleId);

    const user = await User.findOne({ Email: Email });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, error: "vehicle not found." });
    }

    if (!isAuthorizedToReject(user)) {
      return res.status(403).json({
        success: false,
        error: "User is not authorized to reject houses.",
      });
    }

    vehicle.Status = "Rejected";
    vehicle.approvedBy = user._id;

    await vehicle.save();

    res.json({
      success: true,
      message: "vehicle rejected successfully.",
      data: vehicle,
    });
  } catch (error) {
    console.error("Error rejecting vehicle:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const assignBrokerToVehicle = async (req, res) => {
  try {
    const { vehicleId, Email } = req.params;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, error: "vehicle not found." });
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

    vehicle.Broker = broker.Email;
    await vehicle.save();
    const message = `You have been assigned to house ${houseId} by your broker manager.`;
    await NotificationService.sendNotification(broker.Email, message);
    res.json({
      success: true,
      message: "Broker assigned successfully.",
      data: vehicle,
    });
  } catch (error) {
    console.error("Error assigning broker to vehicle:", error);
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
  uploadvehicle,
  showvehicle,
  deletevehicle,
  updatevehicle,
  approveVehicle,
  rejectVehicle,
  getvehiclebyid,
  assignBrokerToVehicle,
};
