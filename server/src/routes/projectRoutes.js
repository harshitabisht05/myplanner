const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const { requireWorkspaceMember } = require('../middleware/workspaceMiddleware');
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

router.use(protect);
router.use(requireWorkspaceMember('viewer'));

router.route('/')
  .get(getProjects)
  .post(requireWorkspaceMember('developer'), createProject);

router.route('/:projectId')
  .get(getProjectById)
  .put(requireWorkspaceMember('developer'), updateProject)
  .delete(requireWorkspaceMember('manager'), deleteProject);

module.exports = router;
