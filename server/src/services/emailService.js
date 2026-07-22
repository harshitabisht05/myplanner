const nodemailer = require('nodemailer');

const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error(
      'Email provider credentials (EMAIL_HOST, EMAIL_USER, EMAIL_PASS) are not configured on the server. Password reset email cannot be delivered.'
    );
  }

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT) || 587,
    secure: Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });

  const mailOptions = {
    from: EMAIL_FROM || 'noreply@mylittleplanner.app',
    to,
    subject: 'Password Reset Request — My Little Planner 🌸',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 12px;">
        <h2 style="color: #8b5cf6;">Reset Your Password</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your My Little Planner account. Click the button below to reset your password:</p>
        <div style="margin: 25px 0;">
          <a href="${resetUrl}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };
