const Notification = require('../models/Notification');
const { sendTestDigestEmail } = require('../services/emailService');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send test email digest to user
// @route   POST /api/notifications/test-email
// @access  Private
exports.sendTestEmail = async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    const userName = req.user.name;

    // Send email via service
    await sendTestDigestEmail({ to: userEmail, userName });

    // Also record an in-app notification
    const notification = await Notification.create({
      user: req.user._id,
      title: 'Email Digest Delivered 📧',
      message: `A test email digest was delivered to ${userEmail}. Check your inbox!`,
      type: 'digest',
      link: '/settings'
    });

    res.status(200).json({
      success: true,
      message: `Test email digest sent successfully to ${userEmail}!`,
      notification
    });
  } catch (error) {
    // If SMTP credentials aren't configured in server .env
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to send test email. Check server SMTP credentials.'
    });
  }
};

// @desc    Create test notification for browser push test
// @route   POST /api/notifications/test-browser
// @access  Private
exports.createTestNotification = async (req, res, next) => {
  try {
    const notification = await Notification.create({
      user: req.user._id,
      title: 'Browser Notification Active 🔔',
      message: 'Desktop and push notifications are configured & active on your device!',
      type: 'system',
      link: '/today'
    });

    res.status(201).json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
};
