import User from "../models/user.model.js";
import { generateToken, generatePassword } from "../utils/jwtUtils.js";
import { sendOTPEmail, sendCredentialsEmail } from "../utils/Emailservice.js";
import { sendOTPSMS, sendMockOTPSMS } from "../utils/Smsservice.js";
import Location from "../models/location.model.js";

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    
    const { fullName, email, phone, institution ,state,city,subCity} = req.body;

    // Validate required fields
    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits",
      });
    }
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or phone already exists",
      });
    }

    // Generate temporary password
    const tempPassword = generatePassword();

    // Generate OTPs
    const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const smsOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Handle photo upload
    let photoBase64 = null;
    if (req.file) {
      photoBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      institution,
      password: tempPassword,
      emailOTP,
      smsOTP,
      otpExpires,
      state,
      city,
      subCity,
      photo: photoBase64,
    });

    // Send OTP via email
    try {
      await sendOTPEmail(email, emailOTP, fullName);
    } catch (error) {
      console.error("Error sending email OTP:", error);
    }

    // Send OTP via SMS (use mock in development)
    try {
      if (process.env.NODE_ENV === "production") {
        await sendOTPSMS(phone, smsOTP, fullName);
      } else {
        await sendMockOTPSMS(phone, smsOTP, fullName);
      }
    } catch (error) {
      console.error("Error sending SMS OTP:", error);
    }

    res.status(201).json({
      success: true,
      message:
        "Registration successful! Please verify your email and phone number.",
      data: {
        userId: user._id,
        registrationNumber: user.registrationNumber,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and OTP",
      });
    }

    // Find user with email and OTP
    const user = await User.findOne({
      email,
      emailOTP: otp,
      otpExpires: { $gt: Date.now() },
    }).select("+emailOTP +otpExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailOTP = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully! Please verify your phone number.",
      data: {
        emailVerified: true,
        smsVerified: user.isSmsVerified,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Email verification failed",
      error: error.message,
    });
  }
};

// @desc    Verify SMS OTP
// @route   POST /api/auth/verify-sms
// @access  Public
export const verifySMS = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide phone and OTP",
      });
    }

    // Find user with phone and OTP
    const user = await User.findOne({
      phone,
      smsOTP: otp,
      otpExpires: { $gt: Date.now() },
    }).select("+smsOTP +otpExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Verify SMS
    user.isSmsVerified = true;
    user.smsOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Phone verified successfully! Your registration is complete. Please wait for admin approval.",
      data: {
        emailVerified: user.isEmailVerified,
        smsVerified: true,
        registrationNumber: user.registrationNumber,
      },
    });
  } catch (error) {
    console.error("SMS verification error:", error);
    res.status(500).json({
      success: false,
      message: "SMS verification failed",
      error: error.message,
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
  try {
    const { email, type } = req.body; // type: 'email' or 'sms'

    if (!email || !type) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and OTP type",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate new OTP
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (type === "email") {
      user.emailOTP = newOTP;
      user.otpExpires = otpExpires;
      await user.save();
      await sendOTPEmail(user.email, newOTP, user.fullName);
    } else if (type === "sms") {
      user.smsOTP = newOTP;
      user.otpExpires = otpExpires;
      await user.save();

      if (process.env.NODE_ENV === "production") {
        await sendOTPSMS(user.phone, newOTP, user.fullName);
      } else {
        await sendMockOTPSMS(user.phone, newOTP, user.fullName);
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP type",
      });
    }

    res.status(200).json({
      success: true,
      message: `New OTP sent to your ${type}`,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { registrationNumber, password } = req.body;

    if (!registrationNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide registration number and password",
      });
    }

    // Find user and include password
    const user = await User.findOne({ registrationNumber }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if email and SMS are verified
    if (!user.isEmailVerified || !user.isSmsVerified) {
      return res.status(403).json({
        success: false,
        message: "Please complete email and SMS verification first",
      });
    }

    // Check if user is approved (only for regular users)
    if (user.role === "user" && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your registration is pending admin approval. Please wait.",
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          registrationNumber: user.registrationNumber,
          role: user.role,
          canTakeExam: user.canTakeExam,
          examAttempted: user.examAttempted,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user data",
      error: error.message,
    });
  }
};

// @desc    Register Admin (protected - only existing admin can create new admin)
// @route   POST /api/auth/register-admin
// @access  Private/Admin
export const registerAdmin = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide fullName, email, phone and password",
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email or phone already exists",
      });
    }

    const admin = await User.create({
      fullName,
      email,
      phone,
      password,
      role: "admin",
      isEmailVerified: true,
      isSmsVerified: true,
      isApproved: true,
    });

    const token = generateToken(admin._id, admin.role);

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
      data: {
        admin: {
          id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          registrationNumber: admin.registrationNumber,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Admin registration failed",
      error: error.message,
    });
  }
};

export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).json({ success: true, data: locations });
  } catch (err) {
    console.error("Error in getAllLocations:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default {
  register,
  registerAdmin,
  verifyEmail,
  verifySMS,
  resendOTP,
  login,
  getMe,
  getAllLocations
};