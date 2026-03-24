// ============================================================
// System Settings API service (Admin)
// ============================================================

import apiClient from "./client";

export interface SystemSettings {
  systemName: string;
  academicYear: string;
  semester: string;
  evaluationWeights: {
    advisor: number;
    coordinator: number;
    examiner: number;
    documentation: number;
  };
  notifications: {
    emailOnSubmission: boolean;
    emailOnGrade: boolean;
    emailOnAnnouncement: boolean;
    emailOnDeadline: boolean;
  };
}

const settingsService = {
  get: () =>
    apiClient.get<SystemSettings>("/settings"),

  update: (data: Partial<SystemSettings>) =>
    apiClient.put<SystemSettings>("/settings", data),
};

export default settingsService;
