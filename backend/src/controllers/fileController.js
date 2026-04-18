const File = require("../models/File");
const Project = require("../models/Project");
const path = require("path");
const { uploadToGridFS, downloadFromGridFS, deleteFromGridFS } = require("../utils/gridfs");

/**
 * GET /api/files/:projectId
 * Get all documents for a specific project group
 */
const getProjectFiles = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const files = await File.find({ projectId })
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/files
 * Upload a new research document to a project repository
 */
const uploadFile = async (req, res, next) => {
  try {
    const { projectId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project context not found." });
    }

    // Upload to GridFS
    const fileId = await uploadToGridFS(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    const newFile = await File.create({
      originalName: req.file.originalname,
      fileId: fileId,
      fileType: path.extname(req.file.originalname).substring(1),
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      projectId: projectId,
    });

    res.status(201).json(newFile);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/files/download/:fileId
 * Download a file from GridFS
 */
const downloadFile = async (req, res, next) => {
  try {
    await downloadFromGridFS(req.params.fileId, res);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/files/:id
 * Remove a document from the project repository
 */
const deleteFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "Document not found." });
    }

    // Authorization check
    if (file.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'coordinator') {
        return res.status(403).json({ message: "Not authorized to delete this document." });
    }

    // Remove from GridFS
    await deleteFromGridFS(file.fileId);

    // Remove metadata record
    await file.deleteOne();
    res.json({ message: "Document removed successfully from database." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectFiles,
  uploadFile,
  downloadFile,
  deleteFile
};
