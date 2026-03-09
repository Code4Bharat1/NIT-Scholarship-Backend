import User from '../models/user.model.js';
import Result from '../models/result.model.js';
import { generatePassword } from '../utils/jwtUtils.js';
import { sendCredentialsEmail, sendExamNotificationEmail, sendResultPublishedEmail } from '../utils/emailService.js';
import ExamDate from '../models/examdate.model.js';

// ✅ Converts any date input → proper JS Date object at midnight UTC
// User.examDate schema type is Date — so we must pass a Date object, not a string
const toDateObject = (d) => {
  if (!d) return null;
  const str = typeof d === 'string' ? d.slice(0, 10) : (() => {
    const ist = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
    return ist.toISOString().slice(0, 10);
  })();
  return new Date(`${str}T00:00:00.000Z`); // midnight UTC — safe for IST display
};

// ✅ Formats a Date object → "12 Aug 2025" string for emails/display
const toDisplayDate = (d) => {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata'
  });
};

// ✅ Escape regex special chars — prevents ReDoS attack on search
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
    }).select('-password').sort({ createdAt: 1 });

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
    })
    .select('-password')
    .sort({ approvedAt: -1 });

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
      const escaped = escapeRegex(search);
      query.$or = [
        { fullName: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { registrationNumber: { $regex: escaped, $options: 'i' } }
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

    const limitNum = parseInt(limit, 10);
    const pageNum  = parseInt(page, 10);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
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

    if (!examDates) {
      return res.status(400).json({
        success: false,
        message: 'Exam dates not set. Please set exam dates before approving users.'
      });
    }

    // ✅ +1 because this user is not yet approved — slot = next position
    const totalApproved = await User.countDocuments({ role: 'user', isApproved: true });
    const slotNumber    = totalApproved + 1;

    // ✅ KEY FIX: toDateObject() returns a real Date object
    // Previously toDateString() returned a string → MongoDB stored null (type mismatch)
    if (slotNumber <= 3334) {
      user.examDate = toDateObject(examDates.date1);
    } else if (slotNumber <= 6667) {
      user.examDate = toDateObject(examDates.date2);
    } else {
      user.examDate = toDateObject(examDates.date3);
    }

    const plainPassword = generatePassword();
    user.password   = plainPassword; // pre-save hook hashes this
    user.isApproved = true;
    user.approvedBy = req.user.id;
    user.approvedAt = new Date();

    await user.save();

    // ✅ Format date for email display in IST
    const displayDate = toDisplayDate(user.examDate);

    try {
      await sendCredentialsEmail(
        user.email,
        user.fullName,
        user.registrationNumber,
        plainPassword,
        displayDate
      );
    } catch (emailError) {
      console.error('Error sending credentials email:', emailError);
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
          examDate: user.examDate,
          examDateDisplay: displayDate
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
    } catch (emailError) {
      console.error('Error sending exam notification:', emailError);
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

    // Note: Bulk email notifications skipped for performance.
    // Use a queue (e.g. BullMQ) if bulk emails are needed.

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
    // ✅ Parallel queries for performance
    const [totalUsers, pendingApproval, approvedUsers, examEnabled, examAttempted, totalResults] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ role: 'user', isEmailVerified: true, isSmsVerified: true, isApproved: false }),
        User.countDocuments({ role: 'user', isApproved: true }),
        User.countDocuments({ role: 'user', canTakeExam: true, examAttempted: false }),
        User.countDocuments({ role: 'user', examAttempted: true }),
        Result.countDocuments()
      ]);

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
    const results = await Result.find({})
      .populate('user', 'email fullName')
      .sort({ rank: 1 });

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'No results found to publish' });
    }

    // Mark all results as published in DB
    await Result.updateMany({}, { isPublished: true });

    let emailsSent   = 0;
    let emailsFailed = 0;

    for (const result of results) {
      if (!result.user?.email) continue;
      try {
        const qualified = result.rank !== null && result.rank <= 250;
        await sendResultPublishedEmail(
          result.user.email,
          result.user.fullName,
          qualified,
          result.rank
        );
        emailsSent++;
      } catch (err) {
        emailsFailed++;
        console.error(`❌ Failed to send to ${result.user.email}:`, err.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Results published. Emails sent: ${emailsSent}, Failed: ${emailsFailed}.`,
      data: { totalResults: results.length, emailsSent, emailsFailed }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error publishing results',
      error: error.message
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

    // ✅ ExamDate schema is String type — store as "YYYY-MM-DD"
    // toDateObject() is only for User.examDate which is Date type
    const toStr = (d) =>
      typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);

    await ExamDate.deleteMany({});
    const examDates = await ExamDate.create({
      date1: toStr(date1),
      date2: toStr(date2),
      date3: toStr(date3),
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