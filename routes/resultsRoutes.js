import express from 'express';
import {
  getAllResults,
  getLeaderboard,
  getResultById,
  getResultByUserId,
  getResultsStats,
  exportResults
} from '../controllers/resultsController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(protect);
router.use(adminOnly);

// Results routes
router.get('/', getAllResults);
router.get('/leaderboard', getLeaderboard);
router.get('/stats', getResultsStats);
router.get('/export', exportResults);
router.get('/:id', getResultById);
router.get('/user/:userId', getResultByUserId);

export default router;