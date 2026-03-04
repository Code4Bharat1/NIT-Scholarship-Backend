import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ── Debug: log env on startup ─────────────────────────────────
console.log('📧 Email Config Check:');
console.log('  EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
console.log('  EMAIL_FROM:', process.env.EMAIL_FROM || '❌ NOT SET');
console.log('  EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET' : '❌ NOT SET');

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
    console.log('✅ Email server is ready to send messages');
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
    console.log(`✉️ OTP email sent to ${email} — MessageId: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    throw new Error('Failed to send OTP email');
  }
};

// ── Send credentials email after approval ────────────────────
export const sendCredentialsEmail = async (email, name, registrationNumber, password) => {
  try {
    const mailOptions = {
      from: `"NIT Admin" <${process.env.EMAIL_FROM}>`,
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

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Credentials email sent to ${email} — MessageId: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending credentials email:', error.message);
    throw new Error('Failed to send credentials email');
  }
};

// ── Send exam notification email ──────────────────────────────
export const sendExamNotificationEmail = async (email, name) => {
  try {
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

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Exam notification sent to ${email} — MessageId: ${info.messageId}`);
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
    console.log(`✉️ Contact admin email sent from ${userEmail} — MessageId: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending contact admin email:', error.message);
    throw new Error('Failed to send contact admin email');
  }
};

// ── Send result published email ───────────────────────────────
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
    console.log(`✉️ Result email sent to ${email} — MessageId: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending result email:", error.message);
    throw new Error("Failed to send result email");
  }
};

// ── Send registration confirmation email with admit card PDF ──
export const sendRegistrationConfirmationEmail = async (email, fullName, registrationNumber, pdfBuffer) => {
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
                  <p style="margin:0;font-size:11px;color:#9DB8E8;line-height:1.7;">
                    Campus - 1A, 1B &amp; 2, Lower Ground Floor, New White House, Building No. 3,<br/>
                    Opp. Kabir Hospital, Buddha Colony, Kurla West, Mumbai, Maharashtra - 400070.<br/>
                    <span style="color:#ffffff;">nexcoreinstitute.org</span>
                  </p>
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
        content:  pdfBuffer,           // Buffer from generateAdmitCard()
        contentType: 'application/pdf',
      },
    ],
  };

  // Use your existing transporter (same one used in sendOTPEmail etc.)
  await transporter.sendMail(mailOptions);
};

export default transporter;