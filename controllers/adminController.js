import Admin from "../models/Admin.js";
import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendProfessionalEmail } from "../utils/adminEmail.js";

dotenv.config();


export const registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const adminExists = await Admin.findOne({ $or: [{ email }] });
    if (adminExists) return res.status(400).json({ message: "Admin already exists" });

    const studentExists = await Student.findOne({ $or: [{ email }] });
    if (studentExists) return res.status(400).json({
      message: "Cannot use a username or email already registered as student"
    });

    const hashed = await bcrypt.hash(password, 10);
    await Admin.create({ username, email, password: hashed });

    res.json({ message: "Admin registered successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Admin registration failed" });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Admin not found" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Admin login success", token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Admin login failed" });
  }
};




export const sendEmail = async (req, res) => {
  try {
    const { recipients, studentName, examDate, adminMessage } = req.body;

    if (!recipients || !studentName || !examDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const emails = Array.isArray(recipients) ? recipients : [recipients];

    for (let email of emails) {
      await sendProfessionalEmail(
        email,
        studentName,
        examDate,
        adminMessage
      );
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
