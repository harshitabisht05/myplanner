const Task = require('../models/Task');

// @route GET /api/tasks
exports.getTasks = async (req, res, next) => {
  try {
    const { view, category, priority, completed, search, sortBy, date } = req.query;
    const query = { user: req.user._id };

    if (completed !== undefined) {
      query.completed = completed === 'true';
    }

    if (category) {
      query.category = category;
    }

    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const todayStr = date || new Date().toISOString().split('T')[0];

    if (view === 'today') {
      query.dueDate = todayStr;
    } else if (view === 'upcoming') {
      query.dueDate = { $gt: todayStr };
      query.completed = false;
    } else if (view === 'completed') {
      query.completed = true;
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'dueDate') {
      sort = { dueDate: 1, dueTime: 1, createdAt: -1 };
    } else if (sortBy === 'priority') {
      // Custom sorting done in memory or via match
      sort = { createdAt: -1 };
    } else if (sortBy === 'recentlyCreated') {
      sort = { createdAt: -1 };
    }

    let tasks = await Task.find(query).sort(sort);

    if (sortBy === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      tasks.sort((a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4));
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
    const { title, description, dueDate, dueTime, priority, category, isTop3, top3Date, timeBlock } = req.body;

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
      timeBlock: timeBlock || 'none'
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

    const { title, description, dueDate, dueTime, priority, category, completed, isTop3, top3Date, timeBlock } = req.body;

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

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;

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
