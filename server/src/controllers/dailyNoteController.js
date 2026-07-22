const DailyNote = require('../models/DailyNote');

// @route GET /api/dailynote
exports.getDailyNote = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const note = await DailyNote.findOne({ user: req.user._id, date: targetDate });

    res.status(200).json({
      success: true,
      note: note || { date: targetDate, content: '' }
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/dailynote (Upsert)
exports.saveDailyNote = async (req, res, next) => {
  try {
    const { date, content } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const note = await DailyNote.findOneAndUpdate(
      { user: req.user._id, date: targetDate },
      { content: content || '' },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      note
    });
  } catch (error) {
    next(error);
  }
};
