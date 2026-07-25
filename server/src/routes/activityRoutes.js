const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const { requireWorkspaceMember } = require('../middleware/workspaceMiddleware');
const { getActivities } = require('../controllers/activityController');

router.use(protect);
router.use(requireWorkspaceMember('viewer'));

router.route('/')
  .get(getActivities);

module.exports = router;
