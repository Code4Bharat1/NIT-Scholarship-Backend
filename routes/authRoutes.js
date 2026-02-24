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

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/register-admin', registerAdmin);
router.post('/verify-email', verifyEmail);
router.post('/verify-sms', verifySMS);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.get("/locations", getAllLocations);

// Protected routes
router.get('/me', protect, getMe);

export default router;