import express from 'express';
import {
  submitFeedback,
  getMyFeedback,
  getFeedbackStatus,
  getAllFeedbacks
} from '../controllers/feedbackController.js';
import { protect, approvedUserOnly, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(approvedUserOnly);

// User routes
router.get('/status', getFeedbackStatus);       // Check if feedback submitted
router.post('/submit', submitFeedback);          // Submit feedback
router.get('/my', getMyFeedback);                // Get own feedback

// Admin routes
router.get('/admin/all', adminOnly, getAllFeedbacks); // Get all feedbacks with stats

export default router;