const mongoose = require('mongoose');

const habitCompletionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true
    }
  },
  {
    timestamps: true
  }
);

// One HabitCompletion per user/habit/date
habitCompletionSchema.index({ user: 1, habit: 1, date: 1 }, { unique: true });
habitCompletionSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('HabitCompletion', habitCompletionSchema);
