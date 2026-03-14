// // NIT-Scholarship-Backend\controllers\authController.js


// import User from "../models/user.model.js";
// import { generateToken, generatePassword } from "../utils/jwtUtils.js";
// import { sendOTPEmail, sendCredentialsEmail, sendRegistrationConfirmationEmail } from "../utils/emailService.js";
// import { sendOTPSMS, sendMockOTPSMS } from "../utils/Smsservice.js";
// import Location from "../models/location.model.js";
// import { sendWhatsAppOTP, sendWhatsAppCredentials } from "../utils/whatsappService.js";
// import { generateAdmitCard } from "../utils/generateAdmitCard.js"; // ✅ NEW

// // @desc    Register new user
// // @route   POST /api/auth/register
// // @access  Public
// // export const register = async (req, res) => {
// //   try {
// //     const { fullName, email, phone, institution, state, city, subCity } = req.body;

// //     if (!fullName || !email || !phone) {
// //       return res.status(400).json({ success: false, message: "Please provide all required fields" });
// //     }

// //     if (!/^[0-9]{10}$/.test(phone)) {
// //       return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });
// //     }

// //     const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
// //     if (existingUser) {
// //       return res.status(400).json({ success: false, message: "User with this email or phone already exists" });
// //     }

// //     const tempPassword  = generatePassword();
// //     const emailOTP      = Math.floor(100000 + Math.random() * 900000).toString();
// //     const whatsappOTP   = Math.floor(100000 + Math.random() * 900000).toString();
// //     const otpExpires    = new Date(Date.now() + 10 * 60 * 1000);

// //     let photoBase64 = null;
// //     if (req.file) {
// //       photoBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
// //     }

// //     const user = await User.create({
// //       fullName, email, phone, institution,
// //       password: tempPassword,
// //       emailOTP, smsOTP: whatsappOTP, otpExpires,
// //       state, city, subCity,
// //       photo: photoBase64,
// //     });

// //     try { await sendOTPEmail(email, emailOTP, fullName); }
// //     catch (e) { console.error("Error sending email OTP:", e); }

// //     try { await sendWhatsAppOTP(phone, whatsappOTP, fullName); }
// //     catch (e) { console.error("Error sending WhatsApp OTP:", e); }

// //     res.status(201).json({
// //       success: true,
// //       message: "Registration successful! Please verify your email and WhatsApp number.",
// //       data: {
// //         userId: user._id,
// //         registrationNumber: user.registrationNumber,
// //         email: user.email,
// //         phone: user.phone,
// //       },
// //     });
// //   } catch (error) {
// //     console.error("Registration error:", error);
// //     res.status(500).json({ success: false, message: "Registration failed", error: error.message });
// //   }
// // };


// export const register = async (req, res) => {
//   try {

//     const { fullName, email, phone, institution, state, city, subCity, preferredDate } = req.body;

//     if (!fullName || !email || !phone) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide all required fields"
//       });
//     }

//     if (!/^[0-9]{10}$/.test(phone)) {
//       return res.status(400).json({
//         success: false,
//         message: "Phone number must be exactly 10 digits"
//       });
//     }

//     const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "User with this email or phone already exists"
//       });
//     }

//     const tempPassword = generatePassword();
//     const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
//     const whatsappOTP = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

//     let photoBase64 = null;

//     if (req.file) {
//       photoBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
//     }

//     const user = await User.create({
//       fullName,
//       email,
//       phone,
//       institution,
//       password: tempPassword,
//       tempPassword,
//       emailOTP,
//       smsOTP: whatsappOTP,
//       otpExpires,
//       state,
//       city,
//       preferredDate,
//       subCity,
//       photo: photoBase64
//     });

//     try {
//       await sendOTPEmail(email, emailOTP, fullName);
//       await sendWhatsAppOTP(phone, whatsappOTP, fullName);
//       console.log("Email OTP:", emailOTP);
//       console.log("WhatsApp OTP:", whatsappOTP);
//     } catch (e) {
//       console.error("Error sending email OTP:", e);
//       console.log("Email OTP:", emailOTP);
//       console.log("WhatsApp OTP:", whatsappOTP);
//     }

//     res.status(201).json({
//       success: true,
//       message: "Registration successful! Please verify your email.",
//       data: {
//         userId: user._id,
//         registrationNumber: user.registrationNumber,
//         email: user.email,
//         phone: user.phone
//       }
//     });

