// ============================================================
// Admin/Coordinator Messenger
// Professional Unified Messaging Suite (Chat)
// ============================================================

import { useCallback, useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Send, Search, Loader2, MessageSquare, Clock, 
  ChevronRight, Video, Mic, MailPlus, 
  X, History, Paperclip, FileText, Download, Megaphone
} from "lucide-react";
import { toast } from "sonner";
import { notificationService, userService } from "@/api";
import { cn } from "@/lib/utils";
import type { Notification, User as UserType } from "@/types";

const AdminMessenger = () => {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Sidebar State
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  
  // Chat State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(searchParams.get("user"));
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");

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
    // Real-Time Polling: fetch data every 10 seconds
    const intervalId = setInterval(() => {
      fetchData();
    }, 10000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  // 2. Handle Search Params
  useEffect(() => {
    const userId = searchParams.get("user");
    if (userId) {
      setSelectedUserId(userId);
    }
  }, [searchParams]);

  // 3. Computed Chat Data
  const activeChatMessages = useMemo(() => {
    if (!selectedUserId || !currentUser) return [];
    const thread = notifications.filter(n => {
      const sId = typeof n.senderId === 'object' && n.senderId ? (n.senderId as any).id : n.senderId;
      const uId = typeof n.userId === 'object' && n.userId ? (n.userId as any).id : n.userId;
      const myId = currentUser.id.toString();
      const targetId = selectedUserId.toString();
      return (uId === myId && sId === targetId) || (sId === myId && uId === targetId);
    }).sort((a, b) => new Date(a.date || a.createdAt || 0).getTime() - new Date(b.date || b.createdAt || 0).getTime());

    if (!chatSearchQuery.trim()) return thread;
    return thread.filter(msg => msg.message.toLowerCase().includes(chatSearchQuery.toLowerCase()));
  }, [notifications, selectedUserId, currentUser, chatSearchQuery]);

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
    if ((!newMessage.trim() && !attachment) || !selectedUserId || !currentUser) return;

    setIsSendingChat(true);
    try {
      let attachmentUrl = null;
      let attachmentName = null;

      if (attachment) {
        const uploadRes = await notificationService.uploadAttachment(attachment);
        attachmentUrl = uploadRes.data.attachmentUrl;
        attachmentName = uploadRes.data.attachmentName;
      }

      await notificationService.create({
        userId: selectedUserId,
        subject: `Message from ${currentUser.name}`,
        message: newMessage.trim() || `Sent an attachment: ${attachmentName}`,
        type: "info",
        attachmentUrl,
        attachmentName,
      });

      setNewMessage("");
      setAttachment(null);
      await fetchData();

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

  const handleSelectUser = async (id: string) => {
    setSelectedUserId(id);
    setSearchParams({ user: id });

    // Mark as read immediately
    try {
      await notificationService.markFromUserRead(id);
      fetchData(); // Silently refresh read statuses
    } catch { /* ignore */ }
  };

  if (!currentUser) return null;

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden relative">
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
              onClick={() => navigate(currentUser?.role === 'admin' ? '/dashboard/admin/announcements' : '/dashboard/coordinator/announcements')} 
              variant="outline"
              className="w-full justify-start gap-3 h-11 transition-all bg-background/50 border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              <Megaphone className="w-4 h-4" />
              <span className="font-bold text-sm">Announcements</span>
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
                  const isActive = selectedUserId === u.id;
                  const initials = u.name.split(" ").map(n => n[0]).join("").toUpperCase();
                  
                  // Calculate unread badge
                  const unreadCount = notifications.filter(n => {
                    const sId = typeof n.senderId === 'object' && n.senderId ? (n.senderId as any).id : n.senderId;
                    const uId = typeof n.userId === 'object' && n.userId ? (n.userId as any).id : n.userId;
                    return sId === u.id && uId === currentUser.id && !n.read;
                  }).length;

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
                      <div className="relative">
                        <Avatar className={cn("w-10 h-10 ring-2", isActive ? "ring-white/20" : "ring-primary/5")}>
                          <AvatarFallback className={cn("text-xs font-bold", isActive ? "bg-white/10" : "bg-primary/5 text-primary")}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        {!isActive && unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full border-2 border-background flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white leading-none">{unreadCount > 9 ? '9+' : unreadCount}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <p className={cn("text-sm font-bold truncate", isActive ? "text-white" : "text-foreground")}>
                          {u.name}
                        </p>
                        <p className={cn("text-[9px] truncate opacity-60 uppercase font-black tracking-widest mt-0.5", isActive ? "text-white" : "text-primary/60")}>
                          {u.role}
                        </p>
                      </div>
                      {isActive ? (
                        <div className="w-2 h-2 rounded-full bg-white ml-auto" />
                      ) : (
                         <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </div>

        {/* MAIN AREA: CHAT */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {!selectedUserId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-muted/2">
               <div className="w-32 h-32 rounded-full bg-primary/5 flex items-center justify-center mb-8 shadow-inner ring-[20px] ring-primary/1">
                <MessageSquare className="w-12 h-12 text-primary/20" />
              </div>
              <h3 className="text-2xl font-black text-foreground">Select Conversation</h3>
              <p className="text-muted-foreground mt-3 max-w-[320px] text-sm leading-relaxed">
                Pick a contact from the left list to start a real-time professional chat session.
              </p>
              <Button variant="outline" className="mt-8 rounded-full h-12 px-8 border-primary/20 hover:bg-primary/5 gap-2" onClick={() => navigate(currentUser?.role === 'admin' ? '/dashboard/admin/announcements' : '/dashboard/coordinator/announcements')}>
                <Megaphone className="w-4 h-4 text-primary" />
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

              {/* Search Bar - In Chat */}
              <div className="px-8 py-3 bg-muted/5 border-b border-border flex items-center justify-between z-10 relative">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversation history..."
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-background/50 text-sm border-none shadow-none focus-visible:ring-primary/20 rounded-full"
                  />
                </div>
              </div>

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
                      const sId = typeof msg.senderId === 'object' && msg.senderId ? (msg.senderId as any).id : msg.senderId;
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
                            
                            {msg.attachmentUrl && (
                              <a href={msg.attachmentUrl.startsWith('http') ? msg.attachmentUrl : `http://localhost:5000${msg.attachmentUrl}`} target="_blank" rel="noopener noreferrer" 
                                 className={cn("mt-4 flex items-center gap-3 p-3.5 rounded-2xl transition hover:brightness-110", isOwn ? "bg-white/20 text-white" : "bg-primary/10 text-primary")}>
                                <div className="w-10 h-10 rounded-xl bg-background/10 border border-background/20 flex items-center justify-center shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold truncate pr-4">{msg.attachmentName || "Attachment"}</p>
                                  <p className="text-[10px] uppercase font-black opacity-70 mt-0.5">Click to view/download</p>
                                </div>
                                <Download className="w-5 h-5 ml-1 opacity-80" />
                              </a>
                            )}

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
              <div className="p-8 bg-background border-t border-border shrink-0 relative z-20">
                <form onSubmit={handleChatSend} className="flex gap-4 max-w-5xl mx-auto items-center">
                  <div className="flex flex-1 items-center gap-3 relative">
                    {attachment && (
                      <div className="absolute -top-16 left-0 right-0 p-3 bg-muted/90 backdrop-blur-md rounded-xl flex items-center gap-4 text-sm animate-in fade-in slide-in-from-bottom-2 border border-border shadow-lg">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <span className="flex-1 truncate font-bold text-foreground">{attachment.name}</span>
                        <button type="button" onClick={() => setAttachment(null)} className="p-2 hover:bg-black/10 hover:text-destructive dark:hover:bg-white/10 rounded-full transition text-muted-foreground border border-border bg-background">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <input type="file" id="chat-attachment" className="hidden" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
                    <Button type="button" variant="outline" size="icon" className={cn("h-16 w-16 rounded-2xl border-none shadow-inner shrink-0 transition-colors", attachment ? "bg-primary/20 text-primary" : "bg-muted/40 hover:bg-primary/10 hover:text-primary")} onClick={() => document.getElementById("chat-attachment")?.click()}>
                      <Paperclip className="w-6 h-6" />
                    </Button>
                    
                    <Input
                      placeholder={`Message ${selectedUser?.name}...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isSendingChat}
                      className="h-16 bg-muted/40 border-none shadow-inner focus-visible:ring-primary/40 rounded-2xl text-[16px] px-6 placeholder:opacity-50 flex-1"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSendingChat || (!newMessage.trim() && !attachment)}
                    className="h-16 w-16 rounded-2xl gradient-primary shadow-2xl shadow-primary/20 transition-all hover:scale-110 active:scale-95 shrink-0"
                  >
                    {isSendingChat ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessenger;
