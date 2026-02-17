import express from 'express';
import {
  getExamQuestions,
  submitExam,
  getMyResult,
  getExamStatus
} from '../controllers/examController.js';
import { protect, approvedUserOnly, canTakeExam } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);
router.use(approvedUserOnly);

// Exam routes
router.get('/status', getExamStatus);
router.get('/questions', canTakeExam, getExamQuestions);
router.post('/submit', submitExam);
router.get('/result', getMyResult);

export default router;