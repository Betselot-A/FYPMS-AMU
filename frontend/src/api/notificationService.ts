// ============================================================
// Notification API service
// Aligned with backend: /api/notifications
// ============================================================

import apiClient from "./client";
import { Notification } from "@/types";

export interface CreateNotificationRequest {
  userId?: string;        // specific user, or omit for broadcast
  message: string;
  type?: "info" | "warning" | "success" | "deadline";
}

const notificationService = {
  // GET /api/notifications
  getAll: () =>
    apiClient.get<Notification[]>("/notifications"),

  // PUT /api/notifications/:id/read
  markAsRead: (id: string) =>
    apiClient.put(`/notifications/${id}/read`),

  // PUT /api/notifications/read-all
  markAllAsRead: () =>
    apiClient.put("/notifications/read-all"),

  // POST /api/notifications (admin/coordinator)
  create: (data: CreateNotificationRequest) =>
    apiClient.post<Notification>("/notifications", data),
};

export default notificationService;
