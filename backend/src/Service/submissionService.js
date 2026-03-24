const Submission = require("../models/Submission");

// Create submission
exports.createSubmission = async (data) => {
    return await Submission.create(data);
};

// Get submissions by project
exports.getByProject = async (projectId) => {
    return await Submission.find({ projectId })
        .populate("userId", "name email")
        .sort({ createdAt: -1 });
};

// Add feedback
exports.addFeedback = async (submissionId, feedbackData) => {
    const submission = await Submission.findById(submissionId);

    submission.feedback.push(feedbackData);
    return await submission.save();
};

// Update status
exports.updateStatus = async (submissionId, status) => {
    return await Submission.findByIdAndUpdate(
        submissionId,
        { status },
        { new: true }
    );
};

// Assign marks
exports.assignMarks = async (submissionId, marks) => {
    return await Submission.findByIdAndUpdate(
        submissionId,
        { marks, status: "graded" },
        { new: true }
    );
};
