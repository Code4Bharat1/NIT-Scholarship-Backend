import mongoose from "mongoose";

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

const Student = mongoose.model("Student", studentSchema);

export default Student;
