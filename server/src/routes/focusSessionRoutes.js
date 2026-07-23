const express = require('express');
const router = express.Router();
const {
  getFocusSessions,
  createFocusSession,
  deleteFocusSession,
  getFocusAnalytics
} = require('../controllers/focusSessionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/analytics', getFocusAnalytics);

router.route('/')
  .get(getFocusSessions)
  .post(createFocusSession);

router.route('/:id')
  .delete(deleteFocusSession);

module.exports = router;
