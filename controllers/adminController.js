import User from '../models/user.model.js';
import Result from '../models/result.model.js';
import { generatePassword } from '../utils/jwtUtils.js';
import {
  sendCredentialsEmail,
  sendExamNotificationEmail,
  sendResultPublishedEmail,
  sendExamReminderEmail,
  sendExamRescheduleEmail,
  sendLastChanceExamEmail
} from '../utils/emailService.js';

// ✅ Escape regex special chars — prevents ReDoS attack on search
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
    res.status(500).json({ success: false, message: 'Error fetching pending users', error: error.message });
  }
};

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
    res.status(500).json({ success: false, message: 'Error fetching approved users', error: error.message });
  }
};

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
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
};

export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isApproved) return res.status(400).json({ success: false, message: 'User is already approved' });
    if (!user.isEmailVerified || !user.isSmsVerified) {
      return res.status(400).json({ success: false, message: 'User must complete verification first' });
    }

    const displayDate = user.preferredDate || null;
    const plainPassword = generatePassword();
    user.password   = plainPassword;
    user.isApproved = true;
    user.approvedBy = req.user.id;
    user.approvedAt = new Date();

    await user.save();

    try {
      await sendCredentialsEmail(user.email, user.fullName, user.registrationNumber, plainPassword, displayDate);
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
          preferredDate: user.preferredDate,
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error approving user', error: error.message });
  }
};

export const enableExamAccess = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.isApproved) return res.status(400).json({ success: false, message: 'User must be approved first' });
    if (user.examAttempted) return res.status(400).json({ success: false, message: 'User has already attempted the exam' });

    user.canTakeExam = true;
    await user.save();

    try {
      // ✅ preferredDate pass करो
      await sendExamNotificationEmail(user.email, user.fullName, user.preferredDate);
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
          canTakeExam: user.canTakeExam,
          examDate: user.preferredDate   // 👈 response में भी भेजो
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error enabling exam access', error: error.message });
  }
};


export const bulkEnableExam = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of user IDs' });
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
    res.status(500).json({ success: false, message: 'Error enabling bulk exam access', error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
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
      data: { stats: { totalUsers, pendingApproval, approvedUsers, examEnabled, examAttempted, totalResults } }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats', error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const result = await Result.findOne({ user: user._id });

    res.status(200).json({ success: true, data: { user, result } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user details', error: error.message });
  }
};

export const publishResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate({
        path: "user",
        select: "fullName email"
      })
      .sort({ marksObtained: -1, timeTaken: 1 });

    if (!results.length) {
      return res.status(404).json({
        success: false,
        message: "No results found"
      });
    }

    const emailData = [];

    for (let i = 0; i < results.length; i++) {
      // 🔍 DEBUG — yeh dekho terminal mein
      // console.log(`--- Result ${i + 1} ---`);
      // console.log("marksObtained:", results[i].marksObtained);
      // console.log("user:", results[i].user);

      const snapshot = {
        email: results[i].user?.email,
        fullName: results[i].user?.fullName,
        marksObtained: results[i].marksObtained,
      };

      results[i].rank = i + 1;
      await results[i].save();

      snapshot.rank = results[i].rank;
      emailData.push(snapshot);
    }

    const SELECTION_LIMIT = 1;

    for (const data of emailData) {
      if (!data.email) continue;

      // // 🔍 DEBUG — email bhejne se pehle check
      // console.log("📧 Sending email to:", data.email);
      // console.log("📊 Score being sent:", data.marksObtained);
      // console.log("🏆 Rank being sent:", data.rank);

      const selected = data.rank <= SELECTION_LIMIT;

      await sendResultPublishedEmail(
        data.email,
        data.fullName,
        selected,
        data.rank,
        data.marksObtained
      );
    }

    res.status(200).json({
      success: true,
      message: "Results published, ranks calculated and emails sent"
    });

  } catch (error) {
    console.error("Publish error:", error);
    res.status(500).json({
      success: false,
      message: "Error publishing results",
      error: error.message
    });
  }
};
export const sendRescheduleReminder = async (req, res) => {
  try {
    const { userId, examLink } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.examAttempted) return res.status(400).json({ success: false, message: 'User has already attempted the exam' });

    await sendExamRescheduleEmail(user.email, user.fullName, examLink);
    res.json({ success: true, message: `Reschedule reminder sent to ${user.email}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendLastChanceReminder = async (req, res) => {
  try {
    const { userId, examLink } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.examAttempted) return res.status(400).json({ success: false, message: 'User has already attempted the exam' });

    await sendLastChanceExamEmail(user.email, user.fullName, examLink);
    res.json({ success: true, message: `Last chance reminder sent to ${user.email}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ FIXED: naam sendExamReminder rakha — emailService ke sendExamReminderEmail se alag
// @route POST /api/admin/users/:id/send-reminder
export const sendExamReminder = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.examAttempted) return res.status(400).json({ success: false, message: 'User has already attempted the exam' });
    if (!user.canTakeExam) return res.status(400).json({ success: false, message: 'Exam not enabled for this user' });

    await sendExamReminderEmail(user.email, user.fullName, user.preferredDate); // 👈 preferredDate add

    res.json({ success: true, message: `Reminder sent to ${user.email}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
  sendRescheduleReminder,
  sendLastChanceReminder,
  sendExamReminder,
};