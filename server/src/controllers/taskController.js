const Task = require('../models/Task');

const getRequestLocalDate = (req) => {
  if (req.query && req.query.date) return req.query.date;
  if (req.body && req.body.date) return req.body.date;
  if (req.headers && req.headers['x-client-date']) return req.headers['x-client-date'];
  
  const tzOffsetMins = req.headers && req.headers['x-timezone-offset'] !== undefined
    ? -parseInt(req.headers['x-timezone-offset'], 10)
    : 330;
  
  const now = new Date();
  const localMs = now.getTime() + tzOffsetMins * 60 * 1000;
  const localDate = new Date(localMs);
  return localDate.toISOString().split('T')[0];
};

// @route GET /api/tasks
exports.getTasks = async (req, res, next) => {
  try {
    const { view, category, priority, completed, search, sortBy, date } = req.query;
    const targetDate = getRequestLocalDate(req);

    const baseQuery = { user: req.user._id };

    if (category) baseQuery.category = category;
    if (priority) baseQuery.priority = priority;
    if (search) {
      baseQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let rawTasks = [];

    if (view === 'today' || date) {
      // Find non-recurring tasks on targetDate OR recurring tasks created on or before targetDate
      const targetDateEnd = new Date(`${targetDate}T23:59:59.999Z`);
      const dateFilter = {
        $or: [
          { dueDate: targetDate },
          {
            isRecurringDaily: true,
            $or: [
              { dueDate: { $lte: targetDate } },
              { completedDates: targetDate },
              { createdAt: { $lte: targetDateEnd } },
              { dueDate: '' },
              { dueDate: { $exists: false } }
            ]
          }
        ]
      };
      rawTasks = await Task.find({ ...baseQuery, ...dateFilter });
    } else if (view === 'upcoming') {
      rawTasks = await Task.find({
        ...baseQuery,
        $or: [
          { dueDate: { $gt: targetDate }, completed: false },
          {
            isRecurringDaily: true,
            $or: [
              { dueDate: { $lte: targetDate } },
              { dueDate: '' },
              { dueDate: { $exists: false } }
            ]
          }
        ]
      });
    } else if (view === 'completed') {
      rawTasks = await Task.find({ ...baseQuery, completed: true });
    } else {
      rawTasks = await Task.find(baseQuery);
    }

    // Map tasks to compute date-specific completed status & effective due date for recurring tasks
    let tasks = rawTasks
      .filter((t) => {
        if ((view === 'today' || date) && t.isRecurringDaily && Array.isArray(t.excludedDates) && t.excludedDates.includes(targetDate)) {
          return false;
        }
        return true;
      })
      .map((t) => {
        const obj = t.toObject();
        if (obj.isRecurringDaily && (view === 'today' || date)) {
          obj.completed = Array.isArray(obj.completedDates) && obj.completedDates.includes(targetDate);
          obj.dueDate = targetDate;
        }
        return obj;
      });

    if (completed !== undefined) {
      const isComp = completed === 'true';
      tasks = tasks.filter((t) => t.completed === isComp);
    }

    // Helper to convert task time (dueTime or timeBlock) into total minutes from midnight (0 - 1439)
    const getTimeMinutes = (t) => {
      if (t.dueTime && typeof t.dueTime === 'string') {
        const raw = t.dueTime.trim();
        // Check for 12-hour AM/PM format (e.g., "9:30 AM", "02:15 PM")
        const ampmMatch = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (ampmMatch) {
          let hours = parseInt(ampmMatch[1], 10);
          const minutes = parseInt(ampmMatch[2], 10);
          const period = ampmMatch[3].toUpperCase();
          if (period === 'PM' && hours < 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          return hours * 60 + minutes;
        }
        // Check for 24-hour format (e.g., "09:30", "9:30", "14:00")
        const match24 = raw.match(/^(\d{1,2}):(\d{2})$/);
        if (match24) {
          const hours = parseInt(match24[1], 10);
          const minutes = parseInt(match24[2], 10);
          return hours * 60 + minutes;
        }
      }

      // Fallback to timeBlock presets if dueTime is not specified
      if (t.timeBlock === 'morning') return 8 * 60; // 08:00 (480 mins)
      if (t.timeBlock === 'afternoon') return 12 * 60; // 12:00 (720 mins)
      if (t.timeBlock === 'evening') return 17 * 60; // 17:00 (1020 mins)
      if (t.timeBlock === 'night') return 21 * 60; // 21:00 (1260 mins)
      if (t.timeBlock === 'midnight') return 23 * 60 + 59; // 23:59 (1439 mins)

      // Untimed tasks placed at the end of active list (1440 mins)
      return 1440;
    };

    if (sortBy === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      tasks.sort((a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4));
    } else if (sortBy === 'recentlyCreated') {
      tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // Default time-based sort: Uncompleted first, sorted strictly by time of day, then completed tasks sorted by time
      tasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const timeA = getTimeMinutes(a);
        const timeB = getTimeMinutes(b);
        if (timeA !== timeB) return timeA - timeB;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/tasks/:id
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, dueTime, priority, category, isTop3, top3Date, timeBlock, isRecurringDaily } = req.body;

    const targetTop3Date = top3Date || dueDate || getRequestLocalDate(req);

    // Backend enforcement of Max 3 Top 3 tasks per user per date
    if (isTop3) {
      const top3Count = await Task.countDocuments({
        user: req.user._id,
        isTop3: true,
        top3Date: targetTop3Date
      });
      if (top3Count >= 3) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 3 Top Priorities allowed for this day'
        });
      }
    }

    const effectiveDueDate = (isRecurringDaily && (!dueDate || dueDate === '')) ? getRequestLocalDate(req) : (dueDate || '');

    const task = await Task.create({
      user: req.user._id,
      title,
      description: description || '',
      dueDate: effectiveDueDate,
      dueTime: dueTime || '',
      priority: priority || 'medium',
      category: category || 'Personal',
      isTop3: !!isTop3,
      top3Date: targetTop3Date,
      timeBlock: timeBlock || 'none',
      isRecurringDaily: !!isRecurringDaily,
      completedDates: []
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { title, description, dueDate, dueTime, priority, category, completed, isTop3, top3Date, timeBlock, isRecurringDaily } = req.body;

    const targetTop3Date = top3Date !== undefined ? top3Date : (dueDate || task.top3Date || task.dueDate || getRequestLocalDate(req));

    // Top 3 validation check if enabling isTop3
    if (isTop3 === true && (!task.isTop3 || task.top3Date !== targetTop3Date)) {
      const top3Count = await Task.countDocuments({
        user: req.user._id,
        isTop3: true,
        top3Date: targetTop3Date,
        _id: { $ne: task._id }
      });
      if (top3Count >= 3) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 3 Top Priorities allowed for this day'
        });
      }
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (dueTime !== undefined) task.dueTime = dueTime;
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    if (timeBlock !== undefined) task.timeBlock = timeBlock;
    if (isRecurringDaily !== undefined) task.isRecurringDaily = isRecurringDaily;
    if (isTop3 !== undefined) {
      task.isTop3 = isTop3;
      task.top3Date = targetTop3Date;
    }
    if (completed !== undefined) {
      task.completed = completed;
      task.completedAt = completed ? new Date() : null;
    }

    await task.save();

    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/tasks/:id/toggle
exports.toggleTaskComplete = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const targetDate = req.query.date || req.body.date || getRequestLocalDate(req);

    if (task.isRecurringDaily) {
      if (!Array.isArray(task.completedDates)) {
        task.completedDates = [];
      }
      const idx = task.completedDates.indexOf(targetDate);
      if (idx > -1) {
        // Uncheck for targetDate -> restore dueDate to targetDate
        task.completedDates.splice(idx, 1);
        task.dueDate = targetDate;
      } else {
        // Check off for targetDate -> advance dueDate to tomorrow
        task.completedDates.push(targetDate);
        const [y, m, d] = targetDate.split('-').map(Number);
        const nextDateObj = new Date(y, m - 1, d + 1);
        const nextDateStr = `${nextDateObj.getFullYear()}-${String(nextDateObj.getMonth() + 1).padStart(2, '0')}-${String(nextDateObj.getDate()).padStart(2, '0')}`;
        task.dueDate = nextDateStr;
      }
      task.completed = task.completedDates.includes(targetDate);
    } else {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date() : null;
    }

    await task.save();

    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { deleteAll, date } = req.query;
    const targetDate = date || (req.body && req.body.date) || getRequestLocalDate(req);

    if (task.isRecurringDaily && deleteAll !== 'true') {
      if (!Array.isArray(task.excludedDates)) {
        task.excludedDates = [];
      }
      if (!task.excludedDates.includes(targetDate)) {
        task.excludedDates.push(targetDate);
        await task.save();
      }
      return res.status(200).json({
        success: true,
        message: `Recurring task removed for ${targetDate} only`,
        isExcludedOnly: true
      });
    }

    await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/tasks/completed
exports.clearCompleted = async (req, res, next) => {
  try {
    const { date, view } = req.query;
    const targetDate = date || getRequestLocalDate(req);
    const userId = req.user._id;

    if (view === 'today' || date) {
      const completedTasks = await Task.find({ user: userId });
      let deletedCount = 0;

      for (const task of completedTasks) {
        if (task.isRecurringDaily) {
          const isCompletedOnDate = Array.isArray(task.completedDates) && task.completedDates.includes(targetDate);
          if (isCompletedOnDate) {
            task.completedDates = task.completedDates.filter((d) => d !== targetDate);
            if (!Array.isArray(task.excludedDates)) task.excludedDates = [];
            if (!task.excludedDates.includes(targetDate)) {
              task.excludedDates.push(targetDate);
            }
            await task.save();
            deletedCount++;
          }
        } else if (task.completed || task.dueDate === targetDate) {
          if (task.completed) {
            await Task.deleteOne({ _id: task._id });
            deletedCount++;
          }
        }
      }

      return res.status(200).json({ success: true, message: `Cleared ${deletedCount} completed tasks`, count: deletedCount });
    } else {
      const nonRecurringResult = await Task.deleteMany({ user: userId, completed: true, isRecurringDaily: { $ne: true } });
      let count = nonRecurringResult.deletedCount || 0;

      const recurringTasks = await Task.find({ user: userId, isRecurringDaily: true });
      for (const task of recurringTasks) {
        if (Array.isArray(task.completedDates) && task.completedDates.length > 0) {
          if (!Array.isArray(task.excludedDates)) task.excludedDates = [];
          for (const d of task.completedDates) {
            if (!task.excludedDates.includes(d)) task.excludedDates.push(d);
          }
          task.completedDates = [];
          await task.save();
          count++;
        }
      }

      return res.status(200).json({ success: true, message: `Cleared ${count} completed tasks`, count });
    }
  } catch (error) {
    next(error);
  }
};
