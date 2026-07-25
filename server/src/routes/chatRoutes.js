const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const { requireWorkspaceMember } = require('../middleware/workspaceMiddleware');
const {
  getChannels,
  createChannel,
  getMessages,
  sendMessage,
  addReaction,
  togglePin
} = require('../controllers/chatController');

router.use(protect);
router.use(requireWorkspaceMember('viewer'));

router.route('/channels')
  .get(getChannels)
  .post(requireWorkspaceMember('developer'), createChannel);

router.route('/messages')
  .get(getMessages)
  .post(requireWorkspaceMember('developer'), sendMessage);

router.route('/messages/:messageId/reactions')
  .post(requireWorkspaceMember('developer'), addReaction);

router.route('/messages/:messageId/pin')
  .put(requireWorkspaceMember('developer'), togglePin);

module.exports = router;
