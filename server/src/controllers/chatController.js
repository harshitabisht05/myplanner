const Channel = require('../models/Channel');
const ChatMessage = require('../models/ChatMessage');
const { emitWorkspaceEvent } = require('../socket');

// @route GET /api/workspaces/:workspaceId/chat/channels
exports.getChannels = async (req, res, next) => {
  try {
    const channels = await Channel.find({ workspace: req.params.workspaceId })
      .populate('members', 'name email avatar')
      .sort({ name: 1 });

    res.status(200).json({ success: true, count: channels.length, channels });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/workspaces/:workspaceId/chat/channels
exports.createChannel = async (req, res, next) => {
  try {
    const { name, description, isPrivate, memberIds } = req.body;

    const initialMembers = Array.isArray(memberIds) && memberIds.length > 0
      ? Array.from(new Set([...memberIds, req.user._id.toString()]))
      : [req.user._id];

    const channel = await Channel.create({
      workspace: req.params.workspaceId,
      name: name.toLowerCase().trim().replace(/\s+/g, '-'),
      description: description || '',
      isPrivate: !!isPrivate,
      members: initialMembers,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, channel });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/workspaces/:workspaceId/chat/messages
exports.getMessages = async (req, res, next) => {
  try {
    const { channelId, recipientId } = req.query;
    const query = { workspace: req.params.workspaceId };

    if (channelId) {
      query.channel = channelId;
    } else if (recipientId) {
      query.$or = [
        { sender: req.user._id, recipient: recipientId },
        { sender: recipientId, recipient: req.user._id }
      ];
    } else {
      // Default to general channel if exists
      const defaultChannel = await Channel.findOne({ workspace: req.params.workspaceId, name: 'general' });
      if (defaultChannel) query.channel = defaultChannel._id;
    }

    const messages = await ChatMessage.find(query)
      .populate('sender', 'name avatar email')
      .populate('recipient', 'name avatar email')
      .sort({ createdAt: 1 })
      .limit(100);

    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/workspaces/:workspaceId/chat/messages
exports.sendMessage = async (req, res, next) => {
  try {
    const { channelId, recipientId, content, attachments } = req.body;

    const message = await ChatMessage.create({
      workspace: req.params.workspaceId,
      channel: channelId || null,
      recipient: recipientId || null,
      sender: req.user._id,
      content,
      attachments: attachments || []
    });

    const populated = await ChatMessage.findById(message._id)
      .populate('sender', 'name avatar email')
      .populate('recipient', 'name avatar email');

    emitWorkspaceEvent(req.params.workspaceId, 'chat_message', populated);

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/workspaces/:workspaceId/chat/messages/:messageId/reactions
exports.addReaction = async (req, res, next) => {
  try {
    const { emoji } = req.body;
    const message = await ChatMessage.findOne({
      _id: req.params.messageId,
      workspace: req.params.workspaceId
    });

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    let rx = message.reactions.find((r) => r.emoji === emoji);
    if (!rx) {
      message.reactions.push({ emoji, users: [req.user._id] });
    } else {
      const idx = rx.users.indexOf(req.user._id);
      if (idx > -1) {
        rx.users.splice(idx, 1);
      } else {
        rx.users.push(req.user._id);
      }
    }

    await message.save();
    const updated = await ChatMessage.findById(message._id)
      .populate('sender', 'name avatar email')
      .populate('recipient', 'name avatar email');

    emitWorkspaceEvent(req.params.workspaceId, 'chat_reaction', updated);

    res.status(200).json({ success: true, message: updated });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/workspaces/:workspaceId/chat/messages/:messageId/pin
exports.togglePin = async (req, res, next) => {
  try {
    const message = await ChatMessage.findOne({
      _id: req.params.messageId,
      workspace: req.params.workspaceId
    });

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    message.isPinned = !message.isPinned;
    await message.save();

    res.status(200).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};
