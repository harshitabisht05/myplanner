const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      default: 'Untitled Note',
      trim: true
    },
    content: {
      type: String,
      default: '',
      trim: true
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: 'lavender' // lavender, pink, blue, peach, mint, yellow
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

noteSchema.index({ user: 1, isPinned: -1, updatedAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
