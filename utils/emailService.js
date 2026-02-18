import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',      // ✅ hardcoded Gmail SMTP
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS   // ✅ matches .env key
  },
  tls: {
    rejectUnauthorized: false      // ✅ avoids TLS issues locally
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Send OTP email
export const sendOTPEmail = async (email, otp, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Email Verification - Scholar Portal',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Scholar Portal</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for registering with Scholar Portal. Please verify your email address using the OTP below:</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your OTP is:</p>
                <div class="otp">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
              </div>
              
              <p><strong>Important:</strong> After email and SMS verification, an admin will review your registration. You'll receive login credentials once approved.</p>
              
              <p>If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Scholar Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✉️ OTP email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Send credentials email after approval
export const sendCredentialsEmail = async (email, name, registrationNumber, password) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Registration Approved - Login Credentials',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials-box { background: white; border-left: 4px solid #11998e; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .credential-item { margin: 15px 0; }
            .label { font-weight: bold; color: #666; }
            .value { font-size: 18px; color: #11998e; font-family: monospace; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Registration Approved!</h1>
            </div>
            <div class="content">
              <h2>Congratulations ${name}!</h2>
              <p>Your registration has been approved by the admin. You can now login to Scholar Portal using the credentials below:</p>
              
              <div class="credentials-box">
                <div class="credential-item">
                  <div class="label">Registration Number:</div>
                  <div class="value">${registrationNumber}</div>
                </div>
                <div class="credential-item">
                  <div class="label">Password:</div>
                  <div class="value">${password}</div>
                </div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <ul>
                  <li>Please change your password immediately after first login</li>
                  <li>Do not share your credentials with anyone</li>
                  <li>Keep this email secure</li>
                </ul>
              </div>
              
              <p><strong>What's Next?</strong></p>
              <ul>
                <li>Login with your credentials</li>
                <li>Wait for admin to enable exam access</li>
                <li>Check your email for exam schedule</li>
              </ul>
              
              <p>Good luck with your exam!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Scholar Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✉️ Credentials email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending credentials email:', error);
    throw new Error('Failed to send credentials email');
  }
};

// Send exam notification email
export const sendExamNotificationEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Exam Access Enabled - Scholar Portal',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; border-left: 4px solid #f5576c; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 Your Exam is Ready!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Good news! The admin has enabled exam access for you. You can now login and start your exam.</p>
              
              <div class="info-box">
                <h3>Exam Details:</h3>
                <ul>
                  <li><strong>Total Questions:</strong> 120 MCQs</li>
                  <li><strong>Duration:</strong> 2 hours</li>
                  <li><strong>Type:</strong> Multiple Choice Questions</li>
                  <li><strong>Marking:</strong> 1 mark per question</li>
                </ul>
              </div>
              
              <p><strong>Instructions:</strong></p>
              <ul>
                <li>Login with your credentials</li>
                <li>Read all instructions carefully before starting</li>
                <li>Once started, timer cannot be paused</li>
                <li>Ensure stable internet connection</li>
                <li>Submit before time expires</li>
              </ul>
              
              <p>All the best! 🎓</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Scholar Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✉️ Exam notification sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending exam notification:', error);
    throw new Error('Failed to send exam notification');
  }
};

// Send result published email
export const sendResultPublishedEmail = async (email, name, qualified, rank) => {
  try {

    const subject = qualified
      ? "Result Published - Scholar Portal"
      : "Result Update - Scholar Portal";

    const resultMessage = qualified
      ? `
        <h2>Congratulations ${name}! 🎉</h2>
        <p>You have performed very well in the exam.</p>
        <div class="info-box">
          <p><strong>Your Rank:</strong> ${rank ?? "Available in portal"}</p>
          <p>You are selected for the next round.</p>
        </div>
        <p>Keep up the great work and wish you success ahead!</p>
      `
      : `
        <h2>Hello ${name},</h2>
        <p>Your exam result has been published.</p>
        <div class="info-box">
          <p><strong>Your Rank:</strong> ${rank ?? "Available in portal"}</p>
          <p>Thank you for participating.</p>
          <p>Unfortunately, you were not selected this time.</p>
        </div>
        <p>Keep learning and improving—we hope to see you again!</p>
      `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; border-left: 4px solid #4facfe; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Exam Result Update</h1>
            </div>
            <div class="content">
              ${resultMessage}
              <p><strong>Next Step:</strong> Login to Scholar Portal to view details.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Scholar Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✉️ Result email sent to ${email}`);
    return { success: true };

  } catch (error) {
    console.error("❌ Error sending result email:", error);
    throw new Error("Failed to send result email");
  }
};


export default transporter;

