const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    FirstName: {
      type: String,
      required: true,
    },
    LastName: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: [true, "Email is required!"],
      unique: true,
    },
    Phone: {
      type: String,
      required: true,
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
    chats: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
module.exports = User;
