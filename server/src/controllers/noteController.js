const Note = require('../models/Note');

// @route GET /api/notes
exports.getNotes = async (req, res, next) => {
  try {
    const { search, tag, color } = req.query;
    const query = { user: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      query.tags = tag;
    }

    if (color) {
      query.color = color;
    }

    // Pinned notes first, then newest updated
    const notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/notes
exports.createNote = async (req, res, next) => {
  try {
    const { title, content, isPinned, color, tags } = req.body;
    const note = await Note.create({
      user: req.user._id,
      title: title || 'Untitled Note',
      content: content || '',
      isPinned: !!isPinned,
      color: color || 'lavender',
      tags: tags || []
    });

    res.status(201).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/notes/:id
exports.updateNote = async (req, res, next) => {
  try {
    const { title, content, isPinned, color, tags } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, content, isPinned, color, tags },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.status(200).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/notes/:id/pin
exports.togglePinNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.status(200).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/notes/:id
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.status(200).json({ success: true, message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
};
