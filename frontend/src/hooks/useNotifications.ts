// ============================================================
// Custom hook for managing unread notifications
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { notificationService } from "@/api";
import { useAuth } from "@/contexts/AuthContext";

export const useNotifications = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const response = await notificationService.getAll();
      
      // Only count notifications intended for the current user that are unread
      const count = response.data.filter((n) => {
        const recipientId = typeof n.userId === "object" ? n.userId.id : n.userId;
        return recipientId === user.id && !n.read;
      }).length;

      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
    }
  }, [user]);

  useEffect(() => {
    const handleUpdate = () => fetchUnreadCount();
    window.addEventListener("notifications-updated", handleUpdate);
    
    if (user) {
      fetchUnreadCount();
      
      // Polling for new notifications every 60 seconds
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => {
        clearInterval(interval);
        window.removeEventListener("notifications-updated", handleUpdate);
      };
    }
    return () => window.removeEventListener("notifications-updated", handleUpdate);
  }, [user, fetchUnreadCount, location.pathname]);

  return { unreadCount, refresh: fetchUnreadCount, isLoading };
};
