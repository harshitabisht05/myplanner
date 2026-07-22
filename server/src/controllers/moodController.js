const Mood = require('../models/Mood');

// @route GET /api/moods
exports.getMoods = async (req, res, next) => {
  try {
    const { startDate, endDate, date } = req.query;
    const query = { user: req.user._id };

    if (date) {
      query.date = date;
      const mood = await Mood.findOne(query);
      return res.status(200).json({ success: true, mood: mood || null });
    }

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const moods = await Mood.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: moods.length,
      moods
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/moods (Upsert)
exports.setMood = async (req, res, next) => {
  try {
    const { date, mood, note } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const updatedMood = await Mood.findOneAndUpdate(
      { user: req.user._id, date: targetDate },
      { mood, note: note || '' },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, mood: updatedMood });
  } catch (error) {
    next(error);
  }
};
