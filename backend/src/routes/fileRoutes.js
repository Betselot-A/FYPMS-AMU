const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|zip|jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error("Only documents and images are allowed"));
  },
});

router.use(protect);

// GET /api/files/:projectId
router.get("/:projectId", fileController.getProjectFiles);

// POST /api/files
router.post("/", upload.single("file"), fileController.uploadFile);

// DELETE /api/files/:id
router.delete("/:id", fileController.deleteFile);

module.exports = router;
