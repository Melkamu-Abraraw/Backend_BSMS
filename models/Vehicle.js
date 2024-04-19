const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const VehicleSchema = new Schema(
  
  {
    Title:{
      type: String,
    },
    Brand:{
      type: String,
    },
    Model:{
      type: String,
    },
    BodyType:{
      type: String,
    },
    FuelType:{
      type: String,
    },
    Milleage:{
      type: String,
    },
    ContractType: {
      type: String,
      required: [true, "ContractType is required!"],
    },
    Currency:{
      type:String,
  },
 
    Location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
  },
  PriceCategory: {
    type: String,
},
    
    Colour: {
      type: String,
      required: [true, "required!"],
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
