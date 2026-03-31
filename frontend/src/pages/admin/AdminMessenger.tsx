// ============================================================
// Admin/Coordinator Messenger
// Professional Unified Messaging Suite (Chat + Broadcast)
// ============================================================

import { useCallback, useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MultiUserSelect } from "@/components/MultiUserSelect";
import { 
  Send, Search, Loader2, MessageSquare, User, Clock, 
  ChevronRight, Video, Mic, MailPlus, AlertTriangle, 
  Info, CheckCircle, Calendar, Megaphone, X, History 
} from "lucide-react";
import { toast } from "sonner";
import { notificationService, userService } from "@/api";
import { cn } from "@/lib/utils";
import type { Notification, User as UserType } from "@/types";

type NotifType = "info" | "warning" | "success" | "deadline";

const typeConfig: Record<NotifType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  info: { label: "Info", icon: <Info className="w-3.5 h-3.5" />, color: "text-info", bg: "bg-info/10" },
  warning: { label: "Warning", icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "text-warning", bg: "bg-warning/10" },
  success: { label: "Success", icon: <CheckCircle className="w-3.5 h-3.5" />, color: "text-success", bg: "bg-success/10" },
  deadline: { label: "Deadline", icon: <Calendar className="w-3.5 h-3.5" />, color: "text-destructive", bg: "bg-destructive/10" },
};

