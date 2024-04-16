const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HouseSchema = new Schema(
  {
    Title: {
      type: String,
      required: [true, "Title is required!"],
    },
    Location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
  },
    Description: {
      type: String,
      required: [true, "Description info is required!"],
    },
    PropertyType: {
      type: String,
      default: "House",
    },
    PropertyCategory: {
      type: String,
    },
    ContractType: {
      type: String,
      required: [true, "ContractType is required!"],
    },
    Currency: {
      type: String,
    },
    City: {
      type: String,
      required: [true, "City is required!"],
    },
    PriceCategory: {
      type: String,
      required: [true, "HouseType is required!"],
    },
    Bedroom: {
      type: Number,
      required: [true, "Bedroom is required!"],
    },
    Bathroom: {
      type: Number,
      required: [true, "Bathroom is required!"],
    },
    Area: {
      type: Number,
      required: [true, "Area is required!"],
    },
    Price: {
      type: Number,
      required: [true, "Price is required!"],
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
   
    uploadedby: {
      type: String,
    },
    imageUrls: [String],
    documentUrls: [String],
  },
  { timestamps: true }
);

const House = mongoose.model("House", HouseSchema);
module.exports = House;
