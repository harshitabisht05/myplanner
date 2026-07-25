const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireWorkspaceMember } = require('../middleware/workspaceMiddleware');
const {
  getWorkspaces,
  createWorkspace,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  updateMemberRole,
  removeMember,
  getWorkspaceStats,
  searchWorkspace
} = require('../controllers/workspaceController');

router.use(protect);

router.route('/')
  .get(getWorkspaces)
  .post(createWorkspace);

router.route('/:workspaceId')
  .get(requireWorkspaceMember('viewer'), getWorkspaceById)
  .put(requireWorkspaceMember('admin'), updateWorkspace)
  .delete(requireWorkspaceMember('owner'), deleteWorkspace);

router.route('/:workspaceId/members')
  .post(requireWorkspaceMember('admin'), addMember);

router.route('/:workspaceId/members/:userId')
  .put(requireWorkspaceMember('admin'), updateMemberRole)
  .delete(requireWorkspaceMember('admin'), removeMember);

router.route('/:workspaceId/stats')
  .get(requireWorkspaceMember('viewer'), getWorkspaceStats);

router.route('/:workspaceId/search')
  .get(requireWorkspaceMember('viewer'), searchWorkspace);

module.exports = router;
