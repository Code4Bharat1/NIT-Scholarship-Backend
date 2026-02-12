import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Gmail transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,          // IMPORTANT (not 465)
  secure: false,      // must be false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
    tls: {
    rejectUnauthorized: false,
  },
});


/**
 * Send professional document email (e.g., registration credentials)
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.username - Student name
 * @param {string} options.password - Student password
 * @param {string} options.loginDate - Allowed login date
 */
export async function sendStudentRegistrationEmail({ to, username, password, loginDate }) {
  const htmlTemplate = `
  <div style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #4B6CB7;">Official Document</h2>
      </div>

      <!-- Greeting -->
      <p>Dear <strong>${username}</strong>,</p>
      <p>An official document containing your login credentials has been generated and is ready for your review.</p>

      <!-- Credentials Table -->
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px; font-weight: bold; background: #f0f0f0;">Username:</td>
          <td style="padding: 10px; background: #f9f9f9;">${username}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; background: #f0f0f0;">Password:</td>
          <td style="padding: 10px; background: #f9f9f9;">${password}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; background: #f0f0f0;">Login Date:</td>
          <td style="padding: 10px; background: #f9f9f9;">${loginDate}</td>
        </tr>
      </table>

      <!-- Action Button -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://yourdomain.com/login" 
           style="display:inline-block; padding: 12px 25px; background:#4B6CB7; color:#fff; text-decoration:none; border-radius: 5px;">
           Login
        </a>
      </div>

      <!-- Contact Section -->
      <div style="margin-top: 30px; text-align: center; font-size: 14px; color: #555;">
        <p>For any queries, contact us at <a href="mailto:support@yourdomain.com" style="color:#4B6CB7;">support@yourdomain.com</a> or call +91-XXXXXXXXXX</p>
      </div>

      <!-- Footer -->
      <p style="font-size: 12px; color: #888; text-align: center; margin-top: 20px;">
        If you did not register, please ignore this email.
      </p>
    </div>
  </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Official Document - NIT Portal",
    text: `Hello ${username}, your password is ${password}. Login after: ${loginDate}`,
    html: htmlTemplate
  });

  console.log(`Document email sent to ${to}`);
}

export default transporter;
