// ============================================================
// Staff API service
// Aligned with backend: /api/staff
// ============================================================

import apiClient from "./client";
import { Project } from "@/types";

const staffService = {
  // GET /api/staff/advising-projects
  getAdvisingProjects: () =>
    apiClient.get<Project[]>("/staff/advising-projects"),

  // GET /api/staff/examining-projects
  getExaminingProjects: () =>
    apiClient.get<Project[]>("/staff/examining-projects"),
};

export default staffService;