//   } catch (error) {

//     console.error("Registration error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Registration failed",
//       error: error.message
//     });
//   }
// };



// // @desc    Verify Email OTP
// // @route   POST /api/auth/verify-email
// // @access  Public
// // export const verifyEmail = async (req, res) => {
// //   try {
// //     const { email, otp } = req.body;
// //     if (!email || !otp) return res.status(400).json({ success: false, message: "Please provide email and OTP" });

// //     const user = await User.findOne({
// //       email, emailOTP: otp, otpExpires: { $gt: Date.now() },
// //     }).select("+emailOTP +otpExpires");

// //     if (!user) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

// //     user.isEmailVerified = true;
// //     user.emailOTP        = undefined;
// //     await user.save();

// //     res.status(200).json({
// //       success: true,
// //       message: "Email verified successfully! Please verify your phone number.",
// //       data: { emailVerified: true, smsVerified: user.isSmsVerified },
// //     });
// //   } catch (error) {
// //     console.error("Email verification error:", error);
// //     res.status(500).json({ success: false, message: "Email verification failed", error: error.message });
// //   }
// // };


// export const verifyEmail = async (req, res) => {
//   try {

//     const { email, otp } = req.body;

//     if (!email || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide email and OTP"
//       });
//     }

//     const user = await User.findOne({
//       email,
//       emailOTP: otp,
//       otpExpires: { $gt: Date.now() }
//     }).select("+emailOTP +otpExpires +photo +password +tempPassword");

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired OTP"
//       });
//     }

//     // Email verify
//     user.isEmailVerified = true;
//     user.emailOTP = undefined;
//     user.otpExpires = undefined;

//     // Auto approve user
//     user.isApproved = true;
//     user.approvedAt = new Date();

//     await user.save();

//     // await sendWhatsAppCredentials(
//     //   user.phone,
//     //   user.fullName,
//     //   user.registrationNumber,
//     //   user.tempPassword
//     // );


//     // ✅ Send Admit Card Email
//     sendAdmitCardEmail(user).catch(err =>
//       console.error("[AdmitCard] Email failed:", err)
//     );

//     // ✅ Send Login Credentials Email
//     sendCredentialsEmail(
//       user.email,
//       user.fullName,
//       user.registrationNumber,
//       user.tempPassword
//     ).catch(err =>
//       console.error("[Credentials] Email failed:", err)
//     );



//     res.status(200).json({
//       success: true,
//       message: "Email verified successfully! Registration completed.",
//       data: {
//         emailVerified: true,
//         registrationNumber: user.registrationNumber
//       }
//     });

//   } catch (error) {

//     console.error("Email verification error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Email verification failed",
//       error: error.message
//     });
//   }
// };

// // @desc    Verify SMS/WhatsApp OTP  ← sends admit card PDF email after verification
// // @route   POST /api/auth/verify-sms
// // @access  Public
// // export const verifySMS = async (req, res) => {
// //   try {
// //     const { phone, otp } = req.body;

// //     if (!phone || !otp) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Please provide phone and OTP"
// //       });
// //     }

// //     const user = await User.findOne({
// //       phone,
// //       smsOTP: otp,
// //       otpExpires: { $gt: Date.now() },
// //     }).select("+smsOTP +otpExpires +photo +password");

// //     if (!user) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Invalid or expired OTP"
// //       });
// //     }

// //     // Guard if already verified
// //     if (user.isSmsVerified) {
// //       return res.status(200).json({
// //         success: true,
// //         message: "Phone already verified.",
// //         data: {
// //           emailVerified: user.isEmailVerified,
// //           smsVerified: true,
// //           registrationNumber: user.registrationNumber,
// //         },
// //       });
// //     }

// //     // ✅ Verify SMS
// //     user.isSmsVerified = true;
// //     user.smsOTP = undefined;
// //     user.otpExpires = undefined;

// //     // ✅ Auto approve
// //     user.isApproved = true;
// //     user.approvedAt = new Date();

// //     await user.save();

// //     // ✅ Send Admit Card Email
// //     sendAdmitCardEmail(user).catch(err =>
// //       console.error("[AdmitCard] Email failed:", err)
// //     );

