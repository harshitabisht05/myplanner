const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
      maxlength: [100, 'Habit name cannot exceed 100 characters']
    },
    emoji: {
      type: String,
      default: '✨'
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Habit', habitSchema);
