import express from 'express';
import {
  getPendingUsers,
  getApprovedUsers,
  getAllUsers,
  approveUser,
  enableExamAccess,
  bulkEnableExam,
  getDashboardStats,
  getUserById
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(protect);
router.use(adminOnly);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/pending', getPendingUsers);
router.get('/users/approved', getApprovedUsers);
router.get('/users/:id', getUserById);
router.post('/users/:id/approve', approveUser);
router.post('/users/:id/enable-exam', enableExamAccess);
router.post('/users/bulk-enable-exam', bulkEnableExam);

export default router;