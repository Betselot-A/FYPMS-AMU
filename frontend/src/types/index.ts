// ============================================================
// Type definitions for the Project Collaboration System
// ============================================================

export type UserRole = "student" | "staff" | "coordinator" | "admin";

// Staff assignment flags — set by admin
export interface StaffAssignment {
  isAdvisor: boolean;
  isExaminer: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  createdAt: string;
  staffAssignment?: StaffAssignment; // only relevant for staff role
  cgpa?: number; // only relevant for students
  mustChangePassword?: boolean;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  department: string;
  groupMembers: string[]; // user IDs
  advisorId: string;
  examinerId?: string;
  status: "pending" | "in-progress" | "under-review" | "completed";
  deadline: string;
  createdAt: string;
  milestones: Milestone[];
  proposals: Proposal[];
  proposalStatus: "pending" | "approved";
  approvedProposalIndex?: number;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: "pending" | "approved" | "rejected";
  description: string;
}

export interface Submission {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  files: string[];
  submissionDate: string;
  feedback?: Feedback[];
  status: "submitted" | "reviewed" | "graded";
}

export interface Feedback {
  id: string;
  fromUserId: string;
  fromUserName: string;
  message: string;
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  senderId?: {
    id: string;
    name: string;
    role: string;
  } | string;
  subject?: string;
  message: string;
  type: "info" | "warning" | "success" | "deadline";
  read: boolean;
  date: string;
  createdAt?: string;
}

export interface Message {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  content: string;
  date: string;
}
