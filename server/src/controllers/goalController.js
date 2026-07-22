const Goal = require('../models/Goal');

const formatGoalWithProgress = (goalDoc) => {
  const goal = goalDoc.toObject ? goalDoc.toObject() : goalDoc;
  const total = goal.milestones ? goal.milestones.length : 0;
  const completedCount = goal.milestones ? goal.milestones.filter((m) => m.completed).length : 0;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : goal.status === 'completed' ? 100 : 0;

  return {
    ...goal,
    progress,
    totalMilestones: total,
    completedMilestones: completedCount
  };
};

// @route GET /api/goals
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    const formatted = goals.map(formatGoalWithProgress);
    res.status(200).json({ success: true, count: formatted.length, goals: formatted });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/goals
exports.createGoal = async (req, res, next) => {
  try {
    const { title, description, targetDate, status, milestones } = req.body;
    const goal = await Goal.create({
      user: req.user._id,
      title,
      description: description || '',
      targetDate: targetDate || '',
      status: status || 'in_progress',
      milestones: milestones || []
    });

    res.status(201).json({ success: true, goal: formatGoalWithProgress(goal) });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/goals/:id
exports.updateGoal = async (req, res, next) => {
  try {
    const { title, description, targetDate, status } = req.body;
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, description, targetDate, status },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    res.status(200).json({ success: true, goal: formatGoalWithProgress(goal) });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/goals/:id
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    res.status(200).json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/goals/:id/milestones
exports.addMilestone = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Milestone title is required' });
    }

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    goal.milestones.push({ title, completed: false });
    await goal.save();

    res.status(201).json({ success: true, goal: formatGoalWithProgress(goal) });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/goals/:id/milestones/:milestoneId
exports.updateMilestone = async (req, res, next) => {
  try {
    const { title, completed } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const milestone = goal.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    if (title !== undefined) milestone.title = title;
    if (completed !== undefined) {
      milestone.completed = completed;
      milestone.completedAt = completed ? new Date() : null;
    }

    await goal.save();

    res.status(200).json({ success: true, goal: formatGoalWithProgress(goal) });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/goals/:id/milestones/:milestoneId
exports.deleteMilestone = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    goal.milestones.pull({ _id: req.params.milestoneId });
    await goal.save();

    res.status(200).json({ success: true, goal: formatGoalWithProgress(goal) });
  } catch (error) {
    next(error);
  }
};
