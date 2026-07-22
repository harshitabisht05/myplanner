const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleTaskComplete,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { taskSchema } = require('../validators');

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(validate(taskSchema), createTask);

router.route('/:id')
  .get(getTaskById)
  .put(validate(taskSchema), updateTask)
  .delete(deleteTask);

router.patch('/:id/toggle', toggleTaskComplete);

module.exports = router;
