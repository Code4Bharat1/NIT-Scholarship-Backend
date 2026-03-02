import User from '../models/user.model.js';
import Result from '../models/result.model.js';
import { generatePassword } from '../utils/jwtUtils.js';
import { sendCredentialsEmail, sendExamNotificationEmail } from '../utils/Emailservice.js';
import ExamDate from '../models/examdate.model.js';

// ✅ Timezone-safe date converter (fixes UTC → IST shifting bug)
// MongoDB Date objects at midnight UTC become previous day in IST (+5:30)
const toDateString = (d) => {
  if (!d) return null;
  if (typeof d === 'string') return d.slice(0, 10);
  const ist = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
  return ist.toISOString().slice(0, 10);
};

// @desc    Get all pending users (waiting for approval)
// @route   GET /api/admin/users/pending
// @access  Private/Admin
export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      role: 'user',
      isEmailVerified: true,
      isSmsVerified: true,
      isApproved: false
    }).select('-password').sort({ createdAt: 1 }); // oldest first for correct date assignment

    res.status(200).json({
      success: true,
      count: pendingUsers.length,
      data: { users: pendingUsers }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending users',
      error: error.message
    });
  }
};

// @desc    Get all approved users
// @route   GET /api/admin/users/approved
// @access  Private/Admin
export const getApprovedUsers = async (req, res) => {
  try {
    const approvedUsers = await User.find({
      role: 'user',
      isApproved: true
    }).select('-password').sort({ approvedAt: -1 });

    res.status(200).json({
      success: true,
      count: approvedUsers.length,
      data: { users: approvedUsers }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching approved users',
      error: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;

    let query = { role: 'user' };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'pending') {
      query.isApproved = false;
      query.isEmailVerified = true;
      query.isSmsVerified = true;
    } else if (status === 'approved') {
      query.isApproved = true;
    } else if (status === 'attempted') {
      query.examAttempted = true;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: { users }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Approve user and send credentials
// @route   POST /api/admin/users/:id/approve
// @access  Private/Admin
export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isApproved) return res.status(400).json({ success: false, message: 'User is already approved' });
    if (!user.isEmailVerified || !user.isSmsVerified) {
      return res.status(400).json({ success: false, message: 'User must complete verification first' });
    }

    // ── Auto assign exam date based on registration order ──
    const examDates = await ExamDate.findOne().sort({ createdAt: -1 });
    if (examDates) {
      const totalApproved = await User.countDocuments({ role: 'user', isApproved: true });

      // ✅ toDateString() — timezone-safe, prevents UTC midnight → IST previous day bug
      if (totalApproved < 3334) {
        user.examDate = toDateString(examDates.date1);
      } else if (totalApproved < 6667) {
        user.examDate = toDateString(examDates.date2);
      } else {
        user.examDate = toDateString(examDates.date3);
      }
    }

    const newPassword = generatePassword();
    const plainPassword = newPassword;
    user.password = newPassword;
    user.isApproved = true;
    user.approvedBy = req.user.id;
    user.approvedAt = new Date();
    await user.save();

    try {
      await sendCredentialsEmail(
        user.email,
        user.fullName,
        user.registrationNumber,
        plainPassword,
        user.examDate
      );
    } catch (error) {
      console.error('Error sending credentials email:', error);
    }

    res.status(200).json({
      success: true,
      message: 'User approved successfully. Credentials sent via email.',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          registrationNumber: user.registrationNumber,
          isApproved: user.isApproved,
          examDate: user.examDate
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error approving user', error: error.message });
  }
};

// @desc    Enable exam access for user
// @route   POST /api/admin/users/:id/enable-exam
// @access  Private/Admin
export const enableExamAccess = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (!user.isApproved) {
      return res.status(400).json({ success: false, message: 'User must be approved first' });
    }
    if (user.examAttempted) {
      return res.status(400).json({ success: false, message: 'User has already attempted the exam' });
    }

    user.canTakeExam = true;
    await user.save();

    try {
      await sendExamNotificationEmail(user.email, user.fullName);
    } catch (error) {
      console.error('Error sending exam notification:', error);
    }

    res.status(200).json({
      success: true,
      message: 'Exam access enabled successfully. Notification sent.',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          canTakeExam: user.canTakeExam
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error enabling exam access',
      error: error.message
    });
  }
};

// @desc    Bulk enable exam access
// @route   POST /api/admin/users/bulk-enable-exam
// @access  Private/Admin
export const bulkEnableExam = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of user IDs'
      });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds }, isApproved: true, examAttempted: false },
      { canTakeExam: true }
    );

    res.status(200).json({
      success: true,
      message: `Exam access enabled for ${result.modifiedCount} users`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error enabling bulk exam access',
      error: error.message
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const pendingApproval = await User.countDocuments({
      role: 'user',
      isEmailVerified: true,
      isSmsVerified: true,
      isApproved: false
    });
    const approvedUsers = await User.countDocuments({ role: 'user', isApproved: true });
    const examEnabled = await User.countDocuments({ role: 'user', canTakeExam: true, examAttempted: false });
    const examAttempted = await User.countDocuments({ role: 'user', examAttempted: true });
    const totalResults = await Result.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          pendingApproval,
          approvedUsers,
          examEnabled,
          examAttempted,
          totalResults
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// @desc    Get user details by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const result = await Result.findOne({ user: user._id });

    res.status(200).json({
      success: true,
      data: { user, result }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message
    });
  }
};

// @desc    Publish all results
// @route   POST /api/admin/results/publish
// @access  Private/Admin
export const publishResults = async (req, res) => {
  try {
    const result = await Result.updateMany({}, { resultPublished: true });

    res.status(200).json({
      success: true,
      message: "Results published successfully",
      updated: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error publishing results",
      error: error.message,
    });
  }
};

// @desc    Save exam dates
// @route   POST /api/admin/exam-dates
// @access  Private/Admin
export const setExamDates = async (req, res) => {
  try {
    const { date1, date2, date3 } = req.body;

    if (!date1 || !date2 || !date3) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all 3 dates'
      });
    }

    // ✅ Store as plain date strings to avoid timezone issues
    await ExamDate.deleteMany({});
    const examDates = await ExamDate.create({
      date1: toDateString(date1),
      date2: toDateString(date2),
      date3: toDateString(date3),
    });

    res.status(200).json({
      success: true,
      message: 'Exam dates saved successfully',
      data: examDates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving exam dates',
      error: error.message
    });
  }
};

// @desc    Get exam dates
// @route   GET /api/admin/exam-dates
// @access  Private/Admin
export const getExamDates = async (req, res) => {
  try {
    const examDates = await ExamDate.findOne().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: examDates || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching exam dates',
      error: error.message
    });
  }
};

export default {
  getPendingUsers,
  getApprovedUsers,
  getAllUsers,
  approveUser,
  enableExamAccess,
  bulkEnableExam,
  getDashboardStats,
  getUserById,
  publishResults,
  setExamDates,
  getExamDates,
};
