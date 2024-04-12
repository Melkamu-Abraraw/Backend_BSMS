const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const VehicleSchema = new Schema(
  {
    ContractType: {
      type: String,
      required: [true, "ContractType is required!"],
    },
    VehiclesType: {
      type: String,
      required: [true, "required!"],
    },
    FuelType: {
      type: String,
      required: [true, "required!"],
    },

    Colour: {
      type: String,
      required: [true, "required!"],
    },
    Transmission: {
      type: String,
      required: [true, "required"],
    },
    VIN: {
      type: String,
      required: [true, "required"],
    },
    ManufacturingYear: {
      type: Number,
      required: [true, "required"],
    },
    Price: {
      type: Number,
      required: [true, "required!"],
    },
    Description: {
      type: String,
      required: [true, "required!"],
    },
    Rating: {
      type: Number,
    },
    Status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    Broker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    PropertyType: {
      type: String,
      default: "Vehicle",
    },
    uploadedby: {
      type: String,
    },
    imageUrls: [String],
    documentUrls: [String],
  },
  { timestamps: true }
);

const vehicle = mongoose.model("Vehicle", VehicleSchema);
module.exports = vehicle;
