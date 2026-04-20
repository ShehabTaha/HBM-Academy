/**
 * lib/email.ts
 *
 * Email sending integration for HBM Academy.
 *
 * ─── SETUP INSTRUCTIONS ────────────────────────────────────────────────────
 * This file uses Nodemailer with SMTP. To enable real email delivery:
 *
 * 1. Add the following variables to your .env.local:
 *
 *    SMTP_HOST=smtp.yourdomain.com
 *    SMTP_PORT=587
 *    SMTP_USER=noreply@yourdomain.com
 *    SMTP_PASS=your_smtp_password
 *    SMTP_FROM="HBM Academy <noreply@yourdomain.com>"
 *
 *    OR if using Gmail:
 *    SMTP_HOST=smtp.gmail.com
 *    SMTP_PORT=587
 *    SMTP_USER=youruser@gmail.com
 *    SMTP_PASS=your_app_password  (Google App Password, NOT your login password)
 *    SMTP_FROM="HBM Academy <youruser@gmail.com>"
 *
 *    OR if using Resend (https://resend.com — recommended):
 *    Change the transporter below to use Resend's SMTP:
 *    SMTP_HOST=smtp.resend.com
 *    SMTP_PORT=465
 *    SMTP_USER=resend
 *    SMTP_PASS=re_your_api_key
 *    SMTP_FROM="HBM Academy <onboarding@resend.dev>"
 *
 * 2. Install nodemailer:  npm install nodemailer @types/nodemailer
 *
 * 3. Remove the stub below and uncomment the real implementation.
 * ───────────────────────────────────────────────────────────────────────────
 */

import nodemailer from "nodemailer";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "HBM Academy <noreply@hbmacademy.com>",
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}

export function buildOTPEmailHTML(otp: string, purpose: string): string {
  const label =
    purpose === "primary_change"
      ? "change your primary email address"
      : "add a notification email address";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; margin: 0; }
    .body { padding: 32px; }
    .otp-box { background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp { font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #1e293b; }
    .footer { background: #f9fafb; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>HBM Academy</h1>
    </div>
    <div class="body">
      <p style="color:#374151;font-size:16px;">Hi there,</p>
      <p style="color:#374151;">You requested to ${label}. Use the verification code below:</p>
      <div class="otp-box">
        <div class="otp">${otp}</div>
      </div>
      <p style="color:#6b7280;font-size:14px;">This code expires in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
    </div>
    <div class="footer">HBM Academy · This is an automated message, please do not reply.</div>
  </div>
</body>
</html>
  `.trim();
}
