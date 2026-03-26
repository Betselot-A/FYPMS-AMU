// ============================================================
// Project API service
// Aligned with backend: /api/projects
// ============================================================

import apiClient from "./client";
import { Project, Milestone } from "@/types";

export interface CreateGroupRequest {
  groupMembers: string[];
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  groupMembers: string[];
  advisorId?: string;
  examinerId?: string;
  deadline?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  advisorId?: string;
  examinerId?: string;
  status?: Project["status"];
  deadline?: string;
}

const projectService = {
  // GET /api/projects
  getAll: (params?: { status?: string; advisorId?: string; examinerId?: string }) =>
    apiClient.get<Project[]>("/projects", { params }),

  // GET /api/projects/:id
  getById: (id: string) =>
    apiClient.get<Project>(`/projects/${id}`),

  // POST /api/projects — create a group with just members (coordinator)
  createGroup: (data: CreateGroupRequest) =>
    apiClient.post<Project>("/projects", { ...data, title: "Awaiting Proposal" }),

  // POST /api/projects/bulk — mass create groups (admin)
  bulkCreate: (groups: { title: string; groupMembers: string[] }[]) =>
    apiClient.post<{ message: string; projects: Project[] }>("/projects/bulk", { groups }),

  // PUT /api/projects/:id (coordinator/admin)
  update: (id: string, data: UpdateProjectRequest) =>
    apiClient.put<Project>(`/projects/${id}`, data),

  // DELETE /api/projects/:id (coordinator/admin)
  delete: (id: string) =>
    apiClient.delete(`/projects/${id}`),

  // POST /api/projects/:id/proposals — student submits a proposal
  submitProposal: (projectId: string, title: string, description: string) =>
    apiClient.post<Project>(`/projects/${projectId}/proposals`, { title, description }),

  // PUT /api/projects/:id/proposals/:index/approve — coordinator approves
  approveProposal: (projectId: string, index: number) =>
    apiClient.put<Project>(`/projects/${projectId}/proposals/${index}/approve`, {}),

  // PUT /api/projects/:id/assign-staff — coordinator assigns advisor/examiner
  assignStaff: (projectId: string, advisorId: string, examinerId?: string) =>
    apiClient.put<Project>(`/projects/${projectId}/assign-staff`, { advisorId, examinerId }),

  // PUT /api/projects/:projectId/milestones/:milestoneId
  updateMilestone: (projectId: string, milestoneId: string, data: Partial<Milestone>) =>
    apiClient.put<Milestone>(`/projects/${projectId}/milestones/${milestoneId}`, data),
};

export default projectService;
