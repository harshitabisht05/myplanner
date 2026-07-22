const BrainDumpItem = require('../models/BrainDumpItem');
const Task = require('../models/Task');
const Note = require('../models/Note');
const Event = require('../models/Event');

// @route GET /api/braindump
exports.getBrainDumpItems = async (req, res, next) => {
  try {
    const { includeArchived } = req.query;
    const query = { user: req.user._id };

    if (includeArchived !== 'true') {
      query.archived = false;
    }

    const items = await BrainDumpItem.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: items.length, items });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/braindump
exports.createBrainDumpItem = async (req, res, next) => {
  try {
    const { content, category } = req.body;
    const item = await BrainDumpItem.create({
      user: req.user._id,
      content,
      category: category || 'General'
    });

    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/braindump/:id
exports.updateBrainDumpItem = async (req, res, next) => {
  try {
    const { content, category, archived } = req.body;
    const item = await BrainDumpItem.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { content, category, archived },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.status(200).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/braindump/:id
exports.deleteBrainDumpItem = async (req, res, next) => {
  try {
    const item = await BrainDumpItem.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.status(200).json({ success: true, message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/braindump/:id/convert
exports.convertBrainDumpItem = async (req, res, next) => {
  try {
    const { targetType, dueDate, dueTime, priority, date, startTime, endTime, category } = req.body;

    const item = await BrainDumpItem.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Brain dump item not found' });
    }

    let createdEntity = null;

    if (targetType === 'task') {
      createdEntity = await Task.create({
        user: req.user._id,
        title: item.content,
        description: '',
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        dueTime: dueTime || '',
        priority: priority || 'medium',
        category: category || item.category || 'Personal'
      });
    } else if (targetType === 'note') {
      const titleLines = item.content.split('\n');
      const title = titleLines[0].substring(0, 50);
      createdEntity = await Note.create({
        user: req.user._id,
        title,
        content: item.content,
        color: 'lavender'
      });
    } else if (targetType === 'event') {
      createdEntity = await Event.create({
        user: req.user._id,
        title: item.content,
        description: '',
        date: date || dueDate || new Date().toISOString().split('T')[0],
        startTime: startTime || '09:00',
        endTime: endTime || '10:00',
        category: category || item.category || 'General'
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid targetType. Must be task, note, or event.' });
    }

    item.archived = true;
    item.convertedTo = {
      type: targetType,
      targetId: createdEntity._id
    };
    await item.save();

    res.status(200).json({
      success: true,
      message: `Converted to ${targetType} successfully`,
      convertedTo: targetType,
      createdEntity,
      item
    });
  } catch (error) {
    next(error);
  }
};
