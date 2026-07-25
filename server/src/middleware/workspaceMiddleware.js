const Workspace = require('../models/Workspace');

const ROLE_HIERARCHY = {
  owner: 5,
  admin: 4,
  manager: 3,
  developer: 2,
  viewer: 1
};

exports.requireWorkspaceMember = (minRole = 'viewer') => {
  return async (req, res, next) => {
    try {
      const workspaceId =
        req.params.workspaceId ||
        req.headers['x-workspace-id'] ||
        req.query.workspaceId ||
        (req.body && req.body.workspaceId);

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          message: 'Workspace ID is required for this action'
        });
      }

      const workspace = await Workspace.findById(workspaceId).populate('members.user', 'name email avatar');
      if (!workspace) {
        return res.status(404).json({
          success: false,
          message: 'Workspace not found'
        });
      }

      // Check if current user is owner or member
      const isOwner = workspace.owner.toString() === req.user._id.toString();
      const member = workspace.members.find(
        (m) => m.user._id.toString() === req.user._id.toString() || m.user.toString() === req.user._id.toString()
      );

      if (!isOwner && !member) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not a member of this workspace.'
        });
      }

      const userRole = isOwner ? 'owner' : member.role;
      const userLevel = ROLE_HIERARCHY[userRole] || 1;
      const requiredLevel = ROLE_HIERARCHY[minRole] || 1;

      if (userLevel < requiredLevel) {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required role: ${minRole} or higher.`
        });
      }

      req.workspace = workspace;
      req.workspaceRole = userRole;
      next();
    } catch (error) {
      next(error);
    }
  };
};
