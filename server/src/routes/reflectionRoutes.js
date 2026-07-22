const express = require('express');
const router = express.Router();
const { getReflections, saveReflection } = require('../controllers/reflectionController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { reflectionSchema } = require('../validators');

router.use(protect);

router.route('/')
  .get(getReflections)
  .post(validate(reflectionSchema), saveReflection);

module.exports = router;
