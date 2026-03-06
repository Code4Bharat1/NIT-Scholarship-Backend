import express from 'express';
import {
  getPendingUsers,
  getApprovedUsers,
  getAllUsers,
  approveUser,
  enableExamAccess,
  bulkEnableExam,
  getDashboardStats,
  getUserById,
  publishResults,
  sendLastChanceReminder,
  sendRescheduleReminder,
  sendExamReminder,         // ✅ add kiya
} from '../controllers/adminController.js';

// ✅ NEW: import export controllers
import { exportUsersCSV, exportUsersPDF } from '../controllers/adminexport.js';

import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(protect);
router.use(adminOnly);

// ── Dashboard ────────────────────────────────────────────────
router.get('/dashboard/stats', getDashboardStats);

// ── User management ──────────────────────────────────────────
router.get('/users',                        getAllUsers);
router.get('/users/pending',                getPendingUsers);
router.get('/users/approved',               getApprovedUsers);
router.get('/users/:id',                    getUserById);
router.post('/users/:id/approve',           approveUser);
router.post('/users/:id/enable-exam',       enableExamAccess);
router.post('/users/:id/send-reminder',     sendExamReminder);   // ✅ add kiya
router.post('/users/bulk-enable-exam',      bulkEnableExam);

// ── Results ──────────────────────────────────────────────────
router.post('/results/publish', publishResults);

// ── ✅ Export routes ──────────────────────────────────────────
router.get('/export/csv', exportUsersCSV);
router.get('/export/pdf', exportUsersPDF);

// ── Reminders ────────────────────────────────────────────────
router.post('/send-reschedule-reminder',    sendRescheduleReminder);
router.post('/send-last-chance-reminder',   sendLastChanceReminder);

export default router;