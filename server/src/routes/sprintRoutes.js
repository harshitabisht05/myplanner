const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const { requireWorkspaceMember } = require('../middleware/workspaceMiddleware');
const {
  getSprints,
  createSprint,
  updateSprint,
  getSprintSummary
} = require('../controllers/sprintController');

router.use(protect);
router.use(requireWorkspaceMember('viewer'));

router.route('/')
  .get(getSprints)
  .post(requireWorkspaceMember('manager'), createSprint);

router.route('/:sprintId')
  .put(requireWorkspaceMember('manager'), updateSprint);

router.route('/:sprintId/summary')
  .get(getSprintSummary);

module.exports = router;
