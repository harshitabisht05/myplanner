const express = require('express');
const router = express.Router();
const {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitCompletion
} = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { habitSchema } = require('../validators');

router.use(protect);

router.route('/')
  .get(getHabits)
  .post(validate(habitSchema), createHabit);

router.route('/:id')
  .put(validate(habitSchema), updateHabit)
  .delete(deleteHabit);

router.post('/:id/toggle', toggleHabitCompletion);

module.exports = router;
