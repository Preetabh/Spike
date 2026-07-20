// config/email.js

import dotenv from "dotenv";
import nodemailer from "nodemailer";
import axios from "axios";

dotenv.config();

// ✅ SMTP Transporter Setup (for fallback / local development)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

// ✅ Shared Email Sender Helper (Uses Brevo API in production/Render, falls back to SMTP locally)
const sendEmail = async ({ to, subject, html, fromName = "Spike" }) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.NODEMAILER_EMAIL || "no-reply@spike.com";

  if (brevoApiKey) {
    try {
      console.log(`✉️ Sending email to ${to} via Brevo HTTP API...`);
      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { name: fromName, email: senderEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": brevoApiKey,
          },
        }
      );
      console.log("✅ Email sent successfully via Brevo API:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Brevo API Error:", error.response?.data || error.message);
      throw new Error("Email sending failed via Brevo API");
    }
  } else {
    try {
      console.log(`✉️ Sending email to ${to} via SMTP (Local Fallback)...`);
      const info = await transporter.sendMail({
        from: `"${fromName}" <${senderEmail}>`,
        to,
        subject,
        html,
      });
      console.log("✅ Email sent successfully via SMTP:", info.messageId);
      return info;
    } catch (error) {
      console.error("❌ SMTP Error:", error.message);
      throw new Error("Email sending failed via SMTP");
    }
  }
};

// ✅ OTP EMAIL
export const sendOtpEmail = async (
  to,
  subject,
  otp
) => {
  const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>OTP Verification</title>
</head>

<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4ede4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
    <tr>
      <td align="center">

        <table width="400" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; padding:20px;">

          <tr>
            <td align="center" style="padding-bottom:20px;">
              <img
                src="https://res.cloudinary.com/dvtl5teo7/image/upload/v1774175170/logo_rdmb0n.png"
                alt="Spike Logo"
                width="50"
              />

              <h2 style="margin:10px 0; color:#4A154B;">
                Spike
              </h2>
            </td>
          </tr>

          <tr>
            <td align="center">
              <h3 style="color:#333;">
                Your OTP Code
              </h3>

              <p style="color:#666; font-size:14px;">
                Use the following OTP to verify your email address
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:20px 0;">
              <div
                style="
                  display:inline-block;
                  padding:12px 24px;
                  font-size:24px;
                  font-weight:bold;
                  color:#4A154B;
                  border:2px dashed #4A154B;
                  border-radius:8px;
                "
              >
                ${otp}
              </div>
            </td>
          </tr>

          <tr>
            <td align="center">
              <p style="font-size:12px; color:#999;">
                This OTP is valid for 5 minutes.
                Do not share it with anyone.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

  return sendEmail({
    to,
    subject,
    html: htmlTemplate,
    fromName: "Spike OTP",
  });
};


// ✅ WORKSPACE INVITE EMAIL
export const sendInviteEmail = async (
  to,
  workspaceName,
  inviteLink,
  invitedBy
) => {
  const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Workspace Invitation</title>
</head>

<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4ede4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
    <tr>
      <td align="center">

        <table width="450" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; padding:30px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <img
                src="https://res.cloudinary.com/dvtl5teo7/image/upload/v1774175170/logo_rdmb0n.png"
                alt="Spike Logo"
                width="55"
              />

              <h2 style="margin:10px 0; color:#4A154B;">
                Spike
              </h2>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center">
              <h2 style="color:#222; margin-bottom:10px;">
                You're Invited 🎉
              </h2>

              <p style="font-size:15px; color:#555; line-height:1.6;">
                <strong>${invitedBy}</strong>
                invited you to join the workspace:
              </p>

              <h3 style="color:#4A154B; margin-top:10px;">
                ${workspaceName}
              </h3>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding:30px 0;">
              <a
                href="${inviteLink}"
                style="
                  background:#4A154B;
                  color:#ffffff;
                  text-decoration:none;
                  padding:14px 28px;
                  border-radius:8px;
                  display:inline-block;
                  font-weight:bold;
                  font-size:15px;
                "
              >
                Join Workspace
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center">
              <p style="font-size:13px; color:#888; line-height:1.5;">
                This invitation link will expire in 24 hours.
              </p>

              <p style="font-size:12px; color:#aaa;">
                If you did not expect this invitation,
                you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

  return sendEmail({
    to,
    subject: `Invitation to join ${workspaceName}`,
    html: htmlTemplate,
    fromName: "Spike Workspace",
  });
};
