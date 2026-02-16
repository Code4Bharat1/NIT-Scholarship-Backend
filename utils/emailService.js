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
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});



/* =====================================================
   SEND OTP EMAIL
===================================================== */
export async function sendOtpEmail(to, otp) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Your OTP Verification Code",
    html: `
      <div style="font-family:Arial;padding:30px;background:#f4f6fb;">
        <div style="max-width:500px;margin:auto;background:white;padding:25px;border-radius:10px;">
          <h2 style="color:#0EA5E9;text-align:center;">Email Verification</h2>
          <p style="font-size:16px;text-align:center;">
            Your OTP code is:
          </p>
          <h1 style="text-align:center;color:#0EA5E9;letter-spacing:5px;">
            ${otp}
          </h1>
          <p style="text-align:center;font-size:14px;color:#555;">
            This OTP is valid for 5 minutes.
          </p>
        </div>
      </div>
    `,
  });
}



/* =====================================================
   SEND STUDENT REGISTRATION EMAIL
===================================================== */
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
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p><strong>Login Available From:</strong> ${loginDate}</p>
      </div>

      <p style="margin-top:25px;">
        Best regards,<br>
        <strong>Administrative Team</strong>
      </p>

    </div>
  </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Registration Details - NIT Portal",
    text: `Hello ${username}, your password is ${password}`,
    html,
  });
}


export default transporter;
