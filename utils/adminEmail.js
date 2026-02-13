import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

// Send professional exam email
export const sendProfessionalEmail = async (
  email,
  studentName,
  examDate,
  adminMessage
) => {

  const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f5f7fb; padding:40px;">
    <div style="max-width:650px; margin:auto; background:#ffffff; padding:32px; border-radius:12px; box-shadow:0 8px 20px rgba(0,0,0,0.08);">

      <div style="text-align:center; margin-bottom:30px;">
        <h1 style="color:#0EA5E9; margin:0;">NIT Student Portal</h1>
        <p style="color:#64748B; margin-top:6px; font-size:14px;">
          <strong>Official Examination Communication</strong>
        </p>
      </div>

      <p style="font-size:16px;">Dear <strong>${studentName}</strong>,</p>

      <p style="font-size:15px; color:#334155; line-height:1.7;">
        We hope you are doing well and continuing your academic preparation with dedication and focus.
      </p>

      <div style="background:#EAF7FB; padding:18px; border-radius:10px; margin:20px 0;">
        <p style="margin:0; font-size:15px; color:#0F172A;">
          📌 <strong>Examination Date:</strong> ${examDate}
        </p>
      </div>

      ${adminMessage ? `
        <div style="background:#FFF7ED; padding:15px; border-radius:8px; margin:20px 0;">
          <p style="margin:0; font-size:14px;">
            <strong>Important Note from Administration:</strong><br>
            ${adminMessage}
          </p>
        </div>
      ` : ""}

      <p style="font-size:15px; color:#334155;">
        We wish you <strong>all the best for your upcoming examination.</strong>
      </p>

      <p style="margin-top:15px; font-size:15px;">
        Best regards,<br>
        <strong>Administrative Team</strong><br>
        NIT Student Portal
      </p>

    </div>
  </div>
  `;

  // SEND EMAIL
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Upcoming Examination Reminder",
    text: `Hello ${studentName}, your exam is on ${examDate}. ${adminMessage || ""}`,
    html,
  });

};
