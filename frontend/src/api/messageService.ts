// ============================================================
// Message API service
// Aligned with backend: /api/messages
// ============================================================

import apiClient from "./client";

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  projectId?: string;
  content: string;
  isRead: boolean;
  sentAt: string;
}

const messageService = {
  // GET /api/messages/:targetUserId
  getConversation: (targetUserId: string) =>
    apiClient.get<Message[]>(`/messages/${targetUserId}`),

  // POST /api/messages
  sendMessage: (data: { receiverId: string; content: string; projectId?: string }) =>
    apiClient.post<Message>("/messages", data),

  // PUT /api/messages/read/:targetUserId
  markRead: (targetUserId: string) =>
    apiClient.put(`/messages/read/${targetUserId}`),

  // GET /api/messages/unread/count
  getUnreadCount: () =>
    apiClient.get<{ count: number }>("/messages/unread/count"),
};

export default messageService;
