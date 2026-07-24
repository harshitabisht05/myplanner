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
          <h4 style="margin: 0 0 8px 0; color: #4c1d95;">What daily digests contain:</h4>
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

const sendDailyMorningDigest = async ({ to, userName, tasks = [], dateStr }) => {
  const { EMAIL_FROM } = process.env;
  const transporter = createTransporter();

  const formattedDate = dateStr || new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const tasksListHtml = tasks.length > 0
    ? tasks.map(t => `
        <li style="padding: 10px 12px; margin-bottom: 6px; background-color: #f8fafc; border-radius: 10px; border-left: 4px solid ${t.priority === 'high' ? '#ef4444' : t.priority === 'medium' ? '#f59e0b' : '#3b82f6'}; list-style: none;">
          <strong style="color: #1e293b; font-size: 14px;">${t.title}</strong>
          ${t.category ? `<span style="font-size: 11px; color: #7c3aed; background: #f3e8ff; padding: 2px 8px; border-radius: 6px; margin-left: 8px; font-weight: bold;">${t.category}</span>` : ''}
        </li>
      `).join('')
    : `<p style="color: #64748b; font-style: italic; font-size: 13px;">No scheduled tasks for today. A clear day to plan ahead or focus on deep work! ✨</p>`;

  const mailOptions = {
    from: EMAIL_FROM || 'notifications@mylittleplanner.app',
    to,
    subject: `🌅 Morning Digest: Your Plan for ${formattedDate} — My Little Planner`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 20px; background: linear-gradient(to bottom, #faf5ff, #ffffff);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #7c3aed; margin: 0; font-size: 24px;">Good Morning, ${userName || 'Friend'}! 🌅</h1>
          <p style="color: #6b21a8; font-size: 13px; font-weight: 600; margin-top: 4px;">${formattedDate}</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 16px; border: 1px solid #f3e8ff; margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin-top: 0; font-size: 16px;">Today's Objectives (${tasks.length} Tasks Scheduled)</h3>
          <ul style="padding: 0; margin: 12px 0 0 0;">
            ${tasksListHtml}
          </ul>
        </div>

        <div style="background-color: #f8fafc; padding: 16px; border-radius: 14px; border-left: 4px solid #7c3aed;">
          <h4 style="margin: 0 0 4px 0; color: #4c1d95; font-size: 14px;">Focus Quote of the Day:</h4>
          <p style="margin: 0; color: #475569; font-size: 13px; font-style: italic;">
            "Small steps every day bring gently remarkable results."
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px;">
          <p>Sent with 💜 by My Little Planner • Configure email digest settings anytime in Settings ⚙️</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendPasswordResetEmail,
  sendTestDigestEmail,
  sendDailyMorningDigest
};
