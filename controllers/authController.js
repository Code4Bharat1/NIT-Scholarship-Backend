import User from "../models/user.model.js";
import { generateToken, generatePassword } from "../utils/jwtUtils.js";
import { sendOTPEmail, sendCredentialsEmail, sendRegistrationConfirmationEmail } from "../utils/emailService.js";
import { sendOTPSMS, sendMockOTPSMS } from "../utils/Smsservice.js";
import Location from "../models/location.model.js";
import { sendWhatsAppOTP } from "../utils/whatsappService.js";
import { generateAdmitCard } from "../utils/generateAdmitCard.js"; // ✅ NEW

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
// export const register = async (req, res) => {
//   try {
//     const { fullName, email, phone, institution, state, city, subCity } = req.body;

//     if (!fullName || !email || !phone) {
//       return res.status(400).json({ success: false, message: "Please provide all required fields" });
//     }

//     if (!/^[0-9]{10}$/.test(phone)) {
//       return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });
//     }

//     const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: "User with this email or phone already exists" });
//     }

//     const tempPassword  = generatePassword();
//     const emailOTP      = Math.floor(100000 + Math.random() * 900000).toString();
//     const whatsappOTP   = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpires    = new Date(Date.now() + 10 * 60 * 1000);

//     let photoBase64 = null;
//     if (req.file) {
//       photoBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
//     }

//     const user = await User.create({
//       fullName, email, phone, institution,
//       password: tempPassword,
//       emailOTP, smsOTP: whatsappOTP, otpExpires,
//       state, city, subCity,
//       photo: photoBase64,
//     });

//     try { await sendOTPEmail(email, emailOTP, fullName); }
//     catch (e) { console.error("Error sending email OTP:", e); }

//     try { await sendWhatsAppOTP(phone, whatsappOTP, fullName); }
//     catch (e) { console.error("Error sending WhatsApp OTP:", e); }

//     res.status(201).json({
//       success: true,
//       message: "Registration successful! Please verify your email and WhatsApp number.",
//       data: {
//         userId: user._id,
//         registrationNumber: user.registrationNumber,
//         email: user.email,
//         phone: user.phone,
//       },
//     });
//   } catch (error) {
//     console.error("Registration error:", error);
//     res.status(500).json({ success: false, message: "Registration failed", error: error.message });
//   }
// };


export const register = async (req, res) => {
  try {

    const { fullName, email, phone, institution, state, city, subCity,preferredDate } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits"
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or phone already exists"
      });
    }

    const tempPassword = generatePassword();
    const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    let photoBase64 = null;

    if (req.file) {
      photoBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      institution,
      password: tempPassword,
      tempPassword,
      emailOTP,
      otpExpires,
      state,
      city,
      preferredDate, 
      subCity,
      photo: photoBase64
    });

    try {
      await sendOTPEmail(email, emailOTP, fullName);
    } catch (e) {
      console.error("Error sending email OTP:", e);
    }

    res.status(201).json({
      success: true,
      message: "Registration successful! Please verify your email.",
      data: {
        userId: user._id,
        registrationNumber: user.registrationNumber,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {

    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message
    });
  }
};



// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email
// @access  Public
// export const verifyEmail = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     if (!email || !otp) return res.status(400).json({ success: false, message: "Please provide email and OTP" });

//     const user = await User.findOne({
//       email, emailOTP: otp, otpExpires: { $gt: Date.now() },
//     }).select("+emailOTP +otpExpires");

//     if (!user) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

//     user.isEmailVerified = true;
//     user.emailOTP        = undefined;
//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Email verified successfully! Please verify your phone number.",
//       data: { emailVerified: true, smsVerified: user.isSmsVerified },
//     });
//   } catch (error) {
//     console.error("Email verification error:", error);
//     res.status(500).json({ success: false, message: "Email verification failed", error: error.message });
//   }
// };


export const verifyEmail = async (req, res) => {
  try {

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and OTP"
      });
    }

    const user = await User.findOne({
      email,
      emailOTP: otp,
      otpExpires: { $gt: Date.now() }
    }).select("+emailOTP +otpExpires +photo +password +tempPassword");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Email verify
    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.otpExpires = undefined;

    // Auto approve user
    user.isApproved = true;
    user.approvedAt = new Date();

    await user.save();

    // ✅ Send Admit Card Email
    sendAdmitCardEmail(user).catch(err =>
      console.error("[AdmitCard] Email failed:", err)
    );

    // ✅ Send Login Credentials Email
    sendCredentialsEmail(
      user.email,
      user.fullName,
      user.registrationNumber,
      user.tempPassword
    ).catch(err =>
      console.error("[Credentials] Email failed:", err)
    );

    res.status(200).json({
      success: true,
      message: "Email verified successfully! Registration completed.",
      data: {
        emailVerified: true,
        registrationNumber: user.registrationNumber
      }
    });

  } catch (error) {

    console.error("Email verification error:", error);

    res.status(500).json({
      success: false,
      message: "Email verification failed",
      error: error.message
    });
  }
};

