const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    startTime: {
      type: String, // HH:mm
      default: ''
    },
    endTime: {
      type: String, // HH:mm
      default: ''
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

eventSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Event', eventSchema);
