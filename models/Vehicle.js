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
    Brand: {
      type: String,
    },
    BodyType: {
      type: String,
    },
    Model: {
      type: String,
    },
    EngineSize: {
      type: String,
    },
    Millage: {
      type: String,
    },
    Colour: {
      type: String,
      required: [true, "required!"],
    },
    Currency: {
      type: String,
    },
    PriceCategory: {
      type: String,
    },
    City: {
      type: String,
    },
    Transmission: {
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
    imageUrls: [String],
  },
  { timestamps: true }
);

const vehicle = mongoose.model("Vehicle", VehicleSchema);
module.exports = vehicle;
