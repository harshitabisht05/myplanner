const WorkspaceTask = require('../models/WorkspaceTask');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');

// @route GET /api/workspaces/:workspaceId/tasks
exports.getTasks = async (req, res, next) => {
  try {
    const { project, sprint, status, assignee, search } = req.query;
    const query = { workspace: req.params.workspaceId };

    if (project) query.project = project;
    if (sprint) query.sprint = sprint;
    if (status) query.status = status;
    if (assignee) query.assignees = assignee;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await WorkspaceTask.find(query)
      .populate('project', 'title')
      .populate('sprint', 'name')
      .populate('assignees', 'name email avatar')
      .populate('watchers', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/workspaces/:workspaceId/tasks
exports.createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      project,
      sprint,
      assignees,
      watchers,
      dueDate,
      dueTime,
      estimatedHours,
      labels,
      checklist
    } = req.body;

    const task = await WorkspaceTask.create({
      workspace: req.params.workspaceId,
      project: project || null,
      sprint: sprint || null,
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      assignees: assignees || [],
      watchers: watchers || [req.user._id],
      dueDate: dueDate || '',
      dueTime: dueTime || '',
      estimatedHours: estimatedHours || 0,
      labels: labels || [],
      checklist: checklist || [],
      createdBy: req.user._id
    });

    await Activity.create({
      workspace: req.params.workspaceId,
      project: task.project,
      task: task._id,
      user: req.user._id,
      action: 'task_created',
      details: `Created task "${task.title}"`
    });

    const populated = await WorkspaceTask.findById(task._id)
      .populate('project', 'title')
      .populate('sprint', 'name')
      .populate('assignees', 'name email avatar')
      .populate('watchers', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.status(201).json({ success: true, task: populated });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/workspaces/:workspaceId/tasks/:taskId
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await WorkspaceTask.findOne({
      _id: req.params.taskId,
      workspace: req.params.workspaceId
    })
      .populate('project', 'title')
      .populate('sprint', 'name')
      .populate('assignees', 'name email avatar')
      .populate('watchers', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const comments = await Comment.find({ task: task._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: 1 });

    const activities = await Activity.find({ task: task._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      task,
      comments,
      activities
    });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/workspaces/:workspaceId/tasks/:taskId
exports.updateTask = async (req, res, next) => {
  try {
    const task = await WorkspaceTask.findOne({
      _id: req.params.taskId,
      workspace: req.params.workspaceId
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const {
      title,
      description,
      status,
      priority,
      project,
      sprint,
      assignees,
      watchers,
      dueDate,
      dueTime,
      estimatedHours,
      labels,
      checklist,
      order
    } = req.body;

    const oldStatus = task.status;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (project !== undefined) task.project = project;
    if (sprint !== undefined) task.sprint = sprint;
    if (assignees !== undefined) task.assignees = assignees;
    if (watchers !== undefined) task.watchers = watchers;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (dueTime !== undefined) task.dueTime = dueTime;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (labels !== undefined) task.labels = labels;
    if (checklist !== undefined) task.checklist = checklist;
    if (order !== undefined) task.order = order;

    await task.save();

    if (status && status !== oldStatus) {
      await Activity.create({
        workspace: req.params.workspaceId,
        project: task.project,
        task: task._id,
        user: req.user._id,
        action: 'task_moved',
        details: `Moved "${task.title}" from ${oldStatus} to ${status}`
      });
    }

    const updated = await WorkspaceTask.findById(task._id)
      .populate('project', 'title')
      .populate('sprint', 'name')
      .populate('assignees', 'name email avatar')
      .populate('watchers', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.status(200).json({ success: true, task: updated });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/workspaces/:workspaceId/tasks/:taskId
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await WorkspaceTask.findOneAndDelete({
      _id: req.params.taskId,
      workspace: req.params.workspaceId
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await Comment.deleteMany({ task: task._id });

    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/workspaces/:workspaceId/tasks/:taskId/comments
exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const task = await WorkspaceTask.findOne({
      _id: req.params.taskId,
      workspace: req.params.workspaceId
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const comment = await Comment.create({
      workspace: req.params.workspaceId,
      task: task._id,
      project: task.project,
      user: req.user._id,
      content
    });

    await Activity.create({
      workspace: req.params.workspaceId,
      project: task.project,
      task: task._id,
      user: req.user._id,
      action: 'comment_added',
      details: `Commented on "${task.title}"`
    });

    const populated = await Comment.findById(comment._id).populate('user', 'name avatar');

    res.status(201).json({ success: true, comment: populated });
  } catch (error) {
    next(error);
  }
};
