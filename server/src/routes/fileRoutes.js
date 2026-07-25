const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const { requireWorkspaceMember } = require('../middleware/workspaceMiddleware');
const {
  getFiles,
  uploadFile,
  deleteFile
} = require('../controllers/fileController');

router.use(protect);
router.use(requireWorkspaceMember('viewer'));

router.route('/')
  .get(getFiles)
  .post(requireWorkspaceMember('developer'), uploadFile);

router.route('/:fileId')
  .delete(requireWorkspaceMember('developer'), deleteFile);

module.exports = router;
