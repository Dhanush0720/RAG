import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || "587", 10),
      secure: parseInt(SMTP_PORT, 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  return transporter;
};

/**
 * Sends a password reset email to the specified recipient.
 * If SMTP credentials are not configured, logs the link to console and returns simulated status.
 */
export const sendPasswordResetEmail = async ({ toEmail, resetToken, userName = "User" }) => {
  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;
  const sender = process.env.EMAIL_FROM || '"LexiRAG" <noreply@lexirag.ai>';

  const mailOptions = {
    from: sender,
    to: toEmail,
    subject: "Reset your LexiRAG Password",
    text: `Hello ${userName},\n\nYou recently requested to reset your password for your LexiRAG account. Use the link below to set a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\nIf you did not request this, you can safely ignore this email.\n\nBest regards,\nThe LexiRAG Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 30px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px; font-weight: 700; }
          .header p { color: #dbeafe; margin: 6px 0 0 0; font-size: 13px; }
          .content { padding: 36px 30px; color: #1e293b; line-height: 1.6; }
          .content h2 { font-size: 18px; font-weight: 600; margin-top: 0; color: #0f172a; }
          .button-wrapper { text-align: center; margin: 32px 0; }
          .button { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 13px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
          .link-fallback { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; word-break: break-all; font-size: 12px; color: #64748b; margin-top: 20px; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LexiRAG</h1>
            <p>Multilingual Legal Intelligence Platform</p>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello <strong>${userName}</strong>,</p>
            <p>We received a request to reset your password for your LexiRAG account. Click the button below to choose a new password:</p>
            <div class="button-wrapper">
              <a href="${resetUrl}" target="_blank" class="button">Reset Password</a>
            </div>
            <p style="font-size: 13px; color: #64748b;">This link is valid for <strong>1 hour</strong>. If you did not request a password reset, no action is needed and your account remains safe.</p>
            <div class="link-fallback">
              Can't click the button? Copy and paste this URL into your browser:<br/>
              <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} LexiRAG Legal Intelligence. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  const mailer = getTransporter();

  if (mailer) {
    try {
      const info = await mailer.sendMail(mailOptions);
      return { success: true, messageId: info.messageId, simulated: false };
    } catch (err) {
      console.error("[EMAIL ERROR] Failed to send email via SMTP:", err.message);
      // Fallback to simulated delivery so users aren't completely blocked
      console.log(`\n=========================================\n[LOCAL/FALLBACK RESET LINK]\nTo: ${toEmail}\nReset Link: ${resetUrl}\n=========================================\n`);
      return { success: true, simulated: true, resetUrl };
    }
  } else {
    // Development / unconfigured SMTP fallback:
    console.log(`\n=========================================\n[PASSWORD RESET EMAIL (Simulated - SMTP Not Configured)]\nTo: ${toEmail}\nReset Link: ${resetUrl}\nTo configure real emails, set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in backend/.env\n=========================================\n`);
    return { success: true, simulated: true, resetUrl };
  }
};
