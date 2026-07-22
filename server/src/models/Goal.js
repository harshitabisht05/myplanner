const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
});

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    targetDate: {
      type: String, // YYYY-MM-DD
      default: ''
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'paused'],
      default: 'in_progress'
    },
    milestones: [milestoneSchema]
  },
  {
    timestamps: true
  }
);

goalSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Goal', goalSchema);
