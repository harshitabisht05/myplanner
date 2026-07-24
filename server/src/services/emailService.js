const nodemailer = require('nodemailer');

const createTransporter = () => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error(
      'Email provider credentials (EMAIL_HOST, EMAIL_USER, EMAIL_PASS) are not configured on the server. Please set them in your server .env file.'
    );
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT) || 587,
    secure: Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
};

const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const { EMAIL_FROM } = process.env;
  const transporter = createTransporter();

  const mailOptions = {
    from: EMAIL_FROM || 'noreply@mylittleplanner.app',
    to,
    subject: 'Password Reset Request — My Little Planner 🌸',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <h2 style="color: #8b5cf6; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #475569; font-size: 15px;">Hello,</p>
        <p style="color: #475569; font-size: 15px;">You requested a password reset for your My Little Planner account. Click the button below to reset your password:</p>
        <div style="margin: 25px 0;">
          <a href="${resetUrl}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 13px;">This link will expire in 1 hour.</p>
        <p style="color: #94a3b8; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendTestDigestEmail = async ({ to, userName }) => {
  const { EMAIL_FROM } = process.env;
  const transporter = createTransporter();

  const mailOptions = {
    from: EMAIL_FROM || 'notifications@mylittleplanner.app',
    to,
    subject: '🌸 Daily Planner Digest & Notification Test — My Little Planner',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 20px; background: linear-gradient(to bottom, #faf5ff, #ffffff);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #7c3aed; margin: 0; font-size: 24px;">My Little Planner 🌸</h1>
          <p style="color: #6b21a8; font-size: 14px; font-weight: 600; margin-top: 4px;">Notifications & Daily Email Digest Test</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 16px; border: 1px solid #f3e8ff; margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin-top: 0;">Hello, ${userName || 'Planner User'}! 👋</h3>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            This is a test email sent from your <strong>My Little Planner</strong> notification service! Your SMTP email integration (Nodemailer) is working smoothly.
          </p>
        </div>

        <div style="background-color: #f8fafc; padding: 16px; border-radius: 14px; border-left: 4px solid #8b5cf6;">
          <h4 style="margin: 0 0 8px 0; color: #4c1d95;">What daily digests will contain:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 13px; line-height: 1.6;">
            <li>Daily Scheduled Tasks & Objectives</li>
            <li>Focus Session Goals & Target Minutes</li>
            <li>Habit Streaks & Reflections Reminders</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px;">
          <p>Sent from My Little Planner • You can configure email preferences anytime in Settings ⚙️</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendPasswordResetEmail,
  sendTestDigestEmail
};
