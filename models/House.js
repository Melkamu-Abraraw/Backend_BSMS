const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HouseSchema = new Schema(
  {
<<<<<<< HEAD
    Title: {
      type: String,
      required: [true, "Title is required!"],
    },
    Location: {
      type: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
      },
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
=======
>>>>>>> 04574d1258fcb5aea594b9d69b683fe459f0d6bb
    ContractType: {
      type: String,
      required: [true, "ContractType is required!"],
    },
<<<<<<< HEAD
    Currency: {
      type: String,
    },
    City: {
      type: String,
      required: [true, "City is required!"],
    },
    PriceCategory: {
=======
    HouseType: {
>>>>>>> 04574d1258fcb5aea594b9d69b683fe459f0d6bb
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
<<<<<<< HEAD
=======
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
>>>>>>> 04574d1258fcb5aea594b9d69b683fe459f0d6bb
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
