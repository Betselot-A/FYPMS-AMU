// ============================================================
// Admin: Send Message / Notification to Users
// Full in-app messaging panel — compose to specific user or broadcast
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { notificationService, userService } from "@/api";
import type { SentNotification } from "@/api/notificationService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MultiUserSelect } from "@/components/MultiUserSelect";
import { Separator } from "@/components/ui/separator";
import {
  Send, Mail, Users, History, Info, AlertTriangle, CheckCircle,
  Calendar, Loader2, Search, Megaphone, Clock, User,
} from "lucide-react";
import { toast } from "sonner";
import type { User as UserType } from "@/types";

type NotifType = "info" | "warning" | "success" | "deadline";

const typeConfig: Record<NotifType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  info: { label: "Info", icon: <Info className="w-3.5 h-3.5" />, color: "text-info", bg: "bg-info/10" },
  warning: { label: "Warning", icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "text-warning", bg: "bg-warning/10" },
  success: { label: "Success", icon: <CheckCircle className="w-3.5 h-3.5" />, color: "text-success", bg: "bg-success/10" },
  deadline: { label: "Deadline", icon: <Calendar className="w-3.5 h-3.5" />, color: "text-destructive", bg: "bg-destructive/10" },
};

const AdminMessagesPage = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [sentHistory, setSentHistory] = useState<SentNotification[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [form, setForm] = useState({
    target: "specific" as "specific" | "broadcast",
    userIds: [] as string[],
    subject: "",
    message: "",
    type: "info" as NotifType,
  });

  // Fetch all users for the recipient dropdown
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      const res = await userService.getAll({ limit: 200 });
      setUsers(res.data.users.filter((u) => u.role !== "admin"));
    } catch {
      toast.error("Could not load users list");
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  // Fetch sent messages history
  const fetchHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const res = await notificationService.getSent();
      setSentHistory(res.data);
    } catch {
      // Silently fail — history is non-critical
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchHistory();
  }, [fetchUsers, fetchHistory]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUsers = users.filter((u) => form.userIds.includes(u.id));

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) {
      toast.error("Please write a message before sending.");
      return;
    }
    if (form.target === "specific" && form.userIds.length === 0) {
      toast.error("Please select at least one recipient.");
      return;
    }

    setIsSending(true);
    try {
      const payload =
        form.target === "broadcast"
          ? { subject: form.subject, message: form.message, type: form.type }
          : { userIds: form.userIds, subject: form.subject, message: form.message, type: form.type };

      const res = await notificationService.create(payload);
      const count = res.data.sent;

      toast.success(
        form.target === "broadcast"
          ? `Broadcast sent to ${count} user${count !== 1 ? "s" : ""}`
          : `Message delivered to ${form.userIds.length} recipient${form.userIds.length !== 1 ? "s" : ""}`,
        { description: form.subject || form.message.slice(0, 60) }
      );

      // Reset form
      setForm((prev) => ({ ...prev, userIds: [], subject: "", message: "" }));

      // Refresh history
      fetchHistory();
    } catch (err: any) {
      toast.error("Failed to send message", {
        description: err?.response?.data?.message || "An error occurred",
      });
    } finally {
      setIsSending(false);
    }
  };

  const unreadCount = sentHistory.filter((n) => !n.read).length;

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" /> Send Message
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Send in-app notifications to any registered user or broadcast to everyone
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Users className="w-3 h-3" />
            {users.length} users
          </Badge>
          <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5">
            <History className="w-3 h-3" />
            {sentHistory.length} sent
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* ── COMPOSE PANEL ── */}
        <div className="xl:col-span-3 space-y-4">
          <Card className="shadow-card">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Send className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Compose Message</CardTitle>
                  <CardDescription>This message will appear in the recipient's Notifications page</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSend} className="space-y-5">
                {/* Target Type */}
                <div>
                  <Label className="text-sm font-medium">Send To</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, target: "specific", userId: "" }))}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                        form.target === "specific"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-border/80 hover:bg-muted/30"
                      }`}
                    >
                      <User className={`w-5 h-5 shrink-0 ${form.target === "specific" ? "text-primary" : "text-muted-foreground"}`} />
                      <div>
                        <p className={`text-sm font-semibold ${form.target === "specific" ? "text-primary" : "text-foreground"}`}>
                          Specific User
                        </p>
                        <p className="text-[11px] text-muted-foreground">Choose one recipient</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, target: "broadcast", userIds: [] }))}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                        form.target === "broadcast"
                          ? "border-warning bg-warning/5"
                          : "border-border hover:border-border/80 hover:bg-muted/30"
                      }`}
                    >
                      <Megaphone className={`w-5 h-5 shrink-0 ${form.target === "broadcast" ? "text-warning" : "text-muted-foreground"}`} />
                      <div>
                        <p className={`text-sm font-semibold ${form.target === "broadcast" ? "text-warning" : "text-foreground"}`}>
                          Broadcast All
                        </p>
                        <p className="text-[11px] text-muted-foreground">Send to all users</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Multi-User Selection (specific mode only) */}
                {form.target === "specific" && (
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Recipient(s)</Label>
                    <MultiUserSelect
                      users={users}
                      selectedUserIds={form.userIds}
                      onSelectionChange={(ids) => setForm((f) => ({ ...f, userIds: ids }))}
                      className="mt-1"
                    />

                    {/* Selected users summary */}
                    {form.userIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                        {selectedUsers.slice(0, 5).map((u) => (
                           <Badge key={u.id} variant="secondary" className="px-2 py-0.5 text-[10px] bg-background">
                            {u.name}
                          </Badge>
                        ))}
                        {form.userIds.length > 5 && (
                          <Badge variant="outline" className="text-[10px] bg-background">
                            +{form.userIds.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Broadcast warning */}
                {form.target === "broadcast" && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                    <p className="text-xs text-warning font-medium">
                      This will send the message to <strong>all {users.length} non-admin users</strong> simultaneously.
                    </p>
                  </div>
                )}

                <Separator />

                {/* Notification Type */}
                <div>
                  <Label className="text-sm font-medium">Message Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as NotifType }))}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(typeConfig) as NotifType[]).map((t) => (
                        <SelectItem key={t} value={t}>
                          <div className="flex items-center gap-2">
                            <span className={typeConfig[t].color}>{typeConfig[t].icon}</span>
                            {typeConfig[t].label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div>
                  <Label className="text-sm font-medium" htmlFor="msg-subject">
                    Subject <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="msg-subject"
                    className="mt-1.5"
                    placeholder="e.g. Reminder: Proposal deadline approaching"
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    maxLength={120}
                  />
                </div>

                {/* Message Body */}
                <div>
                  <Label className="text-sm font-medium" htmlFor="msg-body">Message *</Label>
                  <Textarea
                    id="msg-body"
                    className="mt-1.5 min-h-[110px] resize-none"
                    placeholder="Type your message here..."
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    maxLength={1000}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground mt-1 text-right">{form.message.length}/1000</p>
                </div>

                {/* Send Button */}
                <Button
                  type="submit"
                  disabled={isSending || !form.message.trim() || (form.target === "specific" && form.userIds.length === 0)}
                  className="w-full gradient-primary"
                  size="lg"
                >
                  {isSending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                  ) : form.target === "broadcast" ? (
                    <><Megaphone className="w-4 h-4 mr-2" /> Broadcast to All Users</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Send to {form.userIds.length} Recipient{form.userIds.length !== 1 ? "s" : ""}</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* ── SENT HISTORY PANEL ── */}
        <div className="xl:col-span-2">
          <Card className="shadow-card h-full">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <History className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Sent Messages</CardTitle>
                    <CardDescription className="text-xs">Recent messages you've sent</CardDescription>
                  </div>
                </div>
                {sentHistory.length > 0 && (
                  <Badge variant="secondary" className="text-xs">{sentHistory.length}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-0">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading history...</span>
                </div>
              ) : sentHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-3">
                  <Mail className="w-10 h-10 opacity-20" />
                  <div className="text-center">
                    <p className="text-sm font-medium">No messages sent yet</p>
                    <p className="text-xs mt-1">Your sent messages will appear here</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-border/50 max-h-[580px] overflow-y-auto">
                  {sentHistory.map((notif) => {
                    const cfg = typeConfig[notif.type as NotifType] || typeConfig.info;
                    const recipientName = typeof notif.userId === "object" ? notif.userId.name : "Unknown";
                    const recipientRole = typeof notif.userId === "object" ? notif.userId.role : "";
                    const sentDate = new Date(notif.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    });
                    return (
                      <div key={notif.id} className="px-5 py-3.5 hover:bg-muted/20 transition-colors">
                        <div className="flex items-start gap-3">
                          <span className={`mt-0.5 shrink-0 ${cfg.color}`}>{cfg.icon}</span>
                          <div className="flex-1 min-w-0">
                            {notif.subject && (
                              <p className="text-sm font-semibold text-foreground truncate">{notif.subject}</p>
                            )}
                            <p className={`text-xs text-muted-foreground line-clamp-2 ${notif.subject ? "mt-0.5" : ""}`}>
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant="outline" className={`text-[10px] gap-1 ${cfg.color} border-current/20 ${cfg.bg}`}>
                                <span>{cfg.label}</span>
                              </Badge>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <User className="w-2.5 h-2.5" />
                                {recipientName}
                                {recipientRole && (
                                  <span className="opacity-60 capitalize"> · {recipientRole}</span>
                                )}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> {sentDate}
                            </p>
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
      </div>
    </div>
  );
};

export default AdminMessagesPage;
