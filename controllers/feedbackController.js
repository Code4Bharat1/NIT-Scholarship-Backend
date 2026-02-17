import Feedback from '../models/feedback.model.js';
import User from '../models/user.model.js';

// @desc    Submit feedback (after exam)
// @route   POST /api/feedback/submit
// @access  Private/User (must have attempted exam)
export const submitFeedback = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Only allow feedback if exam has been attempted
    if (!user.examAttempted) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit feedback after attempting the exam'
      });
    }

    // Check if feedback already submitted
    const existingFeedback = await Feedback.findOne({ user: req.user.id });
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback'
      });
    }

    const {
      overallExperience,
      examInterfaceRating,
      examDifficulty,
      wasExamFair,
      facedTechnicalIssues,
      technicalIssueDescription,
      suggestions,
      comments,
      wouldRecommend
    } = req.body;

    // Validate required field
    if (!overallExperience) {
      return res.status(400).json({
        success: false,
        message: 'Overall experience rating is required'
      });
    }

    const feedback = await Feedback.create({
      user: req.user.id,
      overallExperience,
      examInterfaceRating,
      examDifficulty,
      wasExamFair,
      facedTechnicalIssues,
      technicalIssueDescription: facedTechnicalIssues ? technicalIssueDescription : undefined,
      suggestions,
      comments,
      wouldRecommend
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you!',
      data: { feedbackId: feedback._id }
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
};

// @desc    Get my feedback
// @route   GET /api/feedback/my
// @access  Private/User
export const getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ user: req.user.id });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'No feedback submitted yet'
      });
    }

    res.status(200).json({
      success: true,
      data: { feedback }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
};

// @desc    Get feedback status (has user submitted feedback?)
// @route   GET /api/feedback/status
// @access  Private/User
export const getFeedbackStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const feedback = await Feedback.findOne({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        examAttempted: user.examAttempted,
        feedbackSubmitted: !!feedback,
        canSubmitFeedback: user.examAttempted && !feedback
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback status',
      error: error.message
    });
  }
};

// ─────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────

// @desc    Get all feedbacks (admin)
// @route   GET /api/feedback/admin/all
// @access  Private/Admin
export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate({ path: 'user', select: 'fullName email registrationNumber' })
      .sort({ createdAt: -1 });

    // Aggregate stats
    const total = feedbacks.length;
    const avgRating = total
      ? (feedbacks.reduce((sum, f) => sum + f.overallExperience, 0) / total).toFixed(2)
      : 0;
    const technicalIssuesCount = feedbacks.filter(f => f.facedTechnicalIssues).length;
    const wouldRecommendCount = feedbacks.filter(f => f.wouldRecommend).length;

    res.status(200).json({
      success: true,
      count: total,
      stats: {
        averageRating: parseFloat(avgRating),
        technicalIssuesReported: technicalIssuesCount,
        wouldRecommend: wouldRecommendCount
      },
      data: { feedbacks }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching feedbacks',
      error: error.message
    });
  }
};

export default {
  submitFeedback,
  getMyFeedback,
  getFeedbackStatus,
  getAllFeedbacks
};