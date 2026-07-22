const express = require('express');
const router = express.Router();
const {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addMilestone,
  updateMilestone,
  deleteMilestone
} = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { goalSchema } = require('../validators');

router.use(protect);

router.route('/')
  .get(getGoals)
  .post(validate(goalSchema), createGoal);

router.route('/:id')
  .put(validate(goalSchema), updateGoal)
  .delete(deleteGoal);

router.post('/:id/milestones', addMilestone);
router.put('/:id/milestones/:milestoneId', updateMilestone);
router.delete('/:id/milestones/:milestoneId', deleteMilestone);

module.exports = router;