// //     // ✅ Send login credentials email
// //     sendCredentialsEmail(
// //       user.email,
// //       user.fullName,
// //       user.registrationNumber
// //     ).catch(err =>
// //       console.error("[Credentials] Email failed:", err)
// //     );

// //     return res.status(200).json({
// //       success: true,
// //       message: "Phone verified successfully! Registration completed.",
// //       data: {
// //         emailVerified: user.isEmailVerified,
// //         smsVerified: true,
// //         registrationNumber: user.registrationNumber,
// //       },
// //     });

// //   } catch (error) {
// //     console.error("SMS verification error:", error);

// //     return res.status(500).json({
// //       success: false,
// //       message: "SMS verification failed",
// //       error: error.message
// //     });
// //   }
// // };



// // export const verifySMS = async (req, res) => {
// //   try {

// //     const { phone, otp } = req.body;

// //     if (!phone || !otp) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Phone number and OTP are required"
// //       });
// //     }

// //     // User find karo
// //     const user = await User.findOne({

// //       phone: phone,
// //       smsOTP: otp,
// //       otpExpires: { $gt: Date.now() }
// //     }).select("+smsOTP +otpExpires");

// //     if (!user) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Invalid or expired OTP"
// //       });
// //     }

// //     // Agar already verified hai
// //     if (user.isSmsVerified) {
// //       return res.status(200).json({
// //         success: true,
// //         message: "Phone number already verified"
// //       });
// //     }

// //     // OTP verify
// //     user.isSmsVerified = true;
// //     user.smsOTP = undefined;
// //     user.otpExpires = undefined;

// //     await user.save();

// //     return res.status(200).json({
// //       success: true,
// //       message: "Phone number verified successfully",
// //       data: {
// //         phoneVerified: true,
// //         registrationNumber: user.registrationNumber
// //       }
// //     });

// //   } catch (error) {

// //     console.error("SMS Verification Error:", error);

// //     return res.status(500).json({
// //       success: false,
// //       message: "SMS verification failed",
// //       error: error.message
// //     });
// //   }
// // };


// export const verifySMS = async (req, res) => {
//   try {

//     const { phone, otp } = req.body;

//     if (!phone || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Phone number and OTP are required"
//       });
//     }

//     const phoneNumber = phone.toString().trim();
//     const otpCode = otp.toString().trim();

//     console.log("Verify Request:", phoneNumber, otpCode);

//     // User find karo
//     const user = await User.findOne({ phone: phoneNumber })
//       .select("+smsOTP +otpExpires");

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     console.log("DB OTP:", user.smsOTP);
//     console.log("Entered OTP:", otpCode);

//     // OTP check
//     if (user.smsOTP !== otpCode || user.otpExpires < Date.now()) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired OTP"
//       });
//     }

//     // Already verified
//     if (user.isSmsVerified) {
//       return res.status(200).json({
//         success: true,
//         message: "Phone already verified"
//       });
//     }

//     // Verify
//     user.isSmsVerified = true;
//     user.smsOTP = undefined;
//     user.otpExpires = undefined;

//     await user.save();
//     await sendWhatsAppCredentials(
//       user.phone,
//       user.fullName,
//       user.registrationNumber,
//       user.tempPassword
//     );


//     return res.status(200).json({
//       success: true,
//       message: "Phone verified successfully",
//       data: {
//         phoneVerified: true,
//         registrationNumber: user.registrationNumber
//       }
//     });

//   } catch (error) {

//     console.error("SMS Verification Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "SMS verification failed",
//       error: error.message
//     });
//   }
// };

// // ── Helper: generate PDF and send admit card email ────────────
// async function sendAdmitCardEmail(user) {
//   // Generate the admit card PDF buffer
//   const pdfBuffer = await generateAdmitCard({
//     registrationNumber: user.registrationNumber,
//     fullName: user.fullName,
//     email: user.email,
//     phone: user.phone,
//     institution: user.institution,
//     state: user.state,
//     city: user.city,
//     subCity: user.subCity,
//     photo: user.photo,
//   });

//   // Send via your existing email service
//   // This uses nodemailer — attach the buffer as a PDF
//   await sendRegistrationConfirmationEmail(user.email, user.fullName, user.registrationNumber, pdfBuffer);
// }




