// ============================================================
// System Settings API service (Admin)
// ============================================================

import apiClient from "./client";

export interface SystemSettings {
  id: string;
  systemName: string;
  defaultPassword: string;
  academicSemester: string;
  academicYear: number;
  allowProposals: boolean;
  registrationDeadline?: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  emailFrom: string;
}

const settingsService = {
  get: () =>
    apiClient.get<SystemSettings>("/settings"),

  update: (data: Partial<SystemSettings>) =>
    apiClient.put<SystemSettings>("/settings", data),
};

export default settingsService;
