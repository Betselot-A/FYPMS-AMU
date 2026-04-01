const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const proposalDir = path.join(__dirname, "../../uploads/proposals");
const generalDir = path.join(__dirname, "../../uploads");

[proposalDir, generalDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Specialized storage for proposals
const proposalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, proposalDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "proposal-" + uniqueSuffix + path.extname(file.originalname));
  },
});

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
  storage: proposalStorage,
  fileFilter: proposalFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Generic upload instance for common usage (users, general submissions)
const upload = multer({
  dest: generalDir,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit default
  },
});

// Export both: 'upload' for backward compatibility and 'uploadProposal' for specific needs
module.exports = upload;
module.exports.uploadProposal = uploadProposal;
