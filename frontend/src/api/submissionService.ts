// ============================================================
// Submission API service
// Aligned with backend: /api/submissions
// ============================================================

import apiClient from "./client";
import { Submission, Feedback } from "@/types";

const submissionService = {
  // GET /api/submissions/:projectId
  getByProject: (projectId: string) =>
    apiClient.get<Submission[]>(`/submissions/${projectId}`),

  // POST /api/submissions (student, multipart/form-data)
  // FormData must include: projectId, title, files
  create: (data: FormData) =>
    apiClient.post<Submission>("/submissions", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // POST /api/submissions/:submissionId/feedback (staff/coordinator)
  addFeedback: (submissionId: string, message: string) =>
    apiClient.post<Feedback>(`/submissions/${submissionId}/feedback`, { message }),
};

export default submissionService;
