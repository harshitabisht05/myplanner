const express = require('express');
const router = express.Router();
const { getDailyNote, saveDailyNote } = require('../controllers/dailyNoteController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { dailyNoteSchema } = require('../validators');

router.use(protect);

router.route('/')
  .get(getDailyNote)
  .post(validate(dailyNoteSchema), saveDailyNote);

module.exports = router;
