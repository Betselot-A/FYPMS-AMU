// ============================================================
// ProjectHub Authentication API Service
// ============================================================

import apiClient from "./client";
import { User } from "@/types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

const authService = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>("/auth/login", data),

  logout: () =>
    apiClient.post("/auth/logout"),

  getProfile: () =>
    apiClient.get<User>("/auth/me"),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.put("/auth/change-password", data),

  // Admin resets a user's password (generates temp password)
  resetUserPassword: (userId: string) =>
    apiClient.post<{ tempPassword: string }>(`/auth/reset-password/${userId}`),
};

export default authService;
