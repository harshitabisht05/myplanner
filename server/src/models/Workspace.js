const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'manager', 'developer', 'viewer'],
    default: 'developer'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: [100, 'Workspace name cannot exceed 100 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    icon: {
      type: String,
      default: '👥'
    },
    color: {
      type: String,
      default: '#8B5CF6' // Purple theme accent
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [memberSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Workspace', workspaceSchema);