// // @desc    Resend OTP
// // @route   POST /api/auth/resend-otp
// // @access  Public
// export const resendOTP = async (req, res) => {
//   try {
//     const { email, type } = req.body;
//     if (!email || !type) return res.status(400).json({ success: false, message: "Please provide email and OTP type" });

//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });

//     const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

//     if (type === "email") {
//       user.emailOTP = newOTP;
//       user.otpExpires = otpExpires;
//       await user.save();
//       await sendOTPEmail(user.email, newOTP, user.fullName);
//     } else if (type === "sms") {

//       user.smsOTP = newOTP.toString();
//       user.otpExpires = otpExpires;

//       await user.save();

//       try {

//         await sendWhatsAppOTP(user.phone, newOTP, user.fullName);

//         console.log("WhatsApp OTP Resent:", newOTP);

//       } catch (err) {

//         console.error("WhatsApp resend error:", err);

//       }

//     } else {
//       return res.status(400).json({ success: false, message: "Invalid OTP type" });
//     }

//     res.status(200).json({ success: true, message: `New OTP sent to your ${type}` });
//   } catch (error) {
//     console.error("Resend OTP error:", error);
//     res.status(500).json({ success: false, message: "Failed to resend OTP", error: error.message });
//   }
// };


// // @desc    Login user
// // @route   POST /api/auth/login
// // @access  Public
// export const login = async (req, res) => {
//   try {
//     const { registrationNumber, password } = req.body;
//     if (!registrationNumber || !password) {
//       return res.status(400).json({ success: false, message: "Please provide registration number and password" });
//     }

//     const user = await User.findOne({ registrationNumber }).select("+password");
//     if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

//     if (!user.isEmailVerified) {
//       return res.status(403).json({ success: false, message: "Please complete email verification first" });
//     }

//     if (user.role === "user" && !user.isApproved) {
//       return res.status(403).json({ success: false, message: "Your registration is pending admin approval. Please wait." });
//     }

//     const isPasswordMatch = await user.comparePassword(password);
//     if (!isPasswordMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

