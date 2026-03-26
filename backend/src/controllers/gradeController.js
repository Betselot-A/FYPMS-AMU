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
    
    // If no config exists, create a default one
    if (!config) {
      config = await GradeConfig.create({
        bands: [
          { label: "A+", minScore: 90, maxScore: 100, color: "bg-success/10 text-success border-success/20" },
          { label: "A", minScore: 85, maxScore: 89, color: "bg-success/10 text-success border-success/20" },
          { label: "B", minScore: 70, maxScore: 84, color: "bg-info/10 text-info border-info/20" },
          { label: "C", minScore: 50, maxScore: 69, color: "bg-warning/10 text-warning border-warning/20" },
          { label: "F", minScore: 0, maxScore: 49, color: "bg-destructive/10 text-destructive border-destructive/20" },
        ],
        criteria: [
          { name: "Proposal", weight: 10, phase: "coordinator" },
          { name: "Progress", weight: 30, phase: "advisor" },
          { name: "Final Presentation", weight: 60, phase: "examiner" },
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
 * Admin only
 */
const updateGradeConfig = async (req, res, next) => {
  try {
    const { bands, criteria } = req.body;
    
    let config = await GradeConfig.findOne();
    if (!config) {
      config = new GradeConfig();
    }
    
    if (bands) config.bands = bands;
    if (criteria) config.criteria = criteria;
    
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
