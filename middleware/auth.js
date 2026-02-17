import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
};

// User only middleware (approved users who can take exam)
export const approvedUserOnly = (req, res, next) => {
  if (req.user && req.user.role === 'user' && req.user.isApproved) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. User not approved or not a user.'
    });
  }
};

// Check if user can take exam
export const canTakeExam = (req, res, next) => {
  if (req.user && req.user.canTakeExam && !req.user.examAttempted) {
    next();
  } else if (req.user && req.user.examAttempted) {
    return res.status(403).json({
      success: false,
      message: 'You have already attempted the exam.'
    });
  } else {
    return res.status(403).json({
      success: false,
      message: 'Exam access not enabled. Please contact admin.'
    });
  }
};

export default { protect, adminOnly, approvedUserOnly, canTakeExam };