const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    dueDate: {
      type: String, // YYYY-MM-DD format for consistent local date filtering
      default: ''
    },
    dueTime: {
      type: String, // HH:mm format
      default: ''
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    category: {
      type: String,
      default: 'Personal',
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    },
    isTop3: {
      type: Boolean,
      default: false
    },
    top3Date: {
      type: String, // YYYY-MM-DD
      default: ''
    },
    timeBlock: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night', 'none'],
      default: 'none'
    },
    isRecurringDaily: {
      type: Boolean,
      default: false
    },
    completedDates: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, completed: 1 });
taskSchema.index({ user: 1, isTop3: 1, top3Date: 1 });

module.exports = mongoose.model('Task', taskSchema);
