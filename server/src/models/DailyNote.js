const mongoose = require('mongoose');

const dailyNoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    content: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Unique index: one daily note per user per date
dailyNoteSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyNote', dailyNoteSchema);
