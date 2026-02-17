import express from 'express';
import {
  submitFeedback,
  getMyFeedback,
  getFeedbackStatus,
  getAllFeedbacks
} from '../controllers/feedbackController.js';
import { protect, approvedUserOnly, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All routes require login
router.use(protect);

// USER ROUTES
router.get('/status', approvedUserOnly, getFeedbackStatus);
router.post('/submit', approvedUserOnly, submitFeedback);
router.get('/my', approvedUserOnly, getMyFeedback);

// ADMIN ROUTE
router.get('/admin/all', adminOnly, getAllFeedbacks);

export default router;
