// ============================================================
// Criteria Service: Manage Evaluation Criteria & Grade Config
// ============================================================

import api from './client';

export interface CriterionItem {
  id: string; // Used for frontend keying, not necessarily DB ID
  _id?: string; // MongoDB ID if exists
  label: string;
  maxMark: number;
}

export interface EvaluationPhase {
  id: string; // 'phase-advisor', etc.
  _id?: string;
  name: string;
  active: boolean;
  weight: number;
  criteria: CriterionItem[];
}

export interface GradeBand {
  id?: string;
  _id?: string;
  label: string;
  minScore: number;
  maxScore: number;
  color: string;
}

export interface GradeConfig {
  id: string;
  bands: GradeBand[];
  phases: EvaluationPhase[];
}

const criteriaService = {
  /**
   * Get global grade and criteria configuration
   */
  get: async () => {
    const response = await api.get<GradeConfig>('/grade-config');
    return response;
  },

  /**
   * Update global grade and criteria configuration
   */
  update: async (data: Partial<GradeConfig>) => {
    const response = await api.put<GradeConfig>('/grade-config', data);
    return response;
  }
};

export default criteriaService;
