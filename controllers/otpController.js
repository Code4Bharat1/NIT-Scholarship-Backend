import { sendOtpEmail } from "../utils/emailService.js";
import Student from "../models/Student.js";
import Admin from "../models/Admin.js";
import Otp from "../models/Otp.js";

/**
 * =========================
 * SEND OTP
 * =========================
 */
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailLower = email.toLowerCase();

    // Check admin duplicate
    const adminExists = await Admin.findOne({ email: emailLower });
    if (adminExists) {
      return res.status(400).json({
        message: "Email already registered as admin",
      });
    }

    // Check student duplicate
    const studentExists = await Student.findOne({ email: emailLower });
    if (studentExists) {
      return res.status(400).json({
        message: "Email already registered. Please login.",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete old OTP
    await Otp.deleteMany({ email: emailLower });

    // Save new OTP with verified flag
    await Otp.create({
      email: emailLower,
      otp,
      verified: false,   // ⭐ IMPORTANT
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOtpEmail(emailLower, otp);

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};


/**
 * =========================
 * VERIFY OTP ONLY (NO REGISTER HERE)
 * =========================
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP required",
      });
    }

    const emailLower = email.toLowerCase();

    // ⭐ Find exact OTP match
    const otpRecord = await Otp.findOne({
      email: emailLower,
      otp: String(otp),
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteMany({ email: emailLower });
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    // ⭐ Mark verified instead of deleting
    otpRecord.verified = true;
    await otpRecord.save();

    return res.json({
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "OTP verification failed",
    });
  }
};
