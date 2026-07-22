const Event = require('../models/Event');

// @route GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    const { startDate, endDate, date } = req.query;
    const query = { user: req.user._id };

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const events = await Event.find(query).sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/events
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, date, startTime, endTime, category } = req.body;
    const event = await Event.create({
      user: req.user._id,
      title,
      description: description || '',
      date,
      startTime: startTime || '',
      endTime: endTime || '',
      category: category || 'General'
    });

    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/events/:id
exports.updateEvent = async (req, res, next) => {
  try {
    const { title, description, date, startTime, endTime, category } = req.body;
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, description, date, startTime, endTime, category },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/events/:id
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
};
