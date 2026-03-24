// ============================================================
// ProjectHub Project & Lifecycle Management
// ============================================================

const Project = require("../models/Project");
const Notification = require("../models/Notification");

/**
 * GET /api/projects
 * Returns projects based on user role
 */
const getProjects = async (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;
    const { status, advisorId, examinerId } = req.query;
    let filter = {};

    // Role-based filtering
    if (role === "student") {
      filter.groupMembers = userId;
    } else if (role === "staff") {
      filter.$or = [{ advisorId: userId }, { examinerId: userId }];
    }
    // coordinator & admin see all

    if (status) filter.status = status;
    if (advisorId) filter.advisorId = advisorId;
    if (examinerId) filter.examinerId = examinerId;

    const projects = await Project.find(filter)
      .populate("groupMembers", "name email")
      .populate("advisorId", "name email")
      .populate("examinerId", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects/:id
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("groupMembers", "name email department cgpa")
      .populate("advisorId", "name email department")
      .populate("examinerId", "name email department");

    if (!project) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "Project not found",
      });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/projects
 * Coordinator — create a new project
 */
const createProject = async (req, res, next) => {
  try {
    const { title, description, groupMembers, advisorId, examinerId, deadline, milestones } =
      req.body;

    const project = await Project.create({
      title,
      description,
      groupMembers: groupMembers || [],
      advisorId: advisorId || null,
      examinerId: examinerId || null,
      deadline,
      milestones: milestones || [],
    });

    // Notify group members
    if (groupMembers && groupMembers.length > 0) {
      const notifications = groupMembers.map((memberId) => ({
        userId: memberId,
        message: `You have been added to project: "${title}"`,
        type: "info",
      }));
      await Notification.insertMany(notifications);
    }

    const populated = await Project.findById(project._id)
      .populate("groupMembers", "name email")
      .populate("advisorId", "name email")
      .populate("examinerId", "name email");

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/projects/:id
 * Coordinator — update project details
 */
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "Project not found",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "advisorId",
      "examinerId",
      "status",
      "deadline",
      "progress",
      "groupMembers",
      "milestones",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    await project.save();

    const populated = await Project.findById(project._id)
      .populate("groupMembers", "name email")
      .populate("advisorId", "name email")
      .populate("examinerId", "name email");

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/projects/:id
 * Coordinator — delete a project
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "Project not found",
      });
    }
    res.json({ message: "Project deleted" });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/projects/:projectId/milestones/:milestoneId
 * Advisor/Coordinator — update a milestone
 */
const updateMilestone = async (req, res, next) => {
  try {
    const { projectId, milestoneId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "Project not found",
      });
    }

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "Milestone not found",
      });
    }

    if (req.body.status !== undefined) milestone.status = req.body.status;
    if (req.body.dueDate !== undefined) milestone.dueDate = req.body.dueDate;
    if (req.body.title !== undefined) milestone.title = req.body.title;
    if (req.body.description !== undefined) milestone.description = req.body.description;

    await project.save();

    res.json(milestone);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/projects/:id/proposals
 * Student — submit a project title proposal (max 3 per group)
 */
const submitProposal = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.proposalStatus === "approved") {
      return res.status(400).json({ message: "A proposal has already been approved for this group" });
    }
    if (project.proposals.length >= 3) {
      return res.status(400).json({ message: "Maximum of 3 proposals already submitted" });
    }

    const { title, description } = req.body;
    project.proposals.push({ title, description, submittedBy: req.user._id });
    await project.save();

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/projects/:id/proposals/:index/approve
 * Coordinator — approve one of the submitted proposals
 */
const approveProposal = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const index = parseInt(req.params.index);
    if (index < 0 || index >= project.proposals.length) {
      return res.status(400).json({ message: "Invalid proposal index" });
    }

    const approved = project.proposals[index];
    project.title = approved.title;
    project.description = approved.description;
    project.proposalStatus = "approved";
    project.approvedProposalIndex = index;
    await project.save();

    // Notify all group members
    const notifications = project.groupMembers.map((memberId) => ({
      userId: memberId,
      message: `Your proposal "${approved.title}" has been approved by the coordinator!`,
      type: "success",
    }));
    await Notification.insertMany(notifications);

    const populated = await Project.findById(project._id)
      .populate("groupMembers", "name email")
      .populate("advisorId", "name email")
      .populate("examinerId", "name email");

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/projects/:id/assign-staff
 * Coordinator — assign advisor and examiner to an approved project
 */
const assignStaff = async (req, res, next) => {
  try {
    const { advisorId, examinerId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.proposalStatus !== "approved") {
      return res.status(400).json({ message: "Cannot assign staff before a proposal is approved" });
    }

    if (advisorId) project.advisorId = advisorId;
    if (examinerId) project.examinerId = examinerId;
    project.status = "in-progress";
    await project.save();

    // Notify group members
    const notifications = project.groupMembers.map((memberId) => ({
      userId: memberId,
      message: `Your project "${project.title}" has been assigned an advisor and examiner. The project is now in progress!`,
      type: "info",
    }));
    await Notification.insertMany(notifications);

    const populated = await Project.findById(project._id)
      .populate("groupMembers", "name email")
      .populate("advisorId", "name email")
      .populate("examinerId", "name email");

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateMilestone,
  submitProposal,
  approveProposal,
  assignStaff,
};
