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
  titles: string[];
  descriptions: string[];
  description?: string; // legacy support if any
  documentUrl?: string; // path to PDF/DOCX
  status: "pending" | "approved" | "rejected";
  feedback?: string; // feedback for rejection
  version: number;
  submittedBy: string;
  submittedAt: string;
}

export interface Project {
  id: string;
  title: string;
  finalTitle?: string; // The specific title approved by coordinator
  description: string;
  department: string;
  groupMembers: string[] | User[]; // can be IDs or populated objects
  advisorId?: string | User;
  examinerId?: string | User;
  status: "pending" | "in-progress" | "under-review" | "completed";
  deadline: string;
  createdAt: string;
  milestones: Milestone[];
  proposals: Proposal[];
  proposalStatus: "not-submitted" | "pending" | "approved" | "rejected";
  approvedProposalIndex?: number;
  resultsReleased?: boolean;
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
  userId: {
    id: string;
    name?: string;
    role?: string;
  } | string;
  senderId?: {
    id: string;
    name: string;
    role: string;
  } | string;
  subject?: string;
  message: string;
  type: "info" | "warning" | "success" | "deadline";
  attachmentUrl?: string | null;
  attachmentName?: string | null;
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
