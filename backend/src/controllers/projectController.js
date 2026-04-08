// ============================================================
// ProjectHub Project & Lifecycle Management
// ============================================================

const Project = require("../models/Project");
const Notification = require("../models/Notification");
const Settings = require("../models/Settings");

/**
 * GET /api/projects
 * Returns projects based on user role
 */
const getProjects = async (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;
    const { status, advisorId, examinerId, proposalStatus, department } = req.query;
    let filter = {};

    // Role-based filtering
    if (role === "student") {
      // Students can browse all approved projects part of titles repo, 
      // but only their own projects for dashboard overview.
      // If proposalStatus is requested, we allow broader access for browsing.
      if (!proposalStatus) {
        filter.groupMembers = userId;
      }
    } else if (role === "staff") {
      filter.$or = [{ advisorId: userId }, { examinerId: userId }];
    }
    // coordinator & admin see all, but coordinator is filtered by department
    if (role === "coordinator" && !department) {
      filter.department = req.user.department;
    }

    if (status) filter.status = status;
    if (proposalStatus) filter.proposalStatus = proposalStatus;
    if (advisorId) filter.advisorId = advisorId;
    if (examinerId) filter.examinerId = examinerId;
    if (department) filter.department = department;

    const projects = await Project.find(filter)
      .populate("groupMembers", "name email studentId")
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
    const { title, description, groupMembers, advisorId, examinerId, deadline, milestones, department } =
      req.body;

    // Force department for coordinator
    let projectDept = department;
    if (req.user.role === "coordinator") {
      projectDept = req.user.department;
    }

    const project = await Project.create({
      title,
      description,
      groupMembers: groupMembers || [],
      advisorId: advisorId || null,
      examinerId: examinerId || null,
      department: projectDept || "",
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
 * POST /api/projects/bulk
 * Admin/Coordinator — bulk create projects (groups)
 */
const bulkCreateProjects = async (req, res, next) => {
  try {
    const { groups } = req.body;
    if (!groups || !Array.isArray(groups)) {
      return res.status(400).json({ message: "Invalid groups data" });
    }

    const createdProjects = [];
    for (const group of groups) {
      const project = await Project.create({
        title: group.title || "Untitled Group",
        groupMembers: group.groupMembers || [],
        department: req.user.role === "coordinator" ? req.user.department : (group.department || ""),
        status: "pending",
        proposalStatus: "approved", // Bulk created projects skip proposal
      });
      createdProjects.push(project);
    }

    res.status(201).json({
      message: `Successfully created ${createdProjects.length} groups`,
      projects: createdProjects,
    });
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

    const { role, _id: userId } = req.user;

    // Student specific restrictions
    if (role === "student") {
      const isMember = project.groupMembers.some(id => id.toString() === userId.toString());
      if (!isMember) {
        return res.status(403).json({
          error: "FORBIDDEN",
          message: "You are not a member of this project group",
        });
      }

      // Students can only update the project title (Group Name)
      const updates = Object.keys(req.body);
      if (updates.length > 1 || (updates.length === 1 && updates[0] !== "title")) {
        return res.status(403).json({
          error: "FORBIDDEN",
          message: "Students are only allowed to update the group name",
        });
      }
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
 * Student — submit a project title proposal (exactly 3 titles + document)
 */
const submitProposal = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Enforce global settings
    const systemSettings = await Settings.findOne();
    if (systemSettings && (systemSettings.allowProposals === false)) {
      return res.status(403).json({ message: "Proposal submissions are currently disabled." });
    }

    if (project.proposalStatus === "approved") {
      return res.status(400).json({ message: "A proposal has already been approved for this group" });
    }

    // titles and descriptions should be sent as arrays or JSON strings depending on form-data
    let { titles, descriptions } = req.body;
    
    const normalize = (val) => {
      if (typeof val === "string") {
        try {
          if (val.trim().startsWith("[") || val.trim().startsWith("\"")) {
            return JSON.parse(val);
          }
          return [val];
        } catch (e) {
          return [val];
        }
      }
      return val;
    };

    titles = normalize(titles);
    descriptions = normalize(descriptions);

    if (!titles || !Array.isArray(titles) || titles.length !== 3) {
      return res.status(400).json({ message: "You must provide exactly 3 project title options." });
    }
    if (!descriptions || !Array.isArray(descriptions) || descriptions.length !== 3) {
      return res.status(400).json({ message: "You must provide exactly 3 project description options." });
    }

    const documentUrl = req.file ? `/uploads/proposals/${req.file.filename}` : null;
    
    // Versioning logic: if there is a previous proposal, increment version
    let nextVersion = 1;
    if (project.proposals.length > 0) {
      nextVersion = project.proposals[project.proposals.length - 1].version + 1;
    }

    const newProposal = {
      titles,
      descriptions,
      documentUrl,
      submittedBy: req.user._id,
      status: "pending",
      version: nextVersion
    };

    project.proposals.push(newProposal);
    project.proposalStatus = "pending";
    await project.save();

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/projects/:id/proposals/review
 * Coordinator — Approve or Reject a proposal
 */
const reviewProposal = async (req, res, next) => {
  try {
    const { status, feedback, selectedTitleIndex, advisorId, examinerId } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.proposals.length === 0) return res.status(400).json({ message: "No proposal to review" });

    const currentProposal = project.proposals[project.proposals.length - 1];

    if (status === "approved") {
      if (selectedTitleIndex === undefined || selectedTitleIndex < 0 || selectedTitleIndex > 2) {
        return res.status(400).json({ message: "Please select one of the 3 titles to approve." });
      }

      currentProposal.status = "approved";
      project.proposalStatus = "approved";
      project.finalTitle = currentProposal.titles[selectedTitleIndex];
      project.description = currentProposal.descriptions[selectedTitleIndex];
      project.approvedProposalIndex = selectedTitleIndex;
      
      // Auto-assign staff if provided
      if (advisorId) project.advisorId = advisorId;
      if (examinerId) project.examinerId = examinerId;
      if (advisorId || examinerId) project.status = "in-progress";

      // Notify group
      const notifications = project.groupMembers.map((memberId) => ({
        userId: memberId,
        message: `Your proposal has been APPROVED! Final Title: "${project.finalTitle}"`,
        type: "success",
      }));
      await Notification.insertMany(notifications);
      
    } else if (status === "rejected") {
      if (!feedback) return res.status(400).json({ message: "Feedback is required for rejection." });
      
      currentProposal.status = "rejected";
      currentProposal.feedback = feedback;
      project.proposalStatus = "rejected";

      // Notify group
      const notifications = project.groupMembers.map((memberId) => ({
        userId: memberId,
        message: `Your proposal was rejected. Feedback: "${feedback}"`,
        type: "warning",
      }));
      await Notification.insertMany(notifications);
    }

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

/**
 * PUT /api/projects/:id/release-results
 * Coordinator — officially release grades to students
 */
const releaseResults = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.resultsReleased = true;
    project.status = "completed"; // Mark as completed when results are released
    await project.save();

    // Notify group members
    const notifications = project.groupMembers.map((memberId) => ({
      userId: memberId,
      message: `Final results for "${project.title}" have been released! You can now view your graduation grade.`,
      type: "success",
    }));
    await Notification.insertMany(notifications);

    res.json({ message: "Results released successfully", project });
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
  reviewProposal,
  assignStaff,
  bulkCreateProjects,
  releaseResults,
};
