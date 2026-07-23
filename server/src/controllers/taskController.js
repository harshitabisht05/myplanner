const Task = require('../models/Task');

// @route GET /api/tasks
exports.getTasks = async (req, res, next) => {
  try {
    const { view, category, priority, completed, search, sortBy, date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

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
      const dateFilter = {
        $or: [
          { dueDate: targetDate },
          {
            isRecurringDaily: true,
            $or: [
              { dueDate: { $lte: targetDate } },
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

    // Map tasks to compute date-specific completed status for recurring tasks
    let tasks = rawTasks.map((t) => {
      const obj = t.toObject();
      if (obj.isRecurringDaily) {
        obj.completed = Array.isArray(obj.completedDates) && obj.completedDates.includes(targetDate);
      }
      return obj;
    });

    if (completed !== undefined) {
      const isComp = completed === 'true';
      tasks = tasks.filter((t) => t.completed === isComp);
    }

    // Sorting logic
    const getTimeValue = (t) => {
      if (t.dueTime) return t.dueTime;
      if (t.timeBlock === 'morning') return '08:00';
      if (t.timeBlock === 'afternoon') return '12:00';
      if (t.timeBlock === 'evening') return '17:00';
      if (t.timeBlock === 'night') return '21:00';
      if (t.timeBlock === 'midnight') return '23:59';
      return '99:99';
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
        const timeA = getTimeValue(a);
        const timeB = getTimeValue(b);
        if (timeA !== timeB) return timeA.localeCompare(timeB);
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

    const targetTop3Date = top3Date || dueDate || new Date().toISOString().split('T')[0];

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

    const task = await Task.create({
      user: req.user._id,
      title,
      description: description || '',
      dueDate: dueDate || '',
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

    const targetTop3Date = top3Date !== undefined ? top3Date : (dueDate || task.top3Date || task.dueDate || new Date().toISOString().split('T')[0]);

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

    const targetDate = req.query.date || req.body.date || new Date().toISOString().split('T')[0];

    if (task.isRecurringDaily) {
      if (!Array.isArray(task.completedDates)) {
        task.completedDates = [];
      }
      const idx = task.completedDates.indexOf(targetDate);
      if (idx > -1) {
        task.completedDates.splice(idx, 1);
      } else {
        task.completedDates.push(targetDate);
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
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};
