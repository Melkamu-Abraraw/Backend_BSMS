const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HouseSchema = new Schema(
  {
    Title: {
      type: String,
      required: [true, "Title is required!"],
    },
    Location: {
      type: String,
      required: [true, "Location is required!"],
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
      required: [true, "city is required!"],
    },
    PriceCategory: {
      type: String,
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
    },
    Location: {
      type: Object,
      required: [true, "Location is required!"],
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
    YearBuilt: {
      type: String,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    Broker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    imageUrls: [String],
  },
  { timestamps: true }
);

const House = mongoose.model("House", HouseSchema);
module.exports = House;
