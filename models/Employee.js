const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EmployeeSchema = new Schema(
  {
    Name: {
      type: String,
      required: [true, "name is required"],
    },
    Gender: {
      type: String,
      required: [true, "Gender is required"],
    },
    DOB: {
      type: String,
      required: [true, "DOB is required"],
    },
    phone: {
      type: String,
      required: [true, "Phonenumber is required"],
    },
    JobType: {
      type: String,
      required: [true, "JobType is required"],
    },
    Experience: {
      type: String,
      required: [true, "Experience is required"],
    },
    Skill: {
      type: String,
      required: [true, "Skill is required"],
    },

    Description: {
      type: String,
      required: [true, "required"],
    },
    RelativeName: {
      type: String,
      required: [true, "RelativeName is required"],
    },
    RelativePhone: {
      type: String,
      required: [true, "RelativePhone is required"],
    },
    RelativeAddress: {
      type: String,
      required: [true, "RelativeAddress is required"],
    },
    Relationship: {
      type: String,
      required: [true, "Relationship is required"],
    },
    relativeImageUrls: [String],

    imageUrls: [String],
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", EmployeeSchema);
module.exports = Employee;
