import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Gmail transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,          
  secure: false,      
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
 */
export async function sendStudentRegistrationEmail({
  to,
  username,
  password,
  loginDate,
}) {

  const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f5f7fb; padding:40px;">
    <div style="max-width:650px; margin:auto; background:#ffffff; padding:32px; border-radius:12px; box-shadow:0 8px 20px rgba(0,0,0,0.08);">

      <div style="text-align:center; margin-bottom:30px;">
        <h1 style="color:#0EA5E9; margin:0;">NIT Student Portal</h1>
        <p style="color:#64748B; margin-top:6px; font-size:14px;">
          <strong>Registration Details</strong>
        </p>
      </div>

      <p style="font-size:16px;">Dear Mrs/Mr: <strong>${username}</strong>,</p>

      <p style="font-size:15px; color:#334155; line-height:1.7;">
        Your account has been successfully created. Please find your login details below:
      </p>

      <div style="background:#EAF7FB; padding:18px; border-radius:10px; margin:20px 0;">
        <p style="margin:6px 0; font-size:15px;">
          <strong>Username:</strong> ${username}
        </p>
        <p style="margin:6px 0; font-size:15px;">
          <strong>Password:</strong> ${password}
        </p>
        <p style="margin:6px 0; font-size:15px;">
          <strong>Login Available From:</strong> ${loginDate}
        </p>
      </div>

      <div style="text-align:center; margin-top:25px;">
        <a href="https://yourdomain.com/login"
           style="display:inline-block; padding:12px 25px; background:#0EA5E9; color:#fff; text-decoration:none; border-radius:6px; font-size:14px;">
           Login to Portal
        </a>
      </div>

      <p style="margin-top:25px; font-size:15px;">
        Best regards,<br>
        <strong>Administrative Team</strong><br>
        NIT Student Portal
      </p>

      <p style="font-size:12px; color:#888; text-align:center; margin-top:20px;">
        If you did not request this registration, please ignore this email.
      </p>

    </div>
  </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Registration Details - NIT Portal",
    text: `Hello ${username}, your password is ${password}. Login after: ${loginDate}`,
    html,
  });
}


export default transporter;
