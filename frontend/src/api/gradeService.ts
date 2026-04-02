// ============================================================
// Grade Configuration API service
// Aligned with backend GradeConfig model
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
  id?: string;
  _id?: string;
  label: string;
  maxMark: number;
}

export interface EvaluationPhase {
  id: string;
  name: string;
  weight: number;
  active: boolean;
  criteria: Criterion[];
}

export interface GradeConfig {
  id: string;
  bands: GradeBand[];
  phases: EvaluationPhase[];
}

export const gradeService = {
  // GET /api/grade-config
  getConfig: () => apiClient.get<GradeConfig>("/grade-config"),

  // PUT /api/grade-config
  updateConfig: (data: Partial<GradeConfig>) => 
    apiClient.put<GradeConfig>("/grade-config", data),
};

export default gradeService;
