const express = require('express');
const router = express.Router();
const { getMoods, setMood } = require('../controllers/moodController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { moodSchema } = require('../validators');

router.use(protect);

router.route('/')
  .get(getMoods)
  .post(validate(moodSchema), setMood);

module.exports = router;
