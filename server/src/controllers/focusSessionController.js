const FocusSession = require('../models/FocusSession');

// @desc    Get focus sessions and analytics for user
// @route   GET /api/focus
// @access  Private
exports.getFocusSessions = async (req, res, next) => {
  try {
    const { startDate, endDate, category, limit = 100 } = req.query;

    const query = { user: req.user._id };

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }

    const sessions = await FocusSession.find(query)
      .sort({ completedAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/log a focus session
// @route   POST /api/focus
// @access  Private
exports.createFocusSession = async (req, res, next) => {
  try {
    const { task, taskTitle, category, mode, durationMins, elapsedSeconds, isMidSessionSave, note, completedAt } = req.body;

    if (durationMins === undefined && elapsedSeconds === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Duration or elapsed time is required'
      });
    }

    const computedDuration = durationMins !== undefined
      ? Number(durationMins)
      : Math.max(1, Math.round((Number(elapsedSeconds) || 0) / 60));

    const computedElapsed = elapsedSeconds !== undefined
      ? Number(elapsedSeconds)
      : Math.round(computedDuration * 60);

    const session = await FocusSession.create({
      user: req.user._id,
      task: task || null,
      taskTitle: taskTitle || '',
      category: category || 'Personal',
      mode: mode || 'focus',
      durationMins: computedDuration,
      elapsedSeconds: computedElapsed,
      isMidSessionSave: !!isMidSessionSave,
      note: note || '',
      completedAt: completedAt ? new Date(completedAt) : new Date()
    });

    res.status(201).json({
      success: true,
      session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a focus session log
// @route   DELETE /api/focus/:id
// @access  Private
exports.deleteFocusSession = async (req, res, next) => {
  try {
    const session = await FocusSession.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Focus session log not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Focus session deleted'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated focus analytics
// @route   GET /api/focus/analytics
// @access  Private
exports.getFocusAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const sessions = await FocusSession.find({ user: userId }).sort({ completedAt: -1 });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalDurationMins = 0;
    let todayDurationMins = 0;
    let weekDurationMins = 0;
    let monthDurationMins = 0;

    const categoryBreakdown = {};
    const taskBreakdown = {};
    const modeBreakdown = { focus: 0, shortBreak: 0, longBreak: 0, custom: 0 };
    const dailyMap = {};

    sessions.forEach((s) => {
      const mins = s.durationMins || Math.round((s.elapsedSeconds || 0) / 60) || 0;
      totalDurationMins += mins;

      const sessionDate = new Date(s.completedAt);
      const sessionDateStr = sessionDate.toISOString().split('T')[0];

      if (sessionDateStr === todayStr) {
        todayDurationMins += mins;
      }
      if (sessionDate >= startOfWeek) {
        weekDurationMins += mins;
      }
      if (sessionDate >= startOfMonth) {
        monthDurationMins += mins;
      }

      // Category breakdown
      const cat = s.category || 'Personal';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + mins;

      // Task breakdown
      if (s.taskTitle) {
        taskBreakdown[s.taskTitle] = (taskBreakdown[s.taskTitle] || 0) + mins;
      }

      // Mode breakdown
      if (s.mode && modeBreakdown[s.mode] !== undefined) {
        modeBreakdown[s.mode] += mins;
      }

      // Daily map for last 30 days
      dailyMap[sessionDateStr] = (dailyMap[sessionDateStr] || 0) + mins;
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalDurationMins,
        todayDurationMins,
        weekDurationMins,
        monthDurationMins,
        totalSessions: sessions.length,
        categoryBreakdown,
        taskBreakdown,
        modeBreakdown,
        dailyMap
      }
    });
  } catch (error) {
    next(error);
  }
};
