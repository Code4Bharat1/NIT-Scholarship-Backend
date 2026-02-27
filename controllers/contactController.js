import { sendContactAdminEmail } from '../utils/emailService.js';
import User from '../models/user.model.js';

// @desc    Send message to admin
// @route   POST /api/contact/admin
// @access  Private (logged in users)
export const contactAdmin = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject and message'
      });
    }

    // Get user details
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send email to admin
    await sendContactAdminEmail(
      user.fullName,
      user.email,
      user.phone,
      subject,
      message
    );

    res.status(200).json({
      success: true,
      message: 'Your message has been sent to admin. You will receive a response via email.'
    });
  } catch (error) {
    console.error('Contact admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message to admin',
      error: error.message
    });
  }
};

// @desc    Send message to admin (public - for non-logged in users)
// @route   POST /api/contact/admin-public
// @access  Public
export const contactAdminPublic = async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fullName, email, subject and message'
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Send email to admin
    await sendContactAdminEmail(
      fullName,
      email,
      phone || 'Not provided',
      subject,
      message
    );

    res.status(200).json({
      success: true,
      message: 'Your message has been sent to admin. You will receive a response via email.'
    });
  } catch (error) {
    console.error('Contact admin public error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message to admin',
      error: error.message
    });
  }
};

export default { contactAdmin, contactAdminPublic };