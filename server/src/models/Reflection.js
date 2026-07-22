const mongoose = require('mongoose');

const reflectionSchema = new mongoose.Schema(
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
    whatWentWell: {
      type: String,
      default: '',
      trim: true
    },
    whatCouldBeBetter: {
      type: String,
      default: '',
      trim: true
    },
    gratitude: {
      type: String,
      default: '',
      trim: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    }
  },
  {
    timestamps: true
  }
);

// One reflection per user per date
reflectionSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Reflection', reflectionSchema);
