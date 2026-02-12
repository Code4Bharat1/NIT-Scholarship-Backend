import Student from "../models/Student.js";
import Admin from "../models/Admin.js";
import transporter from "../config/mailer.js";
import bcrypt from "bcryptjs";

const generatePassword = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `NIT@${random}`;
};

export const registerStudent = async (req, res) => {
  try {
    const { username, email, mobile, parentMobile, address, qualifications, courseInterest } = req.body;

    // Admin & Student checks
    const adminExists = await Admin.findOne({ $or: [{ email }, { username }] });
    if (adminExists) return res.status(400).json({ message: "Student cannot match admin credentials" });

    const studentExists = await Student.findOne({ $or: [{ email }, { username }] });
    if (studentExists) return res.status(400).json({ message: "Username or email already registered as student" });

    // Generate password
    const passwordPlain = generatePassword();
    const hashedPassword = await bcrypt.hash(passwordPlain, 10);

    const loginDate = new Date();
    loginDate.setDate(loginDate.getDate() + 1);

    // Save student
    await Student.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      mobile,
      parentMobile,
      address,
      qualifications,
      courseInterest,
      loginDate
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Student Registration",
      html: `<h3>Welcome ${username}</h3><p>Password: ${passwordPlain}</p><p>You can login after: ${loginDate}</p>`
    });

    res.json({ message: "Registered successfully. Check email." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
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

    res.json({
      message: "Login successful",
      student: { id: student._id, username: student.username, email: student.email }
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
