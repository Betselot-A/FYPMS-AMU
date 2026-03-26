// ============================================================
// ProjectHub Grade Configuration Routes
// ============================================================

const express = require("express");
const router = express.Router();
const { getGradeConfig, updateGradeConfig } = require("../controllers/gradeController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);

router.get("/", getGradeConfig);
router.put("/", authorize("admin"), updateGradeConfig);

module.exports = router;
