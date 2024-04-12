const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HouseSchema = new Schema(
  {
    ContractType: {
      type: String,
      required: [true, "ContractType is required!"],
    },
    HouseType: {
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
    Location: {
      type: Object,
      required: [true, "Location is required!"],
    },
    City: {
      type: String,
      required: [true, "city is required!"],
    },
    Description: {
      type: String,
      required: [true, "Description info is required!"],
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
    PropertyType: {
      type: String,
      default: "House",
    },
    UploadedBy: {
      type: String,
    },
    imageUrls: [String],
    documentUrls: [String],
  },
  { timestamps: true }
);

const House = mongoose.model("House", HouseSchema);
module.exports = House;
