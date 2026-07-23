const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    icon: {
      type: String,
      default: '📌',
      trim: true
    },
    color: {
      type: String,
      default: 'indigo',
      trim: true
    },
    isSystem: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

categorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
