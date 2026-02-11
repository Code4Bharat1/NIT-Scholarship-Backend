// models/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String },
    parentMobile: { type: String },
    address: { type: String },
    qualifications: { type: String },
    courseInterest: { type: String },
    loginDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
