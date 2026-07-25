const Project = require('../models/Project');
const WorkspaceTask = require('../models/WorkspaceTask');
const Activity = require('../models/Activity');

// @route GET /api/workspaces/:workspaceId/projects
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ workspace: req.params.workspaceId })
      .populate('members', 'name email avatar')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: projects.length, projects });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/workspaces/:workspaceId/projects
exports.createProject = async (req, res, next) => {
  try {
    const { title, description, status, priority, deadline, members, labels } = req.body;

    const project = await Project.create({
      workspace: req.params.workspaceId,
      title,
      description: description || '',
      status: status || 'in_progress',
      priority: priority || 'medium',
      deadline: deadline || '',
      members: members || [req.user._id],
      labels: labels || [],
      createdBy: req.user._id
    });

    await Activity.create({
      workspace: req.params.workspaceId,
      project: project._id,
      user: req.user._id,
      action: 'project_created',
      details: `Created project "${project.title}"`
    });

    const populated = await Project.findById(project._id).populate('members', 'name email avatar');

    res.status(201).json({ success: true, project: populated });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/workspaces/:workspaceId/projects/:projectId
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      workspace: req.params.workspaceId
    }).populate('members', 'name email avatar');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const tasks = await WorkspaceTask.find({ project: project._id });
    const doneCount = tasks.filter((t) => t.status === 'done').length;
    const computedProgress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

    res.status(200).json({
      success: true,
      project: {
        ...project.toObject(),
        progress: computedProgress,
        tasksCount: tasks.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/workspaces/:workspaceId/projects/:projectId
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      workspace: req.params.workspaceId
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const { title, description, status, priority, deadline, members, labels, progress } = req.body;

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (priority !== undefined) project.priority = priority;
    if (deadline !== undefined) project.deadline = deadline;
    if (members !== undefined) project.members = members;
    if (labels !== undefined) project.labels = labels;
    if (progress !== undefined) project.progress = progress;

    await project.save();
    const updated = await Project.findById(project._id).populate('members', 'name email avatar');

    res.status(200).json({ success: true, project: updated });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/workspaces/:workspaceId/projects/:projectId
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.projectId,
      workspace: req.params.workspaceId
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await WorkspaceTask.deleteMany({ project: project._id });

    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};
