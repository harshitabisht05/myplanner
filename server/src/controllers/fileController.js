const WorkspaceFile = require('../models/WorkspaceFile');
const Activity = require('../models/Activity');

// @route GET /api/workspaces/:workspaceId/files
exports.getFiles = async (req, res, next) => {
  try {
    const { folder, project } = req.query;
    const query = { workspace: req.params.workspaceId };

    if (folder) query.folder = folder;
    if (project) query.project = project;

    const files = await WorkspaceFile.find(query)
      .populate('uploadedBy', 'name avatar')
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: files.length, files });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/workspaces/:workspaceId/files
exports.uploadFile = async (req, res, next) => {
  try {
    const { name, url, size, mimeType, folder, project, task } = req.body;

    const file = await WorkspaceFile.create({
      workspace: req.params.workspaceId,
      project: project || null,
      task: task || null,
      name,
      url: url || 'https://via.placeholder.com/150',
      size: size || 1024 * 50,
      mimeType: mimeType || 'application/pdf',
      folder: folder || 'General',
      version: 1,
      uploadedBy: req.user._id
    });

    await Activity.create({
      workspace: req.params.workspaceId,
      user: req.user._id,
      action: 'file_uploaded',
      details: `Uploaded file "${file.name}"`
    });

    const populated = await WorkspaceFile.findById(file._id)
      .populate('uploadedBy', 'name avatar')
      .populate('project', 'title');

    res.status(201).json({ success: true, file: populated });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/workspaces/:workspaceId/files/:fileId
exports.deleteFile = async (req, res, next) => {
  try {
    const file = await WorkspaceFile.findOneAndDelete({
      _id: req.params.fileId,
      workspace: req.params.workspaceId
    });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.status(200).json({ success: true, message: 'File deleted' });
  } catch (error) {
    next(error);
  }
};
