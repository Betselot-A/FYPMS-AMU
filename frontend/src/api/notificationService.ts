// ============================================================
// Notification API service
// Aligned with backend: /api/notifications
// ============================================================

import apiClient from "./client";
import { Notification } from "@/types";

export interface CreateNotificationRequest {
  userId?: string;        // specific user — omit for broadcast
  userIds?: string[];     // multiple specific users
  subject?: string;
  message: string;
  type?: "info" | "warning" | "success" | "deadline";
}

export interface SentNotification {
  id: string;
  userId: { id: string; name: string; email: string; role: string; department: string };
  senderId: string;
  subject: string;
  message: string;
  type: string;
  read: boolean;
  date: string;
  createdAt: string;
}

const notificationService = {
  // GET /api/notifications — current user's inbox
  getAll: () =>
    apiClient.get<Notification[]>("/notifications"),

  // GET /api/notifications/sent — messages sent by current admin/coordinator
  getSent: () =>
    apiClient.get<SentNotification[]>("/notifications/sent"),

  // PUT /api/notifications/:id/read
  markAsRead: (id: string) =>
    apiClient.put(`/notifications/${id}/read`),

  // PUT /api/notifications/read-all
  markAllAsRead: () =>
    apiClient.put("/notifications/read-all"),

  // POST /api/notifications (admin/coordinator)
  create: (data: CreateNotificationRequest) =>
    apiClient.post<{ sent: number }>("/notifications", data),
};

export default notificationService;
