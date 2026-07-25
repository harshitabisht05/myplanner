const Activity = require('../models/Activity');

// @route GET /api/workspaces/:workspaceId/activity
exports.getActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({ workspace: req.params.workspaceId })
      .populate('user', 'name email avatar')
      .populate('project', 'title')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, count: activities.length, activities });
  } catch (error) {
    next(error);
  }
};
