const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true // e.g. 'task_created', 'task_moved', 'comment_added', 'member_joined', 'sprint_started', 'file_uploaded'
    },
    details: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Activity', activitySchema);
