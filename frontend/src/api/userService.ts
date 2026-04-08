// ============================================================
// User management API service (Admin operations)
// ============================================================

import apiClient from "./client";
import { User, UserRole, StaffAssignment } from "@/types";

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  staffAssignment?: StaffAssignment;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  department?: string;
  role?: UserRole;
  staffAssignment?: StaffAssignment;
  cgpa?: number;
}

export interface UsersQueryParams {
  role?: UserRole;
  department?: string;
  page?: number;
  limit?: number;
  search?: string;
  groupStatus?: "grouped" | "ungrouped" | "all";
}

const userService = {
  getAll: (params?: UsersQueryParams) =>
    apiClient.get<{ users: User[]; total: number }>("/users", { params }),

  getById: (id: string) =>
    apiClient.get<User>(`/users/${id}`),

  create: (data: CreateUserRequest) =>
    apiClient.post<{ user: User; tempPassword: string }>("/users", data),

  update: (id: string, data: UpdateUserRequest) =>
    apiClient.put<User>(`/users/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/users/${id}`),

  // Bulk operations
  bulkCreate: (users: CreateUserRequest[]) =>
    apiClient.post<{ created: number; errors: string[] }>("/users/bulk", { users }),

  bulkUpload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<{
      message: string;
      createdCount: number;
      createdUsers: { name: string; email: string; role: string; tempPassword: string }[];
      errors: string[];
    }>("/users/bulk-upload", formData);
  },

  bulkDelete: (userIds: string[]) =>
    apiClient.delete<{ message: string; deletedCount: number }>("/users/bulk", { data: { userIds } }),

  resetPassword: (id: string) =>
    apiClient.post<{ message: string }>(`/users/${id}/reset-password`),

  getDepartments: () => 
    apiClient.get<string[]>("/users/departments"),
};

export default userService;
