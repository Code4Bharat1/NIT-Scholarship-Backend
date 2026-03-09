import User  from "../models/user.model.js";
import Admin from "../models/admin.model.js";

import { generateToken, generatePassword } from "../utils/jwtUtils.js";
import {
  sendOTPEmail,
  sendRegistrationConfirmationEmail,
} from "../utils/emailService.js";
import { sendOTPSMS, sendMockOTPSMS } from "../utils/Smsservice.js";
import { sendWhatsAppOTP }             from "../utils/whatsappService.js";
import { generateAdmitCard }           from "../utils/generateAdmitCard.js";
import Location                        from "../models/location.model.js";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const makeOTP = () =>
  Math.floor(100_000 + Math.random() * 900_000).toString();

async function sendAdmitCardEmail(user) {
  const pdfBuffer = await generateAdmitCard({
    registrationNumber: user.registrationNumber,
    fullName:           user.fullName,
    email:              user.email,
    phone:              user.phone,
    institution:        user.institution,
    state:              user.state,
    city:               user.city,
    subCity:            user.subCity,
    photo:              user.photo,
  });

  await sendRegistrationConfirmationEmail(
    user.email,
    user.fullName,
    user.registrationNumber,
    pdfBuffer
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register new USER (student)
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const {
      fullName, email, phone,
      institution, state, city, subCity, preferredDate,
    } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });
    }

    // Check duplicates across BOTH collections (users + admins)
    const [existingUser, existingAdmin] = await Promise.all([
      User.findOne({ $or: [{ email }, { phone }] }),
      Admin.findOne({ $or: [{ email }, { phone }] }),
    ]);
    if (existingUser || existingAdmin) {
      return res.status(400).json({ success: false, message: "User with this email or phone already exists" });
    }

    const tempPassword = generatePassword();
    const emailOTP     = makeOTP();
    const whatsappOTP  = makeOTP();
    const otpExpires   = new Date(Date.now() + 10 * 60 * 1000);

    let photoBase64 = null;
    if (req.file) {
      photoBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    // ✅ Use USER discriminator — role:'user' is set automatically
    const user = await User.create({
      fullName, email, phone, institution,
      password: tempPassword,
      emailOTP, smsOTP: whatsappOTP, otpExpires,
      state, city, subCity,
      photo: photoBase64,
      preferredDate: preferredDate || null,
    });

    try { await sendOTPEmail(email, emailOTP, fullName); }
    catch (e) { console.error("[Register] Email OTP error:", e); }

    try { await sendWhatsAppOTP(phone, whatsappOTP, fullName); }
    catch (e) { console.error("[Register] WhatsApp OTP error:", e); }

    return res.status(201).json({
      success: true,
      message: "Registration successful! Please verify your email and WhatsApp number.",
      data: {
        userId:             user._id,
        registrationNumber: user.registrationNumber,
        email:              user.email,
        phone:              user.phone,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ success: false, message: "Registration failed", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Please provide email and OTP" });
    }

    // Only students go through OTP — query User discriminator only
    const user = await User.findOne({
      email,
      emailOTP:   otp,
      otpExpires: { $gt: Date.now() },
    }).select("+emailOTP +otpExpires");

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isEmailVerified = true;
    user.emailOTP        = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! Please verify your phone number.",
      data: { emailVerified: true, smsVerified: user.isSmsVerified },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(500).json({ success: false, message: "Email verification failed", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Verify SMS / WhatsApp OTP  →  sends admit-card PDF on success
// @route   POST /api/auth/verify-sms
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const verifySMS = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "Please provide phone and OTP" });
    }

    const user = await User.findOne({
      phone,
      smsOTP:     otp,
      otpExpires: { $gt: Date.now() },
    }).select("+smsOTP +otpExpires +photo");

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Guard: already verified → skip duplicate admit-card
    if (user.isSmsVerified) {
      return res.status(200).json({
        success: true,
        message: "Phone already verified.",
        data: {
          emailVerified:      user.isEmailVerified,
          smsVerified:        true,
          registrationNumber: user.registrationNumber,
        },
      });
    }

    user.isSmsVerified = true;
    user.smsOTP        = undefined;
    user.otpExpires    = undefined;
    await user.save();

    // Fire-and-forget
    sendAdmitCardEmail(user).catch((err) =>
      console.error("[AdmitCard] Failed to send admit card email:", err)
    );

    return res.status(200).json({
      success: true,
      message: "Phone verified successfully! Your registration is complete. Please wait for admin approval.",
      data: {
        emailVerified:      user.isEmailVerified,
        smsVerified:        true,
        registrationNumber: user.registrationNumber,
      },
    });
  } catch (error) {
    console.error("SMS verification error:", error);
    return res.status(500).json({ success: false, message: "SMS verification failed", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const resendOTP = async (req, res) => {
  try {
    const { email, type } = req.body;
    if (!email || !type) {
      return res.status(400).json({ success: false, message: "Please provide email and OTP type" });
    }

    // Only students resend OTPs
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const newOTP     = makeOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (type === "email") {
      user.emailOTP   = newOTP;
      user.otpExpires = otpExpires;
      await user.save();
      await sendOTPEmail(user.email, newOTP, user.fullName);
    } else if (type === "sms") {
      user.smsOTP     = newOTP;
      user.otpExpires = otpExpires;
      await user.save();

      if (process.env.NODE_ENV === "production") {
        await sendOTPSMS(user.phone, newOTP, user.fullName);
      } else {
        await sendMockOTPSMS(user.phone, newOTP, user.fullName);
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP type" });
    }

    return res.status(200).json({ success: true, message: `New OTP sent to your ${type}` });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ success: false, message: "Failed to resend OTP", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login
//          • Student  → registrationNumber + password
//          • Admin    → email + password
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { registrationNumber, email, password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "Please provide password" });
    }

    let account = null;

    if (registrationNumber) {
      // ── Student login ────────────────────────────────────────
      account = await User.findOne({ registrationNumber }).select("+password");
      if (!account) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
      if (!account.isApproved) {
        return res.status(403).json({
          success: false,
          message: "Your registration is pending admin approval. Please wait.",
        });
      }
    } else if (email) {
      // ── Admin login ──────────────────────────────────────────
      account = await Admin.findOne({ email }).select("+password");
      if (!account) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide registrationNumber (student) or email (admin)",
      });
    }

    const isMatch = await account.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(account._id, account.role);

    // Role-specific response payload
    const payload =
      account.role === "admin"
        ? {
            id:           account._id,
            fullName:     account.fullName,
            email:        account.email,
            role:         account.role,
            isSuperAdmin: account.isSuperAdmin,
            permissions:  account.permissions,
          }
        : {
            id:                 account._id,
            fullName:           account.fullName,
            email:              account.email,
            registrationNumber: account.registrationNumber,
            role:               account.role,
            canTakeExam:        account.canTakeExam,
            examAttempted:      account.examAttempted,
          };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: { user: payload },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get current logged-in user / admin
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    // Check both collections based on role from JWT
    const account = req.user.role === 'admin'
      ? await Admin.findById(req.user.id)
      : await User.findById(req.user.id);

    return res.status(200).json({ success: true, data: { user: account } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching user data", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register Admin
// @route   POST /api/auth/register-admin
// @access  Private / Super-Admin
// ─────────────────────────────────────────────────────────────────────────────
export const registerAdmin = async (req, res) => {
  try {
    const { fullName, email, phone, password, isSuperAdmin, permissions } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "Please provide fullName, email, phone and password" });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });
    }

    const [existingUser, existingAdmin] = await Promise.all([
      User.findOne({ $or: [{ email }, { phone }] }),
      Admin.findOne({ $or: [{ email }, { phone }] }),
    ]);
    if (existingUser || existingAdmin) {
      return res.status(400).json({ success: false, message: "Admin with this email or phone already exists" });
    }

    // ✅ Use ADMIN discriminator — role:'admin' is set automatically
    const admin = await Admin.create({
      fullName, email, phone, password,
      isEmailVerified: true,            // admins skip OTP
      isSmsVerified:   true,
      isSuperAdmin:    isSuperAdmin  || false,
      permissions:     permissions   || undefined, // falls back to schema default
    });

    const token = generateToken(admin._id, admin.role);

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
      data: {
        admin: {
          id:           admin._id,
          fullName:     admin.fullName,
          email:        admin.email,
          role:         admin.role,
          isSuperAdmin: admin.isSuperAdmin,
          permissions:  admin.permissions,
        },
      },
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    return res.status(500).json({ success: false, message: "Admin registration failed", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all locations
// @route   GET /api/auth/locations
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    return res.status(200).json({ success: true, data: locations });
  } catch (err) {
    console.error("Error in getAllLocations:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export default {
  register, registerAdmin,
  verifyEmail, verifySMS, resendOTP,
  login, getMe,
  getAllLocations,
};