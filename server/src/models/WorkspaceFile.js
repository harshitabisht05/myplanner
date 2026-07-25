const mongoose = require('mongoose');

const workspaceFileSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkspaceTask'
    },
    name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 0
    },
    mimeType: {
      type: String,
      default: 'application/octet-stream'
    },
    folder: {
      type: String,
      default: 'General'
    },
    version: {
      type: Number,
      default: 1
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('WorkspaceFile', workspaceFileSchema);
