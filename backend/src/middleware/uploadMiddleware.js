const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer configured for memory storage to support GridFS database storage
const memoryStorage = multer.memoryStorage();


const proposalFileFilter = (req, file, cb) => {
  const allowedTypes = [".pdf", ".docx", ".doc"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only .pdf, .doc and .docx files are allowed"), false);
  }
};

const uploadProposal = multer({
  storage: memoryStorage,
  fileFilter: proposalFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Generic upload instance
const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit default
  },
});

// Export both: 'upload' for backward compatibility and 'uploadProposal' for specific needs
module.exports = upload;
module.exports.uploadProposal = uploadProposal;
