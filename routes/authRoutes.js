import express from 'express';
import { 
  register, 
  verifyEmail, 
  verifySMS, 
  resendOTP, 
  login,
  getMe, 
  registerAdmin,
  getAllLocations
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import multer from "multer";
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB max
});
const router = express.Router();

// Public routes
router.post('/register', upload.single("photo"), register); // ← sirf yahi rakho
router.post('/register-admin', registerAdmin);
router.post('/verify-email', verifyEmail);
router.post('/verify-sms', verifySMS);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.get("/locations", getAllLocations);

// Protected routes
router.get('/me', protect, getMe);

export default router;