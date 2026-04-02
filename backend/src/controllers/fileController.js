const File = require("../models/File");
const Project = require("../models/Project");
const path = require("path");
const fs = require("fs");

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

    const newFile = await File.create({
      originalName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
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

    // Attempt to remove physical file
    const absolutePath = path.join(__dirname, "../../", file.filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    await file.deleteOne();
    res.json({ message: "Document removed successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectFiles,
  uploadFile,
  deleteFile
};
