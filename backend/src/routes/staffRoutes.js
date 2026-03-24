// ============================================================
// ProjectHub Staff Assignment & Project API Routes
// ============================================================

const express = require("express");
const router = express.Router();
const {
  getAdvisingProjects,
  getExaminingProjects,
} = require("../controllers/staffController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);
router.use(authorize("staff"));

// Projects where staff is advisor
router.get("/advising-projects", getAdvisingProjects);

// Projects where staff is examiner
router.get("/examining-projects", getExaminingProjects);

module.exports = router;
