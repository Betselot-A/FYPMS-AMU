// ============================================================
// Grade Configuration API service
// ============================================================

import apiClient from "./client";

export interface GradeBand {
  id: string;
  label: string;
  minScore: number;
  maxScore: number;
  color: string;
}

export interface Criterion {
  id: string;
  name: string;
  weight: number;
  phase: "advisor" | "examiner" | "coordinator" | "general";
}

export interface GradeConfig {
  id: string;
  bands: GradeBand[];
  criteria: Criterion[];
}

const gradeService = {
  // GET /api/grade-config
  getConfig: () => apiClient.get<GradeConfig>("/grade-config"),

  // PUT /api/grade-config
  updateConfig: (data: Partial<GradeConfig>) => 
    apiClient.put<GradeConfig>("/grade-config", data),
};

export default gradeService;
