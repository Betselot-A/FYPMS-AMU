// ============================================================
// File API service
// Aligned with backend: /api/files
// ============================================================

import apiClient from "./client";

export interface ProjectFile {
  id: string;
  originalName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  fileCategory?: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  projectId: string;
  uploadedAt: string;
}

const fileService = {
  // GET /api/files/:projectId
  getProjectFiles: (projectId: string) =>
    apiClient.get<ProjectFile[]>(`/files/${projectId}`),

  // POST /api/files
  uploadFile: (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("file", file);
    return apiClient.post<ProjectFile>("/files", formData);
  },

  // DELETE /api/files/:id
  deleteFile: (id: string) =>
    apiClient.delete(`/files/${id}`),
};

export default fileService;
