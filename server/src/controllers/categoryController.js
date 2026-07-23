const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  { name: 'Personal', icon: '🏠', color: 'indigo', isSystem: true },
  { name: 'Work', icon: '💼', color: 'emerald', isSystem: true },
  { name: 'Study', icon: '📚', color: 'purple', isSystem: true },
  { name: 'Break', icon: '☕', color: 'teal', isSystem: true },
  { name: 'Health & Fitness', icon: '🏋️', color: 'rose', isSystem: true },
  { name: 'Creative', icon: '🎨', color: 'amber', isSystem: true },
  { name: 'Other', icon: '📌', color: 'slate', isSystem: true }
];

// @desc    Get user categories (combined with defaults)
// @route   GET /api/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    const customCategories = await Category.find({ user: req.user._id }).sort({ name: 1 });
    
    // Merge custom categories with default ones (avoiding duplicates)
    const customNames = new Set(customCategories.map((c) => c.name.toLowerCase()));
    const mergedDefaults = DEFAULT_CATEGORIES.filter((d) => !customNames.has(d.name.toLowerCase()));

    res.status(200).json({
      success: true,
      categories: [...mergedDefaults, ...customCategories]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a custom category
// @route   POST /api/categories
// @access  Private
exports.createCategory = async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const existing = await Category.findOne({
      user: req.user._id,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists'
      });
    }

    const category = await Category.create({
      user: req.user._id,
      name: name.trim(),
      icon: icon || '📌',
      color: color || 'indigo',
      isSystem: false
    });

    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a custom category
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
