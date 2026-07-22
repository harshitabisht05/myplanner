const mongoose = require('mongoose');

const brainDumpItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    archived: {
      type: Boolean,
      default: false
    },
    convertedTo: {
      type: {
        type: String,
        enum: ['task', 'note', 'event'],
        default: null
      },
      targetId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
      }
    }
  },
  {
    timestamps: true
  }
);

brainDumpItemSchema.index({ user: 1, archived: 1, createdAt: -1 });

module.exports = mongoose.model('BrainDumpItem', brainDumpItemSchema);
