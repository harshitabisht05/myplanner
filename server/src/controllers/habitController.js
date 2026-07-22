const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');

// Helper to calculate streaks and stats for a habit
const calculateHabitStats = async (userId, habitId) => {
  const completions = await HabitCompletion.find({ user: userId, habit: habitId }).sort({ date: 1 });
  const datesSet = new Set(completions.map((c) => c.date));

  if (datesSet.size === 0) {
    return { currentStreak: 0, bestStreak: 0, totalCompletions: 0 };
  }

  // Calculate streaks across sorted dates
  const datesArray = Array.from(datesSet).sort();

  let bestStreak = 0;
  let tempStreak = 0;
  let lastDate = null;

  for (const dateStr of datesArray) {
    const currentDate = new Date(dateStr);
    if (!lastDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak += 1;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
    lastDate = currentDate;
  }

  // Calculate current streak ending today or yesterday
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = 0;
  let checkDate = datesSet.has(todayStr) ? today : (datesSet.has(yesterdayStr) ? yesterday : null);

  if (checkDate) {
    let curr = new Date(checkDate);
    while (true) {
      const currStr = curr.toISOString().split('T')[0];
      if (datesSet.has(currStr)) {
        currentStreak += 1;
        curr.setDate(curr.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    bestStreak,
    totalCompletions: datesSet.size
  };
};

// @route GET /api/habits
exports.getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ user: req.user._id, active: true }).sort({ createdAt: -1 });

    const startDateStr = req.query.startDate; // Optional YYYY-MM-DD
    const endDateStr = req.query.endDate;

    // Fetch completions for this user
    const query = { user: req.user._id };
    if (startDateStr && endDateStr) {
      query.date = { $gte: startDateStr, $lte: endDateStr };
    }

    const completions = await HabitCompletion.find(query);

    // Compute stats for each habit
    const habitsWithStats = await Promise.all(
      habits.map(async (habit) => {
        const stats = await calculateHabitStats(req.user._id, habit._id);
        const habitCompletions = completions.filter((c) => c.habit.toString() === habit._id.toString()).map((c) => c.date);

        return {
          ...habit.toObject(),
          completions: habitCompletions,
          currentStreak: stats.currentStreak,
          bestStreak: stats.bestStreak,
          totalCompletions: stats.totalCompletions
        };
      })
    );

    res.status(200).json({
      success: true,
      count: habitsWithStats.length,
      habits: habitsWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/habits
exports.createHabit = async (req, res, next) => {
  try {
    const { name, emoji, description } = req.body;
    const habit = await Habit.create({
      user: req.user._id,
      name,
      emoji: emoji || '✨',
      description: description || ''
    });

    res.status(201).json({
      success: true,
      habit: {
        ...habit.toObject(),
        completions: [],
        currentStreak: 0,
        bestStreak: 0,
        totalCompletions: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/habits/:id
exports.updateHabit = async (req, res, next) => {
  try {
    const { name, emoji, description, active } = req.body;
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name, emoji, description, active },
      { new: true, runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    const stats = await calculateHabitStats(req.user._id, habit._id);
    const completions = await HabitCompletion.find({ user: req.user._id, habit: habit._id });

    res.status(200).json({
      success: true,
      habit: {
        ...habit.toObject(),
        completions: completions.map((c) => c.date),
        currentStreak: stats.currentStreak,
        bestStreak: stats.bestStreak,
        totalCompletions: stats.totalCompletions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/habits/:id
exports.deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    // Clean up habit completions
    await HabitCompletion.deleteMany({ habit: req.params.id, user: req.user._id });

    res.status(200).json({ success: true, message: 'Habit and history deleted' });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/habits/:id/toggle
exports.toggleHabitCompletion = async (req, res, next) => {
  try {
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    const existing = await HabitCompletion.findOne({
      user: req.user._id,
      habit: habit._id,
      date: targetDate
    });

    let completed = false;
    if (existing) {
      await HabitCompletion.findByIdAndDelete(existing._id);
      completed = false;
    } else {
      await HabitCompletion.create({
        user: req.user._id,
        habit: habit._id,
        date: targetDate
      });
      completed = true;
    }

    const stats = await calculateHabitStats(req.user._id, habit._id);
    const completions = await HabitCompletion.find({ user: req.user._id, habit: habit._id });

    res.status(200).json({
      success: true,
      completed,
      habitId: habit._id,
      date: targetDate,
      completions: completions.map((c) => c.date),
      currentStreak: stats.currentStreak,
      bestStreak: stats.bestStreak
    });
  } catch (error) {
    next(error);
  }
};
