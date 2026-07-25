const Sprint = require('../models/Sprint');
const WorkspaceTask = require('../models/WorkspaceTask');
const Activity = require('../models/Activity');

// @route GET /api/workspaces/:workspaceId/sprints
exports.getSprints = async (req, res, next) => {
  try {
    const sprints = await Sprint.find({ workspace: req.params.workspaceId })
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: sprints.length, sprints });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/workspaces/:workspaceId/sprints
exports.createSprint = async (req, res, next) => {
  try {
    const { name, goal, startDate, endDate, project, status } = req.body;

    const sprint = await Sprint.create({
      workspace: req.params.workspaceId,
      project: project || null,
      name,
      goal: goal || '',
      startDate: startDate || '',
      endDate: endDate || '',
      status: status || 'planned',
      createdBy: req.user._id
    });

    await Activity.create({
      workspace: req.params.workspaceId,
      user: req.user._id,
      action: 'sprint_created',
      details: `Created sprint "${sprint.name}"`
    });

    res.status(201).json({ success: true, sprint });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/workspaces/:workspaceId/sprints/:sprintId
exports.updateSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findOne({
      _id: req.params.sprintId,
      workspace: req.params.workspaceId
    });

    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Sprint not found' });
    }

    const { name, goal, startDate, endDate, status } = req.body;

    const oldStatus = sprint.status;

    if (name !== undefined) sprint.name = name;
    if (goal !== undefined) sprint.goal = goal;
    if (startDate !== undefined) sprint.startDate = startDate;
    if (endDate !== undefined) sprint.endDate = endDate;
    if (status !== undefined) sprint.status = status;

    await sprint.save();

    if (status && status !== oldStatus) {
      await Activity.create({
        workspace: req.params.workspaceId,
        user: req.user._id,
        action: status === 'active' ? 'sprint_started' : 'sprint_completed',
        details: `Sprint "${sprint.name}" ${status}`
      });
    }

    res.status(200).json({ success: true, sprint });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/workspaces/:workspaceId/sprints/:sprintId/summary
exports.getSprintSummary = async (req, res, next) => {
  try {
    const sprint = await Sprint.findOne({
      _id: req.params.sprintId,
      workspace: req.params.workspaceId
    }).populate('project', 'title');

    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Sprint not found' });
    }

    const tasks = await WorkspaceTask.find({ sprint: sprint._id })
      .populate('assignees', 'name avatar')
      .sort({ status: 1 });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    const remainingTasks = totalTasks - completedTasks;
    const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      sprint,
      summary: {
        totalTasks,
        completedTasks,
        remainingTasks,
        totalEstimatedHours,
        progressPercentage,
        tasks
      }
    });
  } catch (error) {
    next(error);
  }
};
