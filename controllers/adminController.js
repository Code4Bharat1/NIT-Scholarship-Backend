const Admin = require("../models/Admin");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if admin exists
    const adminExists = await Admin.findOne({
      $or: [{ username }, { email }]
    });

    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Check if any student has same username or email
    const studentExists = await Student.findOne({
      $or: [{ username }, { email }]
    });

    if (studentExists) {
      return res.status(400).json({
        message: "Cannot use a username or email already registered as student"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    await Admin.create({ username, email, password: hashed });

    res.json({ message: "Admin registered successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Admin registration failed" });
  }
};




exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(400).json({ message: "Admin not found" });

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.status(400).json({ message: "Wrong password" });

  // Create JWT token
  const token = jwt.sign(
    { id: admin._id, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" } // token valid for 1 day
  );

  res.json({ message: "Admin login success", token });
};

const transporter = require("../config/mailer");

exports.sendEmail = async (req, res) => {
  try {
    const { recipients, subject, content } = req.body;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipients, // works for bulk too
      subject: subject,
      text: content,
    });

    res.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send email" });
  }
};
