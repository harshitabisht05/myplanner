const express = require('express');
const router = express.Router();
const {
  getNotes,
  createNote,
  updateNote,
  togglePinNote,
  deleteNote
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { noteSchema } = require('../validators');

router.use(protect);

router.route('/')
  .get(getNotes)
  .post(validate(noteSchema), createNote);

router.route('/:id')
  .put(validate(noteSchema), updateNote)
  .delete(deleteNote);

router.patch('/:id/pin', togglePinNote);

module.exports = router;
