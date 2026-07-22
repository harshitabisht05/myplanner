const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/emailService');

const sendTokenResponse = (user, statusCode, res) => {
  const secret = process.env.JWT_SECRET || 'planner_secret_key_2026';
  const token = jwt.sign({ id: user._id }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProduction, // Secure in production HTTPS
    sameSite: isProduction ? 'none' : 'lax'
  };

  const userObject = user.toObject ? user.toObject() : user;
  delete userObject.password;

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token, // Also provided in body for flexible client usage
      user: userObject
    });
};

// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/logout
exports.logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};

// @route PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/auth/preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    const { theme, weekStart, animations } = req.body;
    const user = await User.findById(req.user._id);

    if (theme !== undefined) user.preferences.theme = theme;
    if (weekStart !== undefined) user.preferences.weekStart = weekStart;
    if (animations !== undefined) user.preferences.animations = animations;

    await user.save();

    res.status(200).json({
      success: true,
      preferences: user.preferences,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(444 || 404).json({ success: false, message: 'No user found with that email address' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail({ to: user.email, resetUrl });
      res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email.'
      });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: emailError.message || 'Error sending password reset email'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/reset-password/:resetToken
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};
