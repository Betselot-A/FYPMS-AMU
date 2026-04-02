// ============================================================
// Grade Configuration Controller
// ============================================================

const GradeConfig = require("../models/GradeConfig");

/**
 * GET /api/grade-config
 */
const getGradeConfig = async (req, res, next) => {
  try {
    let config = await GradeConfig.findOne();
    
    // If no config exists, create a professional default setup
    if (!config) {
      config = await GradeConfig.create({
        bands: [
          { label: "A+", minScore: 90, maxScore: 100, color: "bg-success/10 text-success border-success/20" },
          { label: "A", minScore: 80, maxScore: 89, color: "bg-success/10 text-success border-success/20" },
          { label: "B", minScore: 70, maxScore: 79, color: "bg-info/10 text-info border-info/20" },
          { label: "C", minScore: 50, maxScore: 69, color: "bg-warning/10 text-warning border-warning/20" },
          { label: "F", minScore: 0, maxScore: 49, color: "bg-destructive/10 text-destructive border-destructive/20" },
        ],
        phases: [
          {
            id: "phase-advisor",
            name: "Advisor Evaluation",
            active: true,
            weight: 35,
            criteria: [
              { label: "Technical Competence", maxMark: 10 },
              { label: "Documentation & Progress", maxMark: 10 },
              { label: "Problem Solving Skills", maxMark: 10 },
              { label: "Communication & Ethics", maxMark: 5 },
            ],
          },
          {
            id: "phase-examiner",
            name: "Examiner Assessment",
            active: true,
            weight: 50,
            criteria: [
              { label: "Prototype / Implementation", maxMark: 25 },
              { label: "Final Report Quality", maxMark: 15 },
              { label: "Defense & Q&A Integrity", maxMark: 10 },
            ],
          },
          {
            id: "phase-coordinator",
            name: "Administrative Compliance",
            active: true,
            weight: 15,
            criteria: [
              { label: "Timeliness & Submission", maxMark: 10 },
              { label: "Attendance & Participation", maxMark: 5 },
            ],
          },
        ]
      });
    }
    
    res.json(config);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/grade-config
 * Admin or Coordinator ONLY
 */
const updateGradeConfig = async (req, res, next) => {
  try {
    const { bands, phases } = req.body;
    
    let config = await GradeConfig.findOne();
    if (!config) {
      config = new GradeConfig();
    }
    
    if (bands) config.bands = bands;
    if (phases) config.phases = phases;
    
    await config.save();
    res.json(config);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGradeConfig,
  updateGradeConfig,
};