// @desc    Verify SMS/WhatsApp OTP  ← sends admit card PDF email after verification
// @route   POST /api/auth/verify-sms
// @access  Public
export const verifySMS = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide phone and OTP"
      });
    }

    const user = await User.findOne({
      phone,
      smsOTP: otp,
      otpExpires: { $gt: Date.now() },
    }).select("+smsOTP +otpExpires +photo +password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Guard if already verified
    if (user.isSmsVerified) {
      return res.status(200).json({
        success: true,
        message: "Phone already verified.",
        data: {
          emailVerified: user.isEmailVerified,
          smsVerified: true,
          registrationNumber: user.registrationNumber,
        },
      });
    }

    // ✅ Verify SMS
    user.isSmsVerified = true;
    user.smsOTP = undefined;
    user.otpExpires = undefined;

    // ✅ Auto approve
    user.isApproved = true;
    user.approvedAt = new Date();

    await user.save();

    // ✅ Send Admit Card Email
    sendAdmitCardEmail(user).catch(err =>
      console.error("[AdmitCard] Email failed:", err)
    );

    // ✅ Send login credentials email
    sendCredentialsEmail(
      user.email,
      user.fullName,
      user.registrationNumber
    ).catch(err =>
      console.error("[Credentials] Email failed:", err)
    );

    return res.status(200).json({
      success: true,
      message: "Phone verified successfully! Registration completed.",
      data: {
        emailVerified: user.isEmailVerified,
        smsVerified: true,
        registrationNumber: user.registrationNumber,
      },
    });

  } catch (error) {
    console.error("SMS verification error:", error);

    return res.status(500).json({
      success: false,
      message: "SMS verification failed",
      error: error.message
    });
  }
};

// ── Helper: generate PDF and send admit card email ────────────
async function sendAdmitCardEmail(user) {
  // Generate the admit card PDF buffer
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

  // Send via your existing email service
  // This uses nodemailer — attach the buffer as a PDF
  await sendRegistrationConfirmationEmail(user.email, user.fullName, user.registrationNumber, pdfBuffer);
}


// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
  try {
    const { email, type } = req.body;
    if (!email || !type) return res.status(400).json({ success: false, message: "Please provide email and OTP type" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const newOTP     = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (type === "email") {
      user.emailOTP    = newOTP;
      user.otpExpires  = otpExpires;
      await user.save();
      await sendOTPEmail(user.email, newOTP, user.fullName);
    } else if (type === "sms") {
      user.smsOTP      = newOTP;
      user.otpExpires  = otpExpires;
      await user.save();
      if (process.env.NODE_ENV === "production") {
        await sendOTPSMS(user.phone, newOTP, user.fullName);
      } else {
        await sendMockOTPSMS(user.phone, newOTP, user.fullName);
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP type" });
    }

    res.status(200).json({ success: true, message: `New OTP sent to your ${type}` });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ success: false, message: "Failed to resend OTP", error: error.message });
  }
};


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { registrationNumber, password } = req.body;
    if (!registrationNumber || !password) {
      return res.status(400).json({ success: false, message: "Please provide registration number and password" });
    }

    const user = await User.findOne({ registrationNumber }).select("+password");
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    if (!user.isEmailVerified) {
      return res.status(403).json({ success: false, message: "Please complete email verification first" });
    }

    if (user.role === "user" && !user.isApproved) {
      return res.status(403).json({ success: false, message: "Your registration is pending admin approval. Please wait." });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user._id, user.role);
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        user: {
          id: user._id, fullName: user.fullName, email: user.email,
          registrationNumber: user.registrationNumber, role: user.role,
          canTakeExam: user.canTakeExam, examAttempted: user.examAttempted,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};


// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching user data", error: error.message });
  }
};


// @desc    Register Admin
// @route   POST /api/auth/register-admin
// @access  Private/Admin
export const registerAdmin = async (req, res) => {
  try {

    const { fullName, email, phone, password, state, city } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide fullName, email, phone and password"
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email or phone already exists"
      });
    }

    const admin = await User.create({
      fullName,
      email,
      phone,
      password,
      state,
      city,
      role: "admin",
      isEmailVerified: true,
      isSmsVerified: true,
      isApproved: true
    });

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: admin
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Admin registration failed",
      error: error.message
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

export default { register, registerAdmin, verifyEmail, verifySMS, resendOTP, login, getMe, getAllLocations };