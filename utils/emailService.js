import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ── Debug: log env on startup ─────────────────────────────────
// console.log('📧 Email Config Check:');
// console.log('  EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
// console.log('  EMAIL_FROM:', process.env.EMAIL_FROM || '❌ NOT SET');
// console.log('  EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET' : '❌ NOT SET');

// Create transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error.message);
    console.error('   → Make sure EMAIL_USER, EMAIL_PASS (App Password), EMAIL_FROM are set in .env');
  } else {
    // console.log('✅ Email server is ready to send messages');
  }
});

// ── Send OTP email ────────────────────────────────────────────
export const sendOTPEmail = async (email, otp, name) => {
  try {
    const mailOptions = {
      from: `"NIT Admin" <${process.env.EMAIL_FROM}>`,
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
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 05 minutes</p>
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

    const info = await transporter.sendMail(mailOptions);
    // console.log(`✉️ OTP email sent to ${email} — MessageId: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    throw new Error('Failed to send OTP email');
  }
};

export const sendCredentialsEmail = async (email, name, registrationNumber, password) => {
  try {
    const PORTAL_URL = "https://scholarship.nexcoreinstitute.org/";

    const mailOptions = {
      from: `"Scholar Portal" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '🎉 Registration Approved — Your Login Credentials',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
            .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #1a237e 0%, #1565c0 100%); color: white; padding: 36px 30px; text-align: center; }
            .header h1 { margin: 0 0 6px; font-size: 26px; }
            .header p { margin: 0; opacity: 0.85; font-size: 14px; }
            .content { padding: 32px 30px; }
            .greeting { font-size: 17px; font-weight: bold; color: #1a237e; margin-bottom: 10px; }
            .credentials-box { background: #f0f4ff; border: 1.5px solid #c5cae9; border-radius: 10px; padding: 24px; margin: 24px 0; }
            .credentials-box h3 { margin: 0 0 16px; color: #1a237e; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
            .credential-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #dde2f0; }
            .credential-row:last-child { border-bottom: none; }
            .cred-label { color: #666; font-size: 13px; }
            .cred-value { font-family: monospace; font-size: 17px; font-weight: bold; color: #1565c0; letter-spacing: 1px; background: #fff; padding: 4px 12px; border-radius: 6px; border: 1px solid #c5cae9; }
            .login-btn { display: block; text-align: center; background: linear-gradient(135deg, #1a237e 0%, #1565c0 100%); color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; margin: 24px 0; letter-spacing: 0.3px; }
            .url-box { background: #f9f9f9; border: 1px dashed #ccc; border-radius: 6px; padding: 10px 16px; text-align: center; font-family: monospace; font-size: 13px; color: #555; margin-bottom: 24px; }
            .warning { background: #fff8e1; border-left: 4px solid #ffc107; padding: 14px 18px; border-radius: 6px; margin: 20px 0; font-size: 13px; }
            .warning ul { margin: 8px 0 0; padding-left: 18px; }
            .steps { background: #e8f5e9; border-left: 4px solid #43a047; padding: 14px 18px; border-radius: 6px; margin: 20px 0; font-size: 13px; }
            .steps ul { margin: 8px 0 0; padding-left: 18px; }
            .footer { background: #f5f5f5; text-align: center; padding: 18px; color: #999; font-size: 12px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">

            <div class="header">
              <h1>🎉 Registration Approved!</h1>
              <p>Welcome to Scholar Portal — your exam journey starts here</p>
            </div>

            <div class="content">
              <div class="greeting">Congratulations, ${name}!</div>
              <p style="color:#555; font-size:14px; margin-top:0;">
                Your application has been reviewed and approved by the admin. 
                Use the credentials below to log in to the Scholar Portal.
              </p>

              <!-- Credentials Box -->
              <div class="credentials-box">
                <h3>🔐 Your Login Credentials</h3>
                <div class="credential-row">
                  <span class="cred-label">Registration Number</span>
                  <span class="cred-value">${registrationNumber}</span>
                </div>
                <div class="credential-row">
                  <span class="cred-label">Password</span>
                  <span class="cred-value">${password}</span>
                </div>
              </div>

              <!-- Login Button -->
              <a href="${PORTAL_URL}" class="login-btn">
                🚀 Login to Scholar Portal
              </a>
              <div class="url-box">
                Or copy this link: ${PORTAL_URL}
              </div>

              <!-- Security Warning -->
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                  <li>Do not share your credentials with anyone</li>
                  <li>Keep this email secure and confidential</li>
                  <li>Contact admin if you did not request this</li>
                </ul>
              </div>

              <!-- Next Steps -->
              <div class="steps">
                <strong>✅ What's Next?</strong>
                <ul>
                  <li>Login using the credentials above</li>
                  <li>Wait for admin to enable your exam access</li>
                  <li>You will be notified via email when the exam is ready</li>
                </ul>
              </div>

              <p style="color:#555; font-size:14px;">
                Best of luck for your exam! If you have any questions, please contact the admin.
              </p>
            </div>

            <div class="footer">
              © ${new Date().getFullYear()} Scholar Portal — Nexcore Institute. All rights reserved.<br/>
              <a href="${PORTAL_URL}" style="color:#1565c0; text-decoration:none;">${PORTAL_URL}</a>
            </div>

          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending credentials email:', error.message);
    throw new Error('Failed to send credentials email');
  }
};
// ── Send exam notification email ──────────────────────────────
export const sendExamNotificationEmail = async (email, name, examDate) => {  // 👈 examDate parameter add
  try {

    // ✅ preferredDate String type है, directly use करो
    const formattedDate = examDate ?? 'As scheduled';

    const mailOptions = {
      from: `"NIT Admin" <${process.env.EMAIL_FROM}>`,
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
            .date-highlight { background: #fff3f3; border: 2px solid #f5576c; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0; }
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

              <!-- ✅ Exam Date highlight box -->
              <div class="date-highlight">
                <h3 style="margin:0; color:#f5576c;">📅 Exam Date</h3>
                <p style="font-size: 20px; font-weight: bold; margin: 8px 0; color: #333;">${formattedDate}</p>
              </div>
              
              <div class="info-box">
                <h3>Exam Details:</h3>
                <ul>
                  <li><strong>Exam Date:</strong> ${formattedDate}</li>
                  <li><strong>Total Questions:</strong> 120 MCQs</li>
                  <li><strong>Duration:</strong> 1 hour</li>
                  <li><strong>Type:</strong> Multiple Choice Questions</li>
                  <li><strong>Marking:</strong> 1 mark per question</li>
                </ul>
              </div>
              
              <p><strong>Instructions:</strong></p>
              <ul>
                <li>Login with your credentials on the exam date</li>
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

    const info = await transporter.sendMail(mailOptions);
    // console.log(`✉️ Exam notification sent to ${email} — MessageId: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending exam notification:', error.message);
    throw new Error('Failed to send exam notification');
  }
};

// ── Send contact admin email ──────────────────────────────────
export const sendContactAdminEmail = async (userName, userEmail, userPhone, subject, message) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;

    const mailOptions = {
      from: `"NIT Admin" <${process.env.EMAIL_FROM}>`,
      to: adminEmail,
      replyTo: userEmail,
      subject: `[User Query] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .user-info { background: white; border-left: 4px solid #fa709a; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #666; display: inline-block; width: 120px; }
            .value { color: #333; }
            .message-box { background: #fff; border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px; white-space: pre-wrap; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 New User Query</h1>
            </div>
            <div class="content">
              <p>A user has sent you a message through Scholar Portal:</p>
              
              <div class="user-info">
                <h3 style="margin-top: 0;">User Details:</h3>
                <div class="info-row">
                  <span class="label">Name:</span>
                  <span class="value">${userName}</span>
                </div>
                <div class="info-row">
                  <span class="label">Email:</span>
                  <span class="value"><a href="mailto:${userEmail}">${userEmail}</a></span>
                </div>
                <div class="info-row">
                  <span class="label">Phone:</span>
                  <span class="value">${userPhone || 'Not provided'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Subject:</span>
                  <span class="value"><strong>${subject}</strong></span>
                </div>
              </div>
              
              <h3>Message:</h3>
              <div class="message-box">${message}</div>
              
              <p><strong>Action Required:</strong></p>
              <ul>
                <li>Review the user's query</li>
                <li>Reply directly to: <a href="mailto:${userEmail}">${userEmail}</a></li>
                <li>Or login to admin panel to take necessary action</li>
              </ul>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Scholar Portal. All rights reserved.</p>
              <p style="font-size: 10px; color: #999;">This is an automated notification from Scholar Portal</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log(`✉️ Contact admin email sent from ${userEmail} — MessageId: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending contact admin email:', error.message);
    throw new Error('Failed to send contact admin email');
  }
};

// ── Send result published email ───────────────────────────────
export const sendResultPublishedEmail = async (email, name, qualified, rank, score) => {
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
          <p><strong>Your Score:</strong> ${score ?? "Available in portal"}</p>
          <p>You are selected for the next round.</p>
        </div>
        <p>Keep up the great work and wish you success ahead!</p>
      `
      : `
        <h2>Hello ${name},</h2>
        <p>Your exam result has been published.</p>
        <div class="info-box">
          <p><strong>Your Rank:</strong> ${rank ?? "Available in portal"}</p>
          <p><strong>Your Score:</strong> ${score ?? "Available in portal"}</p>
          <p>Thank you for participating.</p>
          <p>Unfortunately, you were not selected this time.</p>
        </div>
        <p>Keep learning and improving—we hope to see you again!</p>
      `;

    const mailOptions = {
      from: `"NIT Admin" <${process.env.EMAIL_FROM}>`,
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

    const info = await transporter.sendMail(mailOptions);
    // console.log(`✉️ Result email sent to ${email} — MessageId: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending result email:", error.message);
    throw new Error("Failed to send result email");
  }
};
//--admin pdf
export const sendRegistrationConfirmationEmail = async (email, fullName, registrationNumber, pdfBuffer) => {
  try {
    if (!pdfBuffer) throw new Error('pdfBuffer is null or undefined — generateAdmitCard() may have failed');

    const PORTAL_URL = 'https://scholarship.nexcoreinstitute.org/';

    const mailOptions = {
      from: `"Nexcore Institute of Technology" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Registration Confirmed — ${registrationNumber} | Nexcore Institute`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </head>
      <body style="margin:0;padding:0;background:#f5f6fa;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa;padding:32px 0;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(26,42,94,0.10);">

              <!-- Header -->
              <tr>
                <td style="background:#1a2a5e;padding:28px 40px;text-align:center;">
                  <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">
                    NEXCORE INSTITUTE OF TECHNOLOGY
                  </div>
                  <div style="font-size:12px;color:#9DB8E8;margin-top:6px;">
                    nexcoreinstitute.org &nbsp;•&nbsp; Since 2011
                  </div>
                </td>
              </tr>

              <!-- Gold bar -->
              <tr><td style="height:4px;background:linear-gradient(90deg,#D4880B,#f5a623);"></td></tr>

              <!-- Body -->
              <tr>
                <td style="padding:36px 40px;">
                  <p style="font-size:15px;color:#1a1f36;margin:0 0 6px;">Dear <strong>${fullName}</strong>,</p>
                  <p style="font-size:14px;color:#5a6380;margin:0 0 24px;line-height:1.7;">
                    Congratulations! Your registration for the <strong>Nexcore Scholarship Examination</strong> has been received successfully. Your application is now pending admin review.
                  </p>

                  <!-- Reg number box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                    <tr>
                      <td style="background:#f0f4fa;border:1px solid #d0d8e8;border-radius:8px;padding:20px;text-align:center;">
                        <div style="font-size:11px;color:#5a6380;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Your Registration Number</div>
                        <div style="font-size:28px;font-weight:700;color:#1a2a5e;letter-spacing:3px;font-family:'Courier New',monospace;">${registrationNumber}</div>
                        <div style="font-size:11px;color:#5a6380;margin-top:8px;">Save this number for future reference</div>
                      </td>
                    </tr>
                  </table>

                  <!-- Steps -->
                  <p style="font-size:13px;font-weight:600;color:#1a2a5e;margin:0 0 12px;">What happens next?</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                    ${[
                      ['✅', 'Registration Complete', 'Your details have been submitted successfully.'],
                      ['⏳', 'Admin Review', 'Our team will review your application shortly.'],
                      ['📧', 'Credentials Email', 'Once approved, your login ID & password will be emailed.'],
                      ['📝', 'Take the Exam', 'Login and attempt the scholarship examination.'],
                    ].map(([icon, title, desc]) => `
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid #f0f4fa;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="font-size:18px;width:32px;vertical-align:top;padding-top:2px;">${icon}</td>
                            <td style="padding-left:10px;">
                              <div style="font-size:13px;font-weight:600;color:#1a1f36;">${title}</div>
                              <div style="font-size:12px;color:#5a6380;margin-top:2px;">${desc}</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>`).join('')}
                  </table>

                  <!-- Attachment note -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                    <tr>
                      <td style="background:#fff8e7;border:1px solid #D4880B;border-radius:8px;padding:14px 16px;">
                        <p style="margin:0;font-size:13px;color:#7a4a00;">
                          📎 <strong>Your Admit Card is attached</strong> to this email as a PDF. Please download and save it for your records.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- ✅ Portal Login Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                    <tr>
                      <td style="background:#f0f4ff;border:1.5px solid #c5cae9;border-radius:10px;padding:20px 24px;">
                        <p style="margin:0 0 14px;font-size:13px;color:#1a2a5e;font-weight:600;">
                          🔗 Scholar Portal Access
                        </p>
                        <p style="margin:0 0 16px;font-size:13px;color:#5a6380;line-height:1.6;">
                          Once your application is approved, you can log in to the Scholar Portal using your registration number and the credentials that will be sent to you via email.
                        </p>
                        <!-- Button -->
                        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                          <tr>
                            <td style="background:linear-gradient(135deg,#1a2a5e 0%,#1565c0 100%);border-radius:8px;text-align:center;">
                              <a href="${PORTAL_URL}"
                                style="display:inline-block;padding:12px 32px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
                                🚀 Visit Scholar Portal
                              </a>
                            </td>
                          </tr>
                        </table>
                        <!-- URL fallback -->
                        <p style="margin:12px 0 0;font-size:11px;color:#9DB8E8;text-align:center;">
                          Or copy: <a href="${PORTAL_URL}" style="color:#1565c0;font-weight:600;text-decoration:none;">${PORTAL_URL}</a>
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="font-size:13px;color:#5a6380;line-height:1.7;margin:0;">
                    If you have any questions, feel free to contact us at
                    <a href="mailto:director@nexcoreinstitute.org" style="color:#1a2a5e;font-weight:600;">director@nexcoreinstitute.org</a>
                    or call <strong>+91 959 440 2822</strong>.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#1a2a5e;padding:20px 40px;text-align:center;">
                  <p style="margin:0 0 8px;font-size:11px;color:#9DB8E8;line-height:1.7;">
                    Campus - 1A, 1B &amp; 2, Lower Ground Floor, New White House, Building No. 3,<br/>
                    Opp. Kabir Hospital, Buddha Colony, Kurla West, Mumbai, Maharashtra - 400070.<br/>
                  </p>
                  <a href="${PORTAL_URL}" style="font-size:12px;color:#ffffff;font-weight:600;text-decoration:none;">
                    ${PORTAL_URL}
                  </a>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
      attachments: [
        {
          filename: `AdmitCard_${registrationNumber}.pdf`,
          content:  pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending registration confirmation email:', error.message);
    throw new Error('Failed to send registration confirmation email');
  }
};
// ── Send exam reschedule opportunity email (missed 27, 28, 29) ──
export const sendExamRescheduleEmail = async (email, name, examLink) => {
  try {
    const mailOptions = {
      from: `"NIT Admin" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Exam Rescheduled — Attempt on 30th | Scholar Portal',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; border-left: 4px solid #f7971e; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .btn { display: inline-block; background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%); color: white !important; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Exam Rescheduled for You</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>We noticed that you were unable to attempt the exam on the scheduled dates: <strong>27th, 28th, and 29th</strong>.</p>
              <p>We're giving you another opportunity to take the exam. Please find the details below:</p>

              <div class="info-box">
                <h3 style="margin-top: 0;">📌 Rescheduled Exam Details:</h3>
                <ul>
                  <li><strong>New Exam Date:</strong> 30th</li>
                  <li><strong>Total Questions:</strong> 120 MCQs</li>
                  <li><strong>Duration:</strong> 1 hours</li>
                  <li><strong>Marking:</strong> 1 mark per question</li>
                </ul>
              </div>

              <div class="warning">
                <strong>⚠️ Please Note:</strong> This is an additional opportunity provided to you. Make sure you attempt the exam on <strong>30th</strong> without fail.
              </div>

              <p style="text-align: center;">
                <a href="${examLink}" class="btn">👉 Click Here to Take the Exam</a>
              </p>

              <p><strong>Instructions:</strong></p>
              <ul>
                <li>Login with your credentials before clicking the link</li>
                <li>Read all instructions carefully before starting</li>
                <li>Once started, the timer cannot be paused</li>
                <li>Ensure a stable internet connection</li>
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

    const info = await transporter.sendMail(mailOptions);
    // console.log(`✉️ Exam reschedule email sent to ${email} — MessageId: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending exam reschedule email:', error.message);
    throw new Error('Failed to send exam reschedule email');
  }
};


// ── Send last chance exam email (missed 27, 28, 29, 30) ──────
export const sendLastChanceExamEmail = async (email, name, examLink) => {
  try {
    const mailOptions = {
      from: `"NIT Admin" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '⚠️ Last Chance to Attempt Exam — Scholar Portal',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; border-left: 4px solid #cb2d3e; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .btn { display: inline-block; background: linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%); color: white !important; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
            .danger { background: #fdecea; border-left: 4px solid #cb2d3e; padding: 15px; margin: 20px 0; border-radius: 5px; color: #7b1a1a; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Last Chance — Act Now!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>You have missed the exam on <strong>27th, 28th, 29th, and 30th</strong>. This is your <strong>final opportunity</strong> to attempt the exam.</p>

              <div class="danger">
                <strong>🚨 FINAL WARNING:</strong> If you do not attempt the exam now by clicking the link below, your application will be marked as <strong>incomplete</strong> and you will <strong>not</strong> be considered for the scholarship.
              </div>

              <div class="info-box">
                <h3 style="margin-top: 0;">📌 Last Chance Exam Details:</h3>
                <ul>
                  <li><strong>Total Questions:</strong> 120 MCQs</li>
                  <li><strong>Duration:</strong> 1 hours</li>
                  <li><strong>Marking:</strong> 1 mark per question</li>
                  <li><strong>Deadline:</strong> Attempt immediately — no further extensions will be granted</li>
                </ul>
              </div>

              <p style="text-align: center;">
                <a href="${examLink}" class="btn">👉 Click Here — Take the Exam Now</a>
              </p>

              <p><strong>Instructions:</strong></p>
              <ul>
                <li>Login with your credentials before clicking the link</li>
                <li>Read all instructions carefully before starting</li>
                <li>Once started, the timer cannot be paused</li>
                <li>Ensure a stable internet connection</li>
                <li>Submit before time expires</li>
              </ul>

              <p>We sincerely hope you take this opportunity. All the best! 🎓</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Scholar Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log(`✉️ Last chance exam email sent to ${email} — MessageId: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending last chance exam email:', error.message);
    throw new Error('Failed to send last chance exam email');
  }
};

// ── Send exam reminder email (already enabled, not yet attempted) ──
export const sendExamReminderEmail = async (email, name, preferredDate) => {  // 👈 preferredDate parameter add
  try {
    const formattedDate = preferredDate ?? 'As scheduled';

    const mailOptions = {
      from: `"NIT Admin" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '⏰ Reminder: Your Exam is Waiting — Scholar Portal',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; border-left: 4px solid #f7971e; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .date-highlight { background: #fff8e1; border: 2px solid #ffd200; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Don't Forget Your Exam!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>This is a reminder that your exam access is <strong>already enabled</strong>. Please login and attempt your exam as soon as possible.</p>

              <!-- ✅ Date highlight box -->
              <div class="date-highlight">
                <h3 style="margin:0; color:#f7971e;">📅 Your Exam Date</h3>
                <p style="font-size: 20px; font-weight: bold; margin: 8px 0; color: #333;">${formattedDate}</p>
              </div>

              <div class="info-box">
                <h3 style="margin-top: 0;">📝 Exam Details:</h3>
                <ul>
                  <li><strong>Exam Date:</strong> ${formattedDate}</li>
                  <li><strong>Total Questions:</strong> 120 MCQs</li>
                  <li><strong>Duration:</strong> 1 hour</li>
                  <li><strong>Type:</strong> Multiple Choice Questions</li>
                  <li><strong>Marking:</strong> 1 mark per question</li>
                </ul>
              </div>

              <div class="warning">
                <strong>⚠️ Important:</strong> Do not delay — attempt your exam on your scheduled date. Once the window closes, no further attempts will be allowed.
              </div>

              <p><strong>Steps to attempt:</strong></p>
              <ul>
                <li>Login with your registration number and password</li>
                <li>Go to the Exam section</li>
                <li>Read instructions carefully and start</li>
                <li>Submit before time runs out</li>
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

    const info = await transporter.sendMail(mailOptions);
    // console.log(`✉️ Exam reminder sent to ${email} — MessageId: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending exam reminder email:', error.message);
    throw new Error('Failed to send exam reminder email');
  }
};

export default transporter;