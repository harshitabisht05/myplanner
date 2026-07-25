const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { _id: false });

const chatMessageSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // For Direct Messages
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true
    },
    reactions: [reactionSchema],
    isPinned: {
      type: Boolean,
      default: false
    },
    attachments: [
      {
        name: String,
        url: String,
        size: Number
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