//     const token = generateToken(user._id, user.role);
//     user.password = undefined;

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       data: {
//         user: {
//           id: user._id, fullName: user.fullName, email: user.email,
//           registrationNumber: user.registrationNumber, role: user.role,
//           canTakeExam: user.canTakeExam, examAttempted: user.examAttempted,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ success: false, message: "Login failed", error: error.message });
//   }
// };


// // @desc    Get current logged in user
// // @route   GET /api/auth/me
// // @access  Private
// export const getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     res.status(200).json({ success: true, data: { user } });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error fetching user data", error: error.message });
//   }
// };


// // @desc    Register Admin
// // @route   POST /api/auth/register-admin
// // @access  Private/Admin
// export const registerAdmin = async (req, res) => {
//   try {

//     const { fullName, email, phone, password, state, city } = req.body;

//     if (!fullName || !email || !phone || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide fullName, email, phone and password"
//       });
//     }

//     const existingUser = await User.findOne({
//       $or: [{ email }, { phone }]
//     });

//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "Admin with this email or phone already exists"
//       });
//     }

//     const admin = await User.create({
//       fullName,
//       email,
//       phone,
//       password,
//       state,
//       city,
//       role: "admin",
//       isEmailVerified: true,
//       isSmsVerified: true,
//       isApproved: true
//     });

//     res.status(201).json({
//       success: true,
//       message: "Admin registered successfully",
//       data: admin
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Admin registration failed",
//       error: error.message
//     });
//   }
// };

// export const getAllLocations = async (req, res) => {
//   try {
//     const locations = await Location.find();
//     res.status(200).json({ success: true, data: locations });
//   } catch (err) {
//     console.error("Error in getAllLocations:", err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// export default { register, registerAdmin, verifyEmail, verifySMS, resendOTP, login, getMe, getAllLocations };
import User from "../models/user.model.js";
import PendingRegistration from "../models/pendingRegistration.model.js";
import { generateToken, generatePassword } from "../utils/jwtUtils.js";
import {
  sendOTPEmail,
  sendCredentialsEmail,
  sendRegistrationConfirmationEmail
} from "../utils/emailService.js";
import { sendWhatsAppOTP, sendWhatsAppCredentials } from "../utils/whatsappService.js";
import Location from "../models/location.model.js";
import { generateAdmitCard } from "../utils/generateAdmitCard.js";

// ─────────────────────────────────────────────
// @route POST /api/auth/register
// ─────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { fullName, email, phone, institution, state, city, subCity, preferredDate } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });
    }

    // ✅ Real User collection mein check
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email or phone already exists" });
    }

    const tempPassword = generatePassword();
    const emailOTP     = Math.floor(100000 + Math.random() * 900000).toString();
    const smsOTP       = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires   = new Date(Date.now() + 10 * 60 * 1000);

    let photoBase64 = null;
    if (req.file) {
      photoBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    // ✅ Purana pending hata do (retry case)
    await PendingRegistration.deleteOne({ $or: [{ email }, { phone }] });

    await PendingRegistration.create({
      fullName, email, phone, institution,
      state, city, subCity, preferredDate,
      photo: photoBase64,
      tempPassword,
      emailOTP,
      smsOTP,
      otpExpires,
    });

    try {
      await sendOTPEmail(email, emailOTP, fullName);
      await sendWhatsAppOTP(phone, smsOTP, fullName);
      // console.log("Email OTP:", emailOTP);
      // console.log("WhatsApp OTP:", smsOTP);
    } catch (e) {
      console.error("OTP send error:", e);
      // console.log("Email OTP:", emailOTP);
      // console.log("WhatsApp OTP:", smsOTP);
    }

    res.status(201).json({
      success: true,
      message: "OTPs sent! Please verify your email and WhatsApp number.",
      data: { email, phone },
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Registration failed", error: error.message });
  }
};

// ─────────────────────────────────────────────
// @route POST /api/auth/verify-email
// ─────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Please provide email and OTP" });
    }

    const pending = await PendingRegistration.findOne({ email });

    if (!pending) {
      return res.status(400).json({
        success: false,
        message: "No pending registration found. Please register again."
      });
    }

    if (pending.emailOTP !== otp.toString().trim() || pending.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    pending.isEmailVerified = true;
    pending.emailOTP = undefined;
    await pending.save();

    // ✅ Dono verify ho gaye — User banao
    if (pending.isSmsVerified) {
      const user = await createVerifiedUser(pending);
      return res.status(200).json({
        success: true,
        message: "Email verified! Registration completed.",
        data: {
          emailVerified: true,
          smsVerified: true,
          fullyRegistered: true,
          registrationNumber: user.registrationNumber,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Email verified! Please verify your WhatsApp OTP.",
      data: { emailVerified: true, smsVerified: false },
    });

  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ success: false, message: "Email verification failed", error: error.message });
  }
};

// ─────────────────────────────────────────────
// @route POST /api/auth/verify-sms
// ─────────────────────────────────────────────
export const verifySMS = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "Phone number and OTP are required" });
    }

    const phoneNumber = phone.toString().trim();
    const otpCode     = otp.toString().trim();

    // console.log("Verify SMS Request:", phoneNumber, otpCode);

    // ✅ PendingRegistration mein dhundo
    const pending = await PendingRegistration.findOne({ phone: phoneNumber });

    if (!pending) {
      return res.status(404).json({
        success: false,
        message: "No pending registration found. Please register again."
      });
    }

    // console.log("DB OTP:", pending.smsOTP);
    // console.log("Entered OTP:", otpCode);

    if (pending.smsOTP !== otpCode || pending.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    if (pending.isSmsVerified) {
      return res.status(200).json({ success: true, message: "Phone already verified" });
    }

    pending.isSmsVerified = true;
    pending.smsOTP = undefined;
    await pending.save();

    // ✅ Dono verify ho gaye — User banao
    if (pending.isEmailVerified) {
      const user = await createVerifiedUser(pending);
      return res.status(200).json({
        success: true,
        message: "Phone verified! Registration completed.",
        data: {
          emailVerified: true,
          smsVerified: true,
          fullyRegistered: true,
          registrationNumber: user.registrationNumber,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Phone verified! Please verify your email OTP.",
      data: { emailVerified: false, smsVerified: true },
    });

  } catch (error) {
    console.error("SMS Verification Error:", error);
    res.status(500).json({ success: false, message: "SMS verification failed", error: error.message });
  }
};

// ─────────────────────────────────────────────
// @route POST /api/auth/resend-otp
// ─────────────────────────────────────────────
export const resendOTP = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email || !type) {
      return res.status(400).json({ success: false, message: "Please provide email and OTP type" });
    }

    // ✅ Pehle pending mein dhundo
    const pending = await PendingRegistration.findOne({ email });
    const user    = !pending ? await User.findOne({ email }) : null;
    const target  = pending || user;

    if (!target) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const newOTP     = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (type === "email") {
      target.emailOTP   = newOTP;
      target.otpExpires = otpExpires;
      await target.save();
      await sendOTPEmail(email, newOTP, target.fullName);
    } else if (type === "sms") {
      target.smsOTP     = newOTP;
      target.otpExpires = otpExpires;
      await target.save();
      try {
        await sendWhatsAppOTP(target.phone, newOTP, target.fullName);
        // console.log("WhatsApp OTP Resent:", newOTP);
      } catch (err) {
        console.error("WhatsApp resend error:", err);
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

// ─────────────────────────────────────────────
// @route POST /api/auth/login
// ─────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { registrationNumber, password } = req.body;

    if (!registrationNumber || !password) {
      return res.status(400).json({ success: false, message: "Please provide registration number and password" });
    }

    const user = await User.findOne({ registrationNumber }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ success: false, message: "Please complete email verification first" });
    }

    if (user.role === "user" && !user.isApproved) {
      return res.status(403).json({ success: false, message: "Your registration is pending admin approval. Please wait." });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);
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
    res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};

