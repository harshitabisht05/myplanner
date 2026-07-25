const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, 'Sprint name is required'],
      trim: true
    },
    goal: {
      type: String,
      default: ''
    },
    startDate: {
      type: String, // YYYY-MM-DD
      default: ''
    },
    endDate: {
      type: String, // YYYY-MM-DD
      default: ''
    },
    status: {
      type: String,
      enum: ['planned', 'active', 'completed'],
      default: 'planned'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Sprint', sprintSchema);
