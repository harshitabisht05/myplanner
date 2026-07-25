const nodemailer = require('nodemailer');

const createTransporter = () => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (
    !EMAIL_HOST ||
    !EMAIL_USER ||
    !EMAIL_PASS ||
    EMAIL_USER === 'your_smtp_user' ||
    EMAIL_PASS === 'your_smtp_password'
  ) {
    throw new Error(
      'SMTP Email credentials (EMAIL_USER & EMAIL_PASS) are currently set to default placeholders in server/.env. Please set your real email credentials (such as Gmail App Password or Mailtrap/SendGrid) in server/.env to enable sending emails.'
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

    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      if (err.message && (err.message.includes('550') || err.message.includes('testing emails'))) {
        throw new Error(`Resend Free Tier Restriction: Email could not be sent to "${to}". Resend free testing mode only permits sending emails to the account owner. Update server/.env with your Gmail App Password or verify a custom domain in Resend.`);
      }
      throw err;
    }
};

const sendDailyMorningDigest = async ({ to, userName, tasks = [], dateStr }) => {
  const { EMAIL_FROM } = process.env;
  const transporter = createTransporter();

  const formattedDate = dateStr || new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const tableRowsHtml = tasks.length > 0
    ? tasks.map((t, idx) => {
        const priorityBg = t.priority === 'high' ? '#fef2f2' : t.priority === 'medium' ? '#fffbeb' : '#eff6ff';
        const priorityColor = t.priority === 'high' ? '#dc2626' : t.priority === 'medium' ? '#d97706' : '#2563eb';
        const priorityBorder = t.priority === 'high' ? '#fecaca' : t.priority === 'medium' ? '#fde68a' : '#bfdbfe';
        const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        
        return `
          <tr style="background-color: ${rowBg}; border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 14px; color: #1e293b; font-weight: 600; font-size: 13.5px;">
              ${t.title}
            </td>
            <td style="padding: 12px 14px;">
              ${t.category ? `<span style="font-size: 11px; color: #7c3aed; background-color: #f3e8ff; border: 1px solid #e9d5ff; padding: 3px 8px; border-radius: 9999px; font-weight: 700;">${t.category}</span>` : '<span style="color: #94a3b8; font-size: 12px;">General</span>'}
            </td>
            <td style="padding: 12px 14px;">
              <span style="font-size: 11px; color: ${priorityColor}; background-color: ${priorityBg}; border: 1px solid ${priorityBorder}; padding: 3px 8px; border-radius: 9999px; font-weight: 700; text-transform: uppercase;">
                ${t.priority || 'normal'}
              </span>
            </td>
            <td style="padding: 12px 14px; text-align: center;">
              <span style="font-size: 11px; color: ${t.completed ? '#166534' : '#b45309'}; background-color: ${t.completed ? '#f0fdf4' : '#fffbeb'}; border: 1px solid ${t.completed ? '#bbf7d0' : '#fde68a'}; padding: 3px 8px; border-radius: 9999px; font-weight: 700;">
                ${t.completed ? '✅ Done' : '⏳ Pending'}
              </span>
            </td>
          </tr>
        `;
      }).join('')
    : `
      <tr>
        <td colspan="4" style="padding: 24px; text-align: center; color: #64748b; font-style: italic; font-size: 13px;">
          ✨ No scheduled tasks for today. Enjoy a clear day or focus on deep work!
        </td>
      </tr>
    `;

  const tasksTableHtml = `
    <div style="overflow-x: auto; border-radius: 12px; border: 1px solid #e2e8f0; margin-top: 12px;">
      <table style="width: 100%; border-collapse: collapse; font-family: inherit; font-size: 13px; text-align: left;">
        <thead>
          <tr style="background-color: #f8fafc; color: #475569; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Task Title</th>
            <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Category</th>
            <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Priority</th>
            <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>
    </div>
  `;

  const mailOptions = {
    from: EMAIL_FROM || 'notifications@mylittleplanner.app',
    to,
    subject: `🌅 Morning Digest: Your Schedule Table for ${formattedDate} — My Little Planner`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 20px; background: linear-gradient(to bottom, #faf5ff, #ffffff);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #7c3aed; margin: 0; font-size: 24px;">Good Morning, ${userName || 'Friend'}! 🌅</h1>
          <p style="color: #6b21a8; font-size: 13px; font-weight: 600; margin-top: 4px;">Schedule Overview • ${formattedDate}</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 16px; border: 1px solid #f3e8ff; margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin-top: 0; font-size: 16px;">Today's Schedule (${tasks.length} Tasks) 📊</h3>
          ${tasksTableHtml}
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

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    if (err.message && (err.message.includes('550') || err.message.includes('testing emails'))) {
      throw new Error(`Resend Free Tier Restriction: Email could not be sent to "${to}". Resend free testing mode only permits sending emails to the account owner. Update server/.env with your Gmail App Password or verify a custom domain in Resend.`);
    }
    throw err;
  }
};

const sendWorkspaceInviteEmail = async ({ to, inviterName, workspaceName, role, inviteUrl }) => {
  const { EMAIL_FROM } = process.env;
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: EMAIL_FROM || 'notifications@mylittleplanner.app',
      to,
      subject: `👥 Invitation to join "${workspaceName}" — My Little Planner`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #8b5cf6; margin-top: 0;">Workspace Invitation 👥</h2>
          <p style="color: #475569; font-size: 15px;">Hello,</p>
          <p style="color: #475569; font-size: 15px;"><strong>${inviterName || 'A teammate'}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace as a <strong>${role}</strong> on My Little Planner.</p>
          <p style="color: #475569; font-size: 15px;">Click the button below to accept the invitation and join the workspace:</p>
          <div style="margin: 25px 0;">
            <a href="${inviteUrl}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block;">Accept Invitation</a>
          </div>
          <p style="color: #94a3b8; font-size: 12px;">If you do not have an account yet, you will be prompted to register or log in first.</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Failed to send workspace invitation email:', err.message);
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendTestDigestEmail,
  sendDailyMorningDigest,
  sendWorkspaceInviteEmail
};
