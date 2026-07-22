const express = require('express');
const router = express.Router();
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { eventSchema } = require('../validators');

router.use(protect);

router.route('/')
  .get(getEvents)
  .post(validate(eventSchema), createEvent);

router.route('/:id')
  .put(validate(eventSchema), updateEvent)
  .delete(deleteEvent);

module.exports = router;
