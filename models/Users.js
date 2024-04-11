const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    FirstName: {
      type: String,
    },
    LastName: {
      type: String,
    },
    Email: {
      type: String,
      required: [true, "Email is required!"],
      unique: true,
    },
    Phone: {
      type: String,
    },
    Password: {
      type: String,
      required: [true, "Password is required!"],
    },
    ConfirmPassword: {
      type: String,
      required: true,
    },
    Role: {
      type: String,
      required: true,
      default: "User",
    },
    imageUrls: [String],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
