// ============================================================
// Shared Notifications Page — Real API Connected
// Shows in-app messages sent by admin/coordinators to any user role
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { notificationService } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, Info, AlertTriangle, CheckCircle, Loader2, MailOpen, User, Reply, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types";

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  info:     { icon: <Info className="w-4 h-4" />,          color: "text-info",        bg: "bg-info/10" },
  deadline: { icon: <Calendar className="w-4 h-4" />,      color: "text-warning",     bg: "bg-warning/10" },
  warning:  { icon: <AlertTriangle className="w-4 h-4" />, color: "text-destructive", bg: "bg-destructive/10" },
  success:  { icon: <CheckCircle className="w-4 h-4" />,   color: "text-success",     bg: "bg-success/10" },
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await notificationService.getAll();
      setNotifications(res.data);
    } catch {
      toast.error("Could not load notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    const hasUnread = notifications.some((n) => !n.read);
    if (!hasUnread) return;
    setIsMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!user) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground text-xs ml-1">{unreadCount}</Badge>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Stay updated with messages and alerts from the system.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
            className="gap-1.5"
          >
            {isMarkingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <MailOpen className="w-3.5 h-3.5" />
            )}
            Mark all read
          </Button>
        )}
      </div>

      <Card className="shadow-card">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            {notifications.length === 0 ? "Inbox" : `${notifications.length} message${notifications.length !== 1 ? "s" : ""}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm animate-pulse">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Bell className="w-12 h-12 opacity-20" />
              <div className="text-center">
                <p className="text-sm font-medium">You're all caught up!</p>
                <p className="text-xs mt-1 opacity-70">No notifications yet. Check back later.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((n) => {
                const cfg = typeConfig[n.type] || typeConfig.info;
                const date = new Date(n.date || n.createdAt || "").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const sId = typeof n.senderId === 'object' ? n.senderId.id : n.senderId;
                const isOwnMessage = sId === user.id;
                
                const senderName = typeof n.senderId === 'object' ? n.senderId.name : "System";
                const recipientName = typeof n.userId === 'object' ? n.userId.name : "User";
                const canReply = !isOwnMessage && typeof n.senderId === 'object' && n.senderId.id;

                return (
                  <div key={n.id} className={cn("group transition-all", !n.read ? "bg-primary/3" : "", isOwnMessage && "bg-muted/5")}>
                    <div
                      className="flex items-start gap-4 px-5 py-4 hover:bg-muted/10 cursor-pointer"
                      onClick={() => !n.read && handleMarkAsRead(n.id)}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-1",
                        isOwnMessage ? "bg-muted text-muted-foreground ring-1 ring-border" : cfg.bg
                      )}>
                        {isOwnMessage ? (
                          <Send className="w-3.5 h-3.5 rotate-[-45deg]" />
                        ) : (
                          <span className={cfg.color}>{cfg.icon}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {n.subject && (
                            <p className="text-sm font-bold text-foreground truncate">{n.subject}</p>
                          )}
                          {isOwnMessage && (
                            <Badge variant="outline" className="text-[9px] h-4 py-0 uppercase tracking-tighter opacity-70">
                              Outbound
                            </Badge>
                          )}
                        </div>
                        
                        <p className={cn(
                          "text-sm leading-relaxed",
                          !n.subject ? "font-medium text-foreground" : "text-muted-foreground"
                        )}>
                          {n.message}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] capitalize gap-1 border-current/20",
                              isOwnMessage ? "bg-muted text-muted-foreground" : `${cfg.color} ${cfg.bg}`
                            )}
                          >
                            {isOwnMessage ? <Send className="w-2.5 h-2.5" /> : cfg.icon}
                            {isOwnMessage ? "Sent" : n.type}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <User className="w-2.5 h-2.5" />
                            {isOwnMessage ? (
                              <span className="font-medium text-primary/80">To: {recipientName}</span>
                            ) : (
                              <span className="font-medium">From: {senderName}</span>
                            )}
                          </span>
                          <span className="text-[11px] text-muted-foreground opacity-60">• {date}</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canReply && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 gap-1.5 px-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              const targetId = sId;
                              const role = user?.role;
                              if (role === "admin") navigate(`/dashboard/admin/messages?user=${targetId}`);
                              else if (role === "coordinator") navigate(`/dashboard/coordinator/messages?user=${targetId}`);
                              else if (role === "student") navigate(`/dashboard/messages?user=${targetId}`);
                              else if (role === "staff") navigate(`/dashboard/staff/messages?user=${targetId}`);
                            }}
                          >
                            <Reply className="w-3.5 h-3.5" />
                            Reply in Messenger
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(n.id);
                          }}
                        >
                          <CheckCircle className="w-4 h-4 text-muted-foreground/40 group-hover:text-success/60" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
