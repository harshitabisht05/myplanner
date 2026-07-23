const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true
    },
    taskTitle: {
      type: String,
      default: '',
      trim: true
    },
    category: {
      type: String,
      default: 'Personal',
      trim: true,
      index: true
    },
    mode: {
      type: String,
      enum: ['focus', 'shortBreak', 'longBreak', 'custom'],
      default: 'focus'
    },
    durationMins: {
      type: Number,
      required: true,
      min: 0
    },
    elapsedSeconds: {
      type: Number,
      required: true,
      default: 0
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    isMidSessionSave: {
      type: Boolean,
      default: false
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

focusSessionSchema.index({ user: 1, completedAt: -1 });
focusSessionSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('FocusSession', focusSessionSchema);
