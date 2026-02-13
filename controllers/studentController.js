import Student from "../models/Student.js";
import Admin from "../models/Admin.js";

import { sendStudentRegistrationEmail } from "../utils/emailService.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";   // add this at top

const generatePassword = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `NIT@${random}`;
};

// export const registerStudent = async (req, res) => {
//   try {
//     const { username, email, mobile, parentMobile, address, qualifications, courseInterest } = req.body;

//     // Admin & Student checks
//     const adminExists = await Admin.findOne({ $or: [{ email }, { username }] });
//     if (adminExists) return res.status(400).json({ message: "Student cannot match admin credentials" });

//     const studentExists = await Student.findOne({ $or: [{ email }, { username }] });
//     if (studentExists) return res.status(400).json({ message: "Username or email already registered as student" });

//     // Generate password
//     const passwordPlain = generatePassword();
//     const hashedPassword = await bcrypt.hash(passwordPlain, 10);

//     const loginDate = new Date();
//     loginDate.setDate(loginDate.getDate() + 1);

//     // Save student
//     await Student.create({
//       username,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       mobile,
//       parentMobile,
//       address,
//       qualifications,
//       courseInterest,
//       loginDate
//     });

//     // Send email
//    // Send email
// await sendStudentRegistrationEmail({
//   to: email.toLowerCase(),
//   username,
//   password: passwordPlain,
//   loginDate: loginDate.toDateString() // e.g., "Thu Feb 12 2026"
// });



//     res.json({ message: "Registered successfully. Check email." });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Registration failed" });
//   }
// };



export const registerStudent = async (req, res) => {
  try {
    const {
      username,
      email,
      mobile,
      parentMobile,
      address,
      qualifications,
      courseInterest,
    } = req.body;

    const emailLower = email.toLowerCase();

    // ✅ Check Admin conflict
    const adminExists = await Admin.findOne({
      $or: [{ email: emailLower }],
    });

    if (adminExists) {
      return res.status(400).json({
        message: "Student cannot match admin credentials",
      });
    }

    // ✅ Check Student duplicate
    const studentExists = await Student.findOne({
      $or: [{ email: emailLower }],
    });

    if (studentExists) {
      return res.status(400).json({
        message: "Username or email already registered",
      });
    }

    // ✅ Generate password
    const passwordPlain = generatePassword();
    const hashedPassword = await bcrypt.hash(passwordPlain, 10);

    // ✅ Set login date (tomorrow)
    const loginDate = new Date();
    loginDate.setDate(loginDate.getDate() + 1);

    // ✅ Save student FIRST
    const student = await Student.create({
      username,
      email: emailLower,
      password: hashedPassword,
      mobile,
      parentMobile,
      address,
      qualifications,
      courseInterest,
      loginDate,
    });

    // ✅ Send email WITHOUT blocking registration
    sendStudentRegistrationEmail({
      to: emailLower,
      username,
      password: passwordPlain,
      loginDate: loginDate.toDateString(),
    }).catch((err) => {
      console.error("Email failed but student registered:", err.message);
    });

    // ✅ Success response
    res.status(201).json({
      message: "Student registered successfully",
      studentId: student._id,
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({
      message: "Registration failed",
    });
  }
};


export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailNormalized = email.trim().toLowerCase();

    const student = await Student.findOne({ email: emailNormalized });
    if (!student) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, student.password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    const today = new Date();
    if (today < student.loginDate) {
      return res.status(403).json({
        message: "Login not allowed yet",
        loginDate: student.loginDate
      });
    }

    // CREATE TOKEN
    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      student: {
        id: student._id,
        username: student.username,
        email: student.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";

    const query = {
      $or: [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
    };

    const total = await Student.countDocuments(query);

    const students = await Student.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching students" });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete student" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.student.id).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