// ─────────────────────────────────────────────
// @route GET /api/auth/me
// ─────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching user data", error: error.message });
  }
};

// ─────────────────────────────────────────────
// @route POST /api/auth/register-admin
// ─────────────────────────────────────────────
export const registerAdmin = async (req, res) => {
  try {
    const { fullName, email, phone, password, state, city } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "Please provide fullName, email, phone and password" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Admin with this email or phone already exists" });
    }

    const admin = await User.create({
      fullName, email, phone, password,
      state, city,
      role: "admin",
      isEmailVerified: true,
      isSmsVerified: true,
      isApproved: true,
    });

    res.status(201).json({ success: true, message: "Admin registered successfully", data: admin });

  } catch (error) {
    res.status(500).json({ success: false, message: "Admin registration failed", error: error.message });
  }
};

// ─────────────────────────────────────────────
// @route GET /api/auth/locations
// ─────────────────────────────────────────────
export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).json({ success: true, data: locations });
  } catch (err) {
    console.error("Error in getAllLocations:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// ✅ Helper — dono OTP verify hone ke baad User banao
// ─────────────────────────────────────────────
async function createVerifiedUser(pending) {
  // Race condition guard
  const existing = await User.findOne({
    $or: [{ email: pending.email }, { phone: pending.phone }]
  });
  if (existing) {
    await PendingRegistration.deleteOne({ _id: pending._id });
    return existing;
  }

  const user = await User.create({
    fullName:        pending.fullName,
    email:           pending.email,
    phone:           pending.phone,
    institution:     pending.institution,
    state:           pending.state,
    city:            pending.city,
    subCity:         pending.subCity,
    preferredDate:   pending.preferredDate,
    photo:           pending.photo,
    password:        pending.tempPassword,
    tempPassword:    pending.tempPassword,
    isEmailVerified: true,
    isSmsVerified:   true,
    isApproved:      true,
    approvedAt:      new Date(),
  });

  // ✅ Pending record delete karo
  await PendingRegistration.deleteOne({ _id: pending._id });

  // ✅ Admit card email
  sendAdmitCardEmail(user).catch(err =>
    console.error("[AdmitCard] Email failed:", err)
  );

  // ✅ Login credentials email
  sendCredentialsEmail(
    user.email,
    user.fullName,
    user.registrationNumber,
    pending.tempPassword
  ).catch(err =>
    console.error("[Credentials] Email failed:", err)
  );

  // ✅ WhatsApp credentials
  sendWhatsAppCredentials(
    user.phone,
    user.fullName,
    user.registrationNumber,
    pending.tempPassword
  ).catch(err =>
    console.error("[WhatsApp Credentials] failed:", err)
  );

  return user;
}

// ─────────────────────────────────────────────
// ✅ Helper — Admit card PDF generate karke email bhejo
// ─────────────────────────────────────────────
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

export default {
  register,
  registerAdmin,
  verifyEmail,
  verifySMS,
  resendOTP,
  login,
  getMe,
  getAllLocations,
};