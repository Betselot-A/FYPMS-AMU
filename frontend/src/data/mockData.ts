// ============================================================
// ProjectHub Local Development & Demo Data
// Standardized datasets for testing the ProjectHub UI and flows.
// ============================================================

import { User, Project, Submission, Notification, Message } from "@/types";

// ---- Users ----
export const mockUsers: User[] = [
  { id: "s1", name: "Alice Johnson", email: "alice@university.edu", role: "student", department: "Computer Science", createdAt: "2025-09-01", cgpa: 3.85 },
  { id: "s2", name: "Bob Smith", email: "bob@university.edu", role: "student", department: "Computer Science", createdAt: "2025-09-01", cgpa: 3.42 },
  { id: "s3", name: "Carol Davis", email: "carol@university.edu", role: "student", department: "Information Technology", createdAt: "2025-09-01", cgpa: 3.70 },
  { id: "s4", name: "David Lee", email: "david@university.edu", role: "student", department: "Software Engineering", createdAt: "2025-09-01", cgpa: 3.55 },
  { id: "s5", name: "Eva Martinez", email: "eva@university.edu", role: "student", department: "Computer Science", createdAt: "2025-09-01", cgpa: 3.60 },
  { id: "s6", name: "Frank Wilson", email: "frank@university.edu", role: "student", department: "Computer Science", createdAt: "2025-09-01", cgpa: 3.20 },
  { id: "s7", name: "Grace Kim", email: "grace@university.edu", role: "student", department: "Information Technology", createdAt: "2025-09-01", cgpa: 3.90 },
  { id: "s8", name: "Henry Brown", email: "henry@university.edu", role: "student", department: "Information Technology", createdAt: "2025-09-01", cgpa: 3.30 },
  // Staff who is BOTH advisor and examiner
  { id: "st1", name: "Dr. Sarah Wilson", email: "sarah.w@university.edu", role: "staff", department: "Computer Science", createdAt: "2024-01-01", staffAssignment: { isAdvisor: true, isExaminer: true } },
  // Staff who is only advisor
  { id: "st2", name: "Dr. James Brown", email: "james.b@university.edu", role: "staff", department: "Information Technology", createdAt: "2024-01-01", staffAssignment: { isAdvisor: true, isExaminer: false } },
  // Staff who is only examiner (not yet assigned as advisor)
  { id: "st3", name: "Dr. Emily Taylor", email: "emily.t@university.edu", role: "staff", department: "Computer Science", createdAt: "2024-01-01", staffAssignment: { isAdvisor: false, isExaminer: true } },
  // Coordinator
  { id: "c1", name: "Prof. Michael Chen", email: "michael.c@university.edu", role: "coordinator", department: "Computer Science", createdAt: "2023-01-01" },
  // Admin
  { id: "ad1", name: "Admin User", email: "admin@university.edu", role: "admin", department: "Administration", createdAt: "2023-01-01" },
];

// ---- Projects ----
export const mockProjects: Project[] = [
  {
    id: "p1",
    title: "AI-Powered Student Attendance System",
    description: "A facial recognition-based attendance system using deep learning to automate student attendance tracking.",
    groupMembers: ["s1", "s2"],
    advisorId: "st1",
    examinerId: "st3",
    status: "in-progress",
    deadline: "2026-06-15",
    createdAt: "2025-10-01",
    proposals: [],
    proposalStatus: "approved",
    approvedProposalIndex: 0,
    milestones: [
      { id: "m1", title: "Project Proposal", dueDate: "2025-11-01", status: "approved", description: "Submit initial project proposal document" },
      { id: "m2", title: "Literature Review", dueDate: "2025-12-15", status: "approved", description: "Complete literature review chapter" },
      { id: "m3", title: "System Design", dueDate: "2026-02-01", status: "pending", description: "UML diagrams and architecture design" },
      { id: "m4", title: "Implementation", dueDate: "2026-04-15", status: "pending", description: "Core system implementation" },
      { id: "m5", title: "Final Submission", dueDate: "2026-06-15", status: "pending", description: "Complete project with documentation" },
    ],
  },
  {
    id: "p2",
    title: "Online Learning Platform",
    description: "A comprehensive e-learning platform with video lectures, quizzes, and progress tracking.",
    groupMembers: ["s3", "s4"],
    advisorId: "st2",
    examinerId: "st1",
    status: "in-progress",
    deadline: "2026-06-15",
    createdAt: "2025-10-01",
    proposals: [],
    proposalStatus: "approved",
    approvedProposalIndex: 0,
    milestones: [
      { id: "m6", title: "Project Proposal", dueDate: "2025-11-01", status: "approved", description: "Submit initial proposal" },
      { id: "m7", title: "Requirements Analysis", dueDate: "2025-12-01", status: "approved", description: "Detailed requirements document" },
      { id: "m8", title: "Prototype", dueDate: "2026-02-15", status: "pending", description: "Working prototype demo" },
    ],
  },
];

// ---- Submissions ----
export const mockSubmissions: Submission[] = [
  {
    id: "sub1",
    projectId: "p1",
    userId: "s1",
    title: "Project Proposal Document",
    files: ["proposal_v1.pdf"],
    submissionDate: "2025-10-28",
    status: "reviewed",
    feedback: [
      { id: "f1", fromUserId: "st1", fromUserName: "Dr. Sarah Wilson", message: "Good start! Please expand the methodology section.", date: "2025-10-30" },
    ],
  },
  {
    id: "sub2",
    projectId: "p1",
    userId: "s1",
    title: "Literature Review Draft",
    files: ["lit_review_v1.pdf", "references.bib"],
    submissionDate: "2025-12-10",
    status: "submitted",
  },
  {
    id: "sub3",
    projectId: "p2",
    userId: "s3",
    title: "Requirements Specification",
    files: ["requirements_spec.pdf"],
    submissionDate: "2025-11-25",
    status: "reviewed",
    feedback: [
      { id: "f2", fromUserId: "st2", fromUserName: "Dr. James Brown", message: "Well structured. Add non-functional requirements.", date: "2025-11-28" },
    ],
  },
];

// ---- Notifications ----
export const mockNotifications: Notification[] = [
  { id: "n1", userId: "s1", message: "Your proposal has been reviewed by Dr. Sarah Wilson", type: "info", read: false, date: "2025-10-30" },
  { id: "n2", userId: "s1", message: "Milestone 'System Design' deadline is approaching", type: "deadline", read: false, date: "2026-01-25" },
  { id: "n3", userId: "st1", message: "New submission from Alice Johnson", type: "info", read: false, date: "2025-12-10" },
  { id: "n4", userId: "s3", message: "Feedback received on Requirements Specification", type: "success", read: true, date: "2025-11-28" },
];

// ---- Messages ----
export const mockMessages: Message[] = [
  { id: "msg1", fromUserId: "s1", fromUserName: "Alice Johnson", toUserId: "st1", content: "Dr. Wilson, I have a question about the methodology section.", date: "2025-10-29" },
  { id: "msg2", fromUserId: "st1", fromUserName: "Dr. Sarah Wilson", toUserId: "s1", content: "Sure, what would you like to clarify?", date: "2025-10-29" },
  { id: "msg3", fromUserId: "s1", fromUserName: "Alice Johnson", toUserId: "st1", content: "Should I include a comparison of CNN architectures?", date: "2025-10-29" },
];

// ---- Demo credentials ----
export const demoCredentials = [
  { email: "alice@university.edu", password: "password", role: "student" as const },
  { email: "sarah.w@university.edu", password: "password", role: "staff" as const },
  { email: "michael.c@university.edu", password: "password", role: "coordinator" as const },
  { email: "admin@university.edu", password: "password", role: "admin" as const },
];
