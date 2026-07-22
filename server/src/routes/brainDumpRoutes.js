const express = require('express');
const router = express.Router();
const {
  getBrainDumpItems,
  createBrainDumpItem,
  updateBrainDumpItem,
  deleteBrainDumpItem,
  convertBrainDumpItem
} = require('../controllers/brainDumpController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { brainDumpSchema } = require('../validators');

router.use(protect);

router.route('/')
  .get(getBrainDumpItems)
  .post(validate(brainDumpSchema), createBrainDumpItem);

router.route('/:id')
  .put(updateBrainDumpItem)
  .delete(deleteBrainDumpItem);

router.post('/:id/convert', convertBrainDumpItem);

module.exports = router;
