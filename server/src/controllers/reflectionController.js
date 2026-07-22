const Reflection = require('../models/Reflection');

// @route GET /api/reflections
exports.getReflections = async (req, res, next) => {
  try {
    const { date } = req.query;
    const query = { user: req.user._id };

    if (date) {
      query.date = date;
      const reflection = await Reflection.findOne(query);
      return res.status(200).json({ success: true, reflection: reflection || null });
    }

    const reflections = await Reflection.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: reflections.length,
      reflections
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/reflections (Upsert)
exports.saveReflection = async (req, res, next) => {
  try {
    const { date, whatWentWell, whatCouldBeBetter, gratitude, rating } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const reflection = await Reflection.findOneAndUpdate(
      { user: req.user._id, date: targetDate },
      {
        whatWentWell: whatWentWell || '',
        whatCouldBeBetter: whatCouldBeBetter || '',
        gratitude: gratitude || '',
        rating: rating !== undefined ? Number(rating) : 3
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, reflection });
  } catch (error) {
    next(error);
  }
};