const AdminMessenger = () => {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Navigation State
  const [viewMode, setViewMode] = useState<"chat" | "compose">(searchParams.get("mode") === "compose" ? "compose" : "chat");
  
  // Sidebar State
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  
  // Chat State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(searchParams.get("user"));
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Compose State (Broadcast / Targeted)
  const [isSendingCompose, setIsSendingCompose] = useState(false);
  const [composeForm, setComposeForm] = useState({
    target: "specific" as "specific" | "broadcast",
    userIds: [] as string[],
    subject: "",
    message: "",
    type: "info" as NotifType,
  });

  // 1. Fetch Data
  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    try {
      setIsLoadingUsers(true);
      const [usersRes, messagesRes] = await Promise.all([
        userService.getAll({ limit: 1000 }),
        notificationService.getAll()
      ]);
      setAllUsers(usersRes.data.users.filter(u => u.id !== currentUser.id));
      setNotifications(messagesRes.data);
    } catch {
      toast.error("Could not load messaging data");
    } finally {
      setIsLoadingUsers(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Handle Search Params
  useEffect(() => {
    const userId = searchParams.get("user");
    const mode = searchParams.get("mode");
    if (userId) {
      setSelectedUserId(userId);
      setViewMode("chat");
    }
    if (mode === "compose") setViewMode("compose");
  }, [searchParams]);

  // 3. Computed Chat Data
  const activeChatMessages = useMemo(() => {
    if (!selectedUserId || !currentUser) return [];
    return notifications.filter(n => {
      const sId = typeof n.senderId === 'object' ? (n.senderId as any).id : n.senderId;
      const uId = typeof n.userId === 'object' ? (n.userId as any).id : n.userId;
      const myId = currentUser.id.toString();
      const targetId = selectedUserId.toString();
      return (uId === myId && sId === targetId) || (sId === myId && uId === targetId);
    }).sort((a, b) => new Date(a.date || a.createdAt || 0).getTime() - new Date(b.date || b.createdAt || 0).getTime());
  }, [notifications, selectedUserId, currentUser]);

  const selectedUser = useMemo(() => 
    allUsers.find(u => u.id === selectedUserId), 
  [allUsers, selectedUserId]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allUsers, searchQuery]);

  // 4. Handlers
  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId || !currentUser) return;

    setIsSendingChat(true);
    try {
      await notificationService.create({
        userId: selectedUserId,
        subject: `Message from ${currentUser.name}`,
        message: newMessage.trim(),
        type: "info"
      });
      setNewMessage("");
      const res = await notificationService.getAll();
      setNotifications(res.data);
      setTimeout(() => {
        const area = document.getElementById("admin-chat-scroll-area");
        if (area) area.scrollTop = area.scrollHeight;
      }, 100);
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleComposeSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeForm.message.trim()) return;
    if (composeForm.target === "specific" && composeForm.userIds.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    setIsSendingCompose(true);
    try {
      const payload = composeForm.target === "broadcast"
        ? { subject: composeForm.subject, message: composeForm.message, type: composeForm.type }
        : { userIds: composeForm.userIds, subject: composeForm.subject, message: composeForm.message, type: composeForm.type };

      await notificationService.create(payload);
      toast.success("Broadcast delivered successfully");
      setComposeForm(prev => ({ ...prev, subject: "", message: "", userIds: [] }));
      fetchData(); // Refresh history/notifications
    } catch (err: any) {
      toast.error("Failed to deliver broadcast");
    } finally {
      setIsSendingCompose(false);
    }
  };

  const handleSelectUser = (id: string) => {
    setSelectedUserId(id);
    setViewMode("chat");
    setSearchParams({ user: id });
  };

  const startCompose = () => {
    setViewMode("compose");
    setSelectedUserId(null);
    setSearchParams({ mode: "compose" });
  };

  if (!currentUser) return null;

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden relative">
      {/* Header Bar - Optional, but keeps consistency */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-background/50 backdrop-blur-sm shrink-0">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            Messenger Suites
          </h1>
        </div>
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="gap-1.5 border-primary/20 bg-primary/5 text-primary py-1 px-3 rounded-full">
             <History className="w-3.5 h-3.5" />
             <span className="font-bold tracking-tight">{notifications.length} Logs</span>
           </Badge>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR: CONTACTS & COMPOSE */}
        <div className="w-80 flex flex-col shrink-0 border-r border-border bg-sidebar/5 overflow-hidden">
          <CardHeader className="p-4 border-b border-sidebar-border/30 space-y-3">
            <Button 
              onClick={startCompose} 
              variant={viewMode === "compose" ? "default" : "outline"}
              className={cn(
                "w-full justify-start gap-3 h-11 transition-all",
                viewMode === "compose" ? "gradient-primary shadow-lg shadow-primary/20" : "bg-background/50"
              )}
            >
              <MailPlus className="w-4 h-4" />
              <span className="font-bold">New Message</span>
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Find contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-sm bg-background/50 border-none shadow-none focus-visible:ring-primary/20"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
            {isLoadingUsers ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 opacity-30">
                <Loader2 className="w-10 h-10 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">Loading...</span>
              </div>
            ) : (
              <div className="divide-y divide-sidebar-border/10">
                {filteredUsers.map((u) => {
                  const isActive = !viewMode.includes("compose") && selectedUserId === u.id;
                  const initials = u.name.split(" ").map(n => n[0]).join("").toUpperCase();
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 text-left transition-all relative group",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted/40 text-foreground"
                      )}
                    >
                      <Avatar className={cn("w-10 h-10 ring-2", isActive ? "ring-white/20" : "ring-primary/5")}>
                        <AvatarFallback className={cn("text-xs font-bold", isActive ? "bg-white/10" : "bg-primary/5 text-primary")}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 pr-2">
                        <p className={cn("text-sm font-bold truncate", isActive ? "text-white" : "text-foreground")}>
                          {u.name}
                        </p>
                        <p className={cn("text-[9px] truncate opacity-60 uppercase font-black tracking-widest mt-0.5", isActive ? "text-white" : "text-primary/60")}>
                          {u.role}
                        </p>
                      </div>
                      <ChevronRight className={cn("w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity", isActive && "hidden")} />
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </div>

        {/* MAIN AREA: CHAT OR COMPOSE */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {viewMode === "compose" ? (
            /* ── COMPOSE VIEW ── */
            <div className="flex-1 flex flex-col overflow-hidden bg-background">
              <CardHeader className="py-5 px-8 border-b border-border bg-muted/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <MailPlus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">New Message</CardTitle>
                    <CardDescription>Compose a targeted message or system-wide broadcast</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form onSubmit={handleComposeSend} className="max-w-3xl space-y-6">
                  {/* Select Target */}
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">RECIPIENT TYPE</label>
                    <div className="grid grid-cols-2 gap-4">
                       <button
                        type="button"
                        onClick={() => setComposeForm(f => ({ ...f, target: "specific" }))}
                        className={cn(
                          "flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all group",
                          composeForm.target === "specific" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", composeForm.target === "specific" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                           <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={cn("font-bold", composeForm.target === "specific" ? "text-primary" : "text-foreground")}>Targeted</p>
                          <p className="text-[10px] text-muted-foreground/80 mt-0.5">Send to specific user(s)</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setComposeForm(f => ({ ...f, target: "broadcast" }))}
                        className={cn(
                          "flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all group",
                          composeForm.target === "broadcast" ? "border-warning bg-warning/5" : "border-border hover:border-border/80"
                        )}
                      >
                         <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", composeForm.target === "broadcast" ? "bg-warning text-white" : "bg-muted text-muted-foreground")}>
                           <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={cn("font-bold", composeForm.target === "broadcast" ? "text-warning" : "text-foreground")}>Broadcast</p>
                          <p className="text-[10px] text-muted-foreground/80 mt-0.5">Send to all members</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {composeForm.target === "specific" && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                       <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">SELECT RECIPIENTS</label>
                       <MultiUserSelect 
                        users={allUsers}
                        selectedUserIds={composeForm.userIds}
                        onSelectionChange={(ids) => setComposeForm(f => ({ ...f, userIds: ids }))}
                       />
                    </div>
                  )}

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">ALERT LEVEL</label>
                      <Select value={composeForm.type} onValueChange={(v) => setComposeForm(f => ({ ...f, type: v as NotifType }))}>
                        <SelectTrigger className="h-12 rounded-xl border-none bg-muted/40 font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(typeConfig) as NotifType[]).map((t) => (
                            <SelectItem key={t} value={t}>
                              <div className="flex items-center gap-2">
                                <span className={typeConfig[t].color}>{typeConfig[t].icon}</span>
                                <span className="font-semibold">{typeConfig[t].label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">SUBJECT</label>
                       <Input 
                        placeholder="Importance message topic..."
                        value={composeForm.subject}
                        onChange={(e) => setComposeForm(f => ({ ...f, subject: e.target.value }))}
                        className="h-12 border-none bg-muted/40 rounded-xl"
                       />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">MESSAGE CONTENT</label>
                    <Textarea 
                      required
                      placeholder="Type your announcement details here..."
                      className="min-h-[160px] border-none bg-muted/40 rounded-2xl p-6 text-base resize-none"
                      value={composeForm.message}
                      onChange={(e) => setComposeForm(f => ({ ...f, message: e.target.value }))}
                    />
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={isSendingCompose || !composeForm.message.trim() || (composeForm.target === "specific" && composeForm.userIds.length === 0)}
                      className="w-full h-16 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold gradient-primary shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-95"
                    >
                      {isSendingCompose ? <><Loader2 className="w-5 h-5 animate-spin" /> DELIVERING...</> : <><Send className="w-5 h-5" /> SEND MESSAGE NOW</>}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </div>
          ) : (
            /* ── CHAT VIEW ── */
            <>
              {!selectedUserId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-muted/2">
                   <div className="w-32 h-32 rounded-full bg-primary/5 flex items-center justify-center mb-8 shadow-inner ring-[20px] ring-primary/1">
                    <MessageSquare className="w-12 h-12 text-primary/20" />
                  </div>
                  <h3 className="text-2xl font-black text-foreground">Select Conversation</h3>
                  <p className="text-muted-foreground mt-3 max-w-[320px] text-sm leading-relaxed">
                    Pick a contact from the left list to start a real-time professional chat session.
                  </p>
                  <Button variant="outline" className="mt-8 rounded-full h-12 px-8 border-primary/20 hover:bg-primary/5 gap-2" onClick={startCompose}>
                    <MailPlus className="w-4 h-4 text-primary" />
                    New Announcement
                  </Button>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <CardHeader className="py-4 px-8 border-b border-border bg-muted/10 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 ring-2 ring-primary/10 shadow-sm border-2 border-background">
                          <AvatarFallback className="bg-primary/5 text-primary font-black text-xl">
                            {selectedUser?.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-xl font-bold tracking-tight">{selectedUser?.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-success ring-2 ring-success/20 animate-pulse" />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
                              {selectedUser?.role} • SESSION ACTIVE
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="rounded-xl h-11 w-11 bg-muted/50 hover:bg-primary/10 hover:text-primary">
                          <Video className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-xl h-11 w-11 bg-muted/50 hover:bg-primary/10 hover:text-primary">
                          <Mic className="w-5 h-5" />
                        </Button>
                        <Separator orientation="vertical" className="h-8 mx-1" />
                        <Button variant="ghost" size="icon" className="rounded-xl h-11 w-11 hover:bg-destructive/10 hover:text-destructive" onClick={() => setSelectedUserId(null)}>
                           <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Message Area */}
                  <CardContent id="admin-chat-scroll-area" className="flex-1 overflow-y-auto p-10 space-y-8 bg-muted/2 custom-scrollbar">
                    {activeChatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-30">
                        <MessageSquare className="w-16 h-16 mb-6 stroke-1" />
                        <p className="text-lg font-bold">No message history</p>
                        <p className="text-sm mt-2">Start the conversation with {selectedUser?.name} below.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        {activeChatMessages.map((msg) => {
                          const sId = typeof msg.senderId === 'object' ? (msg.senderId as any).id : msg.senderId;
                          const isOwn = sId === currentUser.id;
                          return (
                            <div key={msg.id} className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
                              <div className={cn(
                                "max-w-[75%] px-6 py-4 rounded-3xl text-sm shadow-card transition-all hover:shadow-xl relative",
                                isOwn 
                                  ? "bg-primary text-primary-foreground rounded-tr-none" 
                                  : "bg-background border border-border text-foreground rounded-tl-none"
                              )}>
                                <p className="leading-relaxed text-[15px] whitespace-pre-wrap">{msg.message}</p>
                                <div className={cn("flex items-center gap-2 mt-3", isOwn ? "justify-end" : "justify-start")}>
                                   <Clock className="w-2.5 h-2.5 opacity-40" />
                                   <p className="text-[10px] font-black opacity-40 uppercase tracking-tighter">
                                    {new Date(msg.date || msg.createdAt || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                   </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>

                  {/* Chat Input */}
                  <div className="p-8 bg-background border-t border-border shrink-0">
                    <form onSubmit={handleChatSend} className="flex gap-4 max-w-5xl mx-auto items-center">
                      <div className="flex-1 relative">
                        <Input
                          placeholder={`Message ${selectedUser?.name}...`}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          disabled={isSendingChat}
                          className="h-16 bg-muted/40 border-none shadow-inner focus-visible:ring-primary/40 rounded-2xl text-[16px] px-8 placeholder:opacity-50"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isSendingChat || !newMessage.trim()}
                        className="h-16 w-16 rounded-2xl gradient-primary shadow-2xl shadow-primary/20 transition-all hover:scale-110 active:scale-95 shrink-0"
                      >
                        {isSendingChat ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                      </Button>
                    </form>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessenger;
