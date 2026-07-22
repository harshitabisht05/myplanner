const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema(
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
    mood: {
      type: String,
      enum: ['amazing', 'good', 'okay', 'low', 'tired'],
      required: true
    },
    note: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// One mood record per user per date
moodSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Mood', moodSchema);
