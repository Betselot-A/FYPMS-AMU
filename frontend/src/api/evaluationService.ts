// ============================================================
// Evaluation & Grading API service
// Aligned with backend: /api/evaluations
// ============================================================

import apiClient from "./client";

export interface EvaluationMark {
  criterionId: string;
  mark: number;
}

export interface SubmitEvaluationRequest {
  projectId: string;
  phaseId: string;
  marks: EvaluationMark[];
  comments?: string;
}

export interface EvaluationResult {
  id: string;
  projectId: string;
  evaluatorId: string;
  phaseId: string;
  marks: EvaluationMark[];
  comments?: string;
  totalMark: number;
  submittedAt: string;
}

const evaluationService = {
  // POST /api/evaluations (staff/coordinator)
  submitEvaluation: (data: SubmitEvaluationRequest) =>
    apiClient.post<EvaluationResult>("/evaluations", data),

  // GET /api/evaluations/:projectId
  getEvaluationsByProject: (projectId: string) =>
    apiClient.get<EvaluationResult[]>(`/evaluations/${projectId}`),

  // GET /api/evaluations/results/:projectId
  getProjectResults: (projectId: string) =>
    apiClient.get<{ phases: EvaluationResult[]; finalGrade: string; totalPercentage: number }>(
      `/evaluations/results/${projectId}`
    ),
};

export default evaluationService;
