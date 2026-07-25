const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const { requireWorkspaceMember } = require('../middleware/workspaceMiddleware');
const {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  addComment
} = require('../controllers/workspaceTaskController');

router.use(protect);
router.use(requireWorkspaceMember('viewer'));

router.route('/')
  .get(getTasks)
  .post(requireWorkspaceMember('developer'), createTask);

router.route('/:taskId')
  .get(getTaskById)
  .put(requireWorkspaceMember('developer'), updateTask)
  .delete(requireWorkspaceMember('manager'), deleteTask);

router.route('/:taskId/comments')
  .post(requireWorkspaceMember('developer'), addComment);

module.exports = router;
