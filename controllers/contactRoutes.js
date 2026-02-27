import express from 'express';
import { contactAdmin, contactAdminPublic } from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ─── Public Route (anyone can contact) ────────────────────────────
router.post('/admin-public', contactAdminPublic);

// ─── Protected Route (logged in users) ────────────────────────────
router.post('/admin', protect, contactAdmin);

export default router;