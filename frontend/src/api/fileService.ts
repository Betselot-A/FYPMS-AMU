// ============================================================
// File API service
// Aligned with backend: /api/files
// ============================================================

import apiClient from "./client";

export interface ProjectFile {
  id: string;
  originalName: string;
  fileId: string;
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

  // Helper to get download URL
  getDownloadUrl: (fileId: string) => {
    const token = sessionStorage.getItem("auth_token");
    return `${apiClient.defaults.baseURL}/files/download/${fileId}${token ? `?token=${token}` : ""}`;
  },

  // Professional background download
  downloadFile: async (fileId: string) => {
    const response = await apiClient.get(`/files/download/${fileId}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default fileService;
