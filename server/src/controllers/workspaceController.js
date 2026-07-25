const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Channel = require('../models/Channel');
const Project = require('../models/Project');
const WorkspaceTask = require('../models/WorkspaceTask');
const Sprint = require('../models/Sprint');
const Activity = require('../models/Activity');
const WorkspaceFile = require('../models/WorkspaceFile');
const Comment = require('../models/Comment');

// Helper to record workspace activity
const logActivity = async (workspaceId, userId, action, details = '', projectId = null, taskId = null) => {
  try {
    await Activity.create({
      workspace: workspaceId,
      user: userId,
      action,
      details,
      project: projectId,
      task: taskId
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

// @route GET /api/workspaces
exports.getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: workspaces.length,
      workspaces
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/workspaces
exports.createWorkspace = async (req, res, next) => {
  try {
    const { name, description, icon, color } = req.body;

    const workspace = await Workspace.create({
      name,
      description: description || '',
      icon: icon || '👥',
      color: color || '#8B5CF6',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner', joinedAt: new Date() }]
    });

    // Auto-create default #general channel
    await Channel.create({
      workspace: workspace._id,
      name: 'general',
      description: 'General discussion channel',
      isPrivate: false,
      members: [req.user._id],
      createdBy: req.user._id
    });

    // Auto-create default sample project
    const defaultProject = await Project.create({
      workspace: workspace._id,
      title: 'Main Project',
      description: 'Default starter project for workspace',
      status: 'in_progress',
      priority: 'high',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      members: [req.user._id],
      labels: ['Setup', 'Core'],
      createdBy: req.user._id
    });

    // Auto-create sample tasks
    await WorkspaceTask.create({
      workspace: workspace._id,
      project: defaultProject._id,
      title: 'Welcome to your Workspace 🎉',
      description: 'Explore Kanban board, Sprints, Team Chat, Files, and Team Calendar.',
      status: 'in_progress',
      priority: 'high',
      assignees: [req.user._id],
      createdBy: req.user._id
    });

    await logActivity(workspace._id, req.user._id, 'workspace_created', `Created workspace "${workspace.name}"`);

    const populated = await Workspace.findById(workspace._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(201).json({
      success: true,
      workspace: populated
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/workspaces/:workspaceId
exports.getWorkspaceById = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    res.status(200).json({ success: true, workspace });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/workspaces/:workspaceId
exports.updateWorkspace = async (req, res, next) => {
  try {
    const { name, description, icon, color } = req.body;
    const workspace = req.workspace;

    if (name !== undefined) workspace.name = name;
    if (description !== undefined) workspace.description = description;
    if (icon !== undefined) workspace.icon = icon;
    if (color !== undefined) workspace.color = color;

    await workspace.save();
    await logActivity(workspace._id, req.user._id, 'workspace_updated', `Updated workspace settings`);

    res.status(200).json({ success: true, workspace });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/workspaces/:workspaceId
exports.deleteWorkspace = async (req, res, next) => {
  try {
    const workspace = req.workspace;
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only workspace owner can delete workspace' });
    }

    await Workspace.findByIdAndDelete(workspace._id);
    await Project.deleteMany({ workspace: workspace._id });
    await WorkspaceTask.deleteMany({ workspace: workspace._id });
    await Sprint.deleteMany({ workspace: workspace._id });
    await Channel.deleteMany({ workspace: workspace._id });
    await Activity.deleteMany({ workspace: workspace._id });

    res.status(200).json({ success: true, message: 'Workspace deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/workspaces/:workspaceId/members
exports.addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const workspace = req.workspace;

    const userToAdd = await User.findOne({ email: email.toLowerCase().trim() });
    if (!userToAdd) {
      return res.status(404).json({ success: false, message: `User with email "${email}" not found` });
    }

    const alreadyMember = workspace.members.some(
      (m) => m.user._id.toString() === userToAdd._id.toString() || m.user.toString() === userToAdd._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'User is already a member of this workspace' });
    }

    workspace.members.push({
      user: userToAdd._id,
      role: role || 'developer',
      joinedAt: new Date()
    });

    await workspace.save();
    await logActivity(workspace._id, req.user._id, 'member_joined', `Added ${userToAdd.name} as ${role || 'developer'}`);

    const updated = await Workspace.findById(workspace._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(200).json({ success: true, workspace: updated });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/workspaces/:workspaceId/members/:userId
exports.updateMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const workspace = req.workspace;
    const targetUserId = req.params.userId;

    const member = workspace.members.find((m) => m.user._id.toString() === targetUserId || m.user.toString() === targetUserId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in workspace' });
    }

    member.role = role;
    await workspace.save();
    await logActivity(workspace._id, req.user._id, 'role_updated', `Updated member role to ${role}`);

    const updated = await Workspace.findById(workspace._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(200).json({ success: true, workspace: updated });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/workspaces/:workspaceId/members/:userId
exports.removeMember = async (req, res, next) => {
  try {
    const workspace = req.workspace;
    const targetUserId = req.params.userId;

    if (workspace.owner.toString() === targetUserId) {
      return res.status(400).json({ success: false, message: 'Cannot remove workspace owner' });
    }

    workspace.members = workspace.members.filter(
      (m) => m.user._id.toString() !== targetUserId && m.user.toString() !== targetUserId
    );

    await workspace.save();
    await logActivity(workspace._id, req.user._id, 'member_removed', `Removed member from workspace`);

    res.status(200).json({ success: true, message: 'Member removed from workspace' });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/workspaces/:workspaceId/stats
exports.getWorkspaceStats = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId;
    const todayStr = new Date().toISOString().split('T')[0];

    const projects = await Project.find({ workspace: workspaceId }).limit(10);
    const assignedTasks = await WorkspaceTask.find({
      workspace: workspaceId,
      assignees: req.user._id,
      status: { $ne: 'done' }
    }).populate('project', 'title').sort({ dueDate: 1 });

    const todayDeadlines = await WorkspaceTask.find({
      workspace: workspaceId,
      dueDate: todayStr
    }).populate('assignees', 'name avatar');

    const activeSprint = await Sprint.findOne({
      workspace: workspaceId,
      status: 'active'
    });

    let sprintTasks = [];
    let sprintProgress = 0;
    if (activeSprint) {
      sprintTasks = await WorkspaceTask.find({ sprint: activeSprint._id });
      const doneCount = sprintTasks.filter((t) => t.status === 'done').length;
      sprintProgress = sprintTasks.length > 0 ? Math.round((doneCount / sprintTasks.length) * 100) : 0;
    }

    const recentActivities = await Activity.find({ workspace: workspaceId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentComments = await Comment.find({ workspace: workspaceId })
      .populate('user', 'name avatar')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        projectsCount: projects.length,
        assignedTasksCount: assignedTasks.length,
        assignedTasks,
        todayDeadlinesCount: todayDeadlines.length,
        todayDeadlines,
        activeSprint,
        sprintProgress,
        sprintTotalTasks: sprintTasks.length,
        recentProjects: projects,
        recentActivities,
        recentComments
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/workspaces/:workspaceId/search
exports.searchWorkspace = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId;
    const q = req.query.q || '';
    if (!q.trim()) {
      return res.status(200).json({ success: true, results: { projects: [], tasks: [], files: [] } });
    }

    const regex = new RegExp(q, 'i');

    const projects = await Project.find({
      workspace: workspaceId,
      $or: [{ title: regex }, { description: regex }]
    }).limit(5);

    const tasks = await WorkspaceTask.find({
      workspace: workspaceId,
      $or: [{ title: regex }, { description: regex }]
    }).limit(10);

    const files = await WorkspaceFile.find({
      workspace: workspaceId,
      name: regex
    }).limit(5);

    res.status(200).json({
      success: true,
      results: { projects, tasks, files }
    });
  } catch (error) {
    next(error);
  }
};
