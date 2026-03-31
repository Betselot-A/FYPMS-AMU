// ============================================================
// Student: Unified Chat Page
// Manage conversations with Advisor and Examiner in one place
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Video, VideoOff, Mic, MicOff, PhoneOff, Loader2, MessageSquare, ShieldCheck, UserCog, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { notificationService, projectService, userService } from "@/api";
import { cn } from "@/lib/utils";
import type { Notification, User as UserType } from "@/types";

type RecipientRole = "advisor" | "examiner" | "admin";

const ChatPage = () => {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState<RecipientRole>("advisor");
  const [newMessage, setNewMessage] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  // Real contact state
  const [advisor, setAdvisor] = useState<UserType | null>(null);
  const [examiner, setExaminer] = useState<UserType | null>(null);
  const [admin, setAdmin] = useState<UserType | null>(null);

  const fetchContacts = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoadingContacts(true);
      // 1. Fetch Student's Project to get staff details
      const projectRes = await projectService.getAll();
      const myProject = projectRes.data[0]; // Students only have one project

      if (myProject) {
        if (myProject.advisorId) setAdvisor(myProject.advisorId as unknown as UserType);
        if (myProject.examinerId) setExaminer(myProject.examinerId as unknown as UserType);
      }

      // 2. Fetch Admin for System Support
      const userRes = await userService.getAll({ role: "admin", limit: 1 });
      if (userRes.data.users.length > 0) {
        setAdmin(userRes.data.users[0]);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoadingContacts(false);
    }
  }, [user]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await notificationService.getAll();
      setNotifications(res.data);
      // Auto-scroll to bottom after loading
      setTimeout(() => {
        const scrollArea = document.getElementById("chat-scroll-area");
        if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
      }, 100);
    } catch {
      toast.error("Could not load chat history");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
    fetchMessages();
  }, [fetchContacts, fetchMessages]);

  const activeRecipient = activeRole === "advisor" ? advisor : activeRole === "examiner" ? examiner : admin;
  const recipientName = activeRecipient?.name || (activeRole === "advisor" ? "Your Advisor" : activeRole === "examiner" ? "Your Examiner" : "System Support");
  const recipientInitials = recipientName.split(" ").map((n) => n[0] || "").join("").toUpperCase();

  const chat = notifications.filter(
    (n) => {
      if (!activeRecipient?.id || !n.userId) return false;
      const sId = typeof n.senderId === 'object' ? (n.senderId as any).id : n.senderId;
      const uId = typeof n.userId === 'object' ? (n.userId as any).id : n.userId;
      
      // Use string comparison to be safe
      const myId = user?.id?.toString();
      const targetId = activeRecipient.id?.toString();
      const msgRecipientId = uId?.toString();
      const msgSenderId = sId?.toString();

      return (msgRecipientId === myId && msgSenderId === targetId) ||
             (msgSenderId === myId && msgRecipientId === targetId);
    }
  ).sort((a, b) => new Date(a.date || a.createdAt || 0).getTime() - new Date(b.date || b.createdAt || 0).getTime());

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRecipient?.id || !user) return;

    setIsSending(true);
    try {
      await notificationService.create({
        userId: activeRecipient.id,
        subject: `Message from ${user.name}`,
        message: newMessage.trim(),
        type: "info"
      });
      setNewMessage("");
      await fetchMessages(); // Refetch will trigger auto-scroll
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const startCall = () => {
    setInCall(true);
    setVideoOn(true);
    setMicOn(true);
    toast("Video call started", { description: `Connecting with ${recipientName}...` });
  };

  const endCall = () => {
    setInCall(false);
    toast("Call ended", { description: "The video call has been disconnected." });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Messaging Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Communicate with your assigned project staff</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
        {/* Sidebar: Contacts */}
        <Card className="lg:col-span-1 shadow-card flex flex-col overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4 border-b border-border">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1 flex-1 overflow-y-auto">
            {isLoadingContacts ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 opacity-50">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[10px] font-medium tracking-widest uppercase">Loading Contacts</span>
              </div>
            ) : (
              <>
                {/* Advisor Button */}
                <button
                  onClick={() => { setActiveRole("advisor"); setInCall(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                    activeRole === "advisor" 
                      ? "bg-primary text-primary-foreground shadow-md ring-1 ring-primary"
                      : "hover:bg-muted/50 text-foreground"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    activeRole === "advisor" ? "bg-primary-foreground/20" : "bg-primary/10"
                  )}>
                    <UserCog className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold truncate leading-tight">Advisor</p>
                    <p className={cn(
                      "text-[10px] truncate opacity-70",
                      activeRole === "advisor" ? "text-primary-foreground" : "text-muted-foreground"
                    )}>
                      {advisor?.name || "Unassigned"}
                    </p>
                  </div>
                </button>

                {/* Examiner Button */}
                <button
                  onClick={() => { setActiveRole("examiner"); setInCall(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                    activeRole === "examiner"
                      ? "bg-primary text-primary-foreground shadow-md ring-1 ring-primary"
                      : "hover:bg-muted/50 text-foreground"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    activeRole === "examiner" ? "bg-primary-foreground/20" : "bg-primary/10"
                  )}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold truncate leading-tight">Examiner</p>
                    <p className={cn(
                      "text-[10px] truncate opacity-70",
                      activeRole === "examiner" ? "text-primary-foreground" : "text-muted-foreground"
                    )}>
                      {examiner?.name || "Unassigned"}
                    </p>
                  </div>
                </button>

                {/* Separator */}
                <div className="py-2 px-3">
                  <div className="h-px bg-border w-full" />
                </div>

                {/* Support Button */}
                <button
                  onClick={() => { setActiveRole("admin"); setInCall(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border border-transparent",
                    activeRole === "admin"
                      ? "bg-amber-500 text-white shadow-md ring-1 ring-amber-500"
                      : "hover:border-amber-200 hover:bg-amber-500/5 text-foreground"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    activeRole === "admin" ? "bg-white/20" : "bg-amber-100"
                  )}>
                    <HelpCircle className={cn("w-5 h-5", activeRole === "admin" ? "text-white" : "text-amber-600")} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold truncate leading-tight">System Support</p>
                    <p className={cn(
                      "text-[10px] truncate uppercase font-bold tracking-widest",
                      activeRole === "admin" ? "text-white/80" : "text-amber-600/80"
                    )}>
                      {admin ? "Admin Active" : "Report Issue"}
                    </p>
                  </div>
                </button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-3 shadow-card flex flex-col overflow-hidden relative">
          {/* Header */}
          <CardHeader className="py-4 px-6 border-b border-border bg-muted/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-10 h-10 ring-2 ring-primary/10">
                  <AvatarFallback className="bg-primary/5 text-primary font-bold">
                    {recipientInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base leading-tight">{recipientName}</CardTitle>
                  <Badge variant="outline" className="text-[9px] py-0 h-4 mt-1 bg-background">
                    {activeRole.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors" onClick={startCall}>
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                  <Mic className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent id="chat-scroll-area" className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/5 scroll-smooth">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground opacity-50">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-xs font-medium tracking-widest uppercase">Fetching Messages</p>
              </div>
            ) : chat.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-12 space-y-4">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center shadow-inner">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">No history found</h3>
                  <p className="text-sm text-muted-foreground max-w-[240px] mx-auto mt-2">
                    Start a new conversation with your {activeRole}. Your messages will be stored securely.
                  </p>
                </div>
              </div>
            ) : (
              chat.map((msg) => {
                const sId = typeof msg.senderId === 'object' ? msg.senderId.id : msg.senderId;
                const isOwn = sId === user.id;
                return (
                  <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] px-5 py-3 rounded-2xl text-sm shadow-sm transition-all hover:shadow-md",
                      isOwn 
                        ? "bg-primary text-primary-foreground rounded-br-sm" 
                        : "bg-background border border-border text-foreground rounded-bl-sm"
                    )}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      <p className={cn(
                        "text-[9px] mt-2 font-medium opacity-60",
                        isOwn ? "text-right" : "text-left"
                      )}>
                        {new Date(msg.date || msg.createdAt || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>

          {/* Input Area */}
          <div className="p-4 bg-background border-t border-border">
            <form onSubmit={handleSend} className="flex gap-3">
              <Input
                placeholder={activeRecipient?.id ? `Message ${recipientName}...` : "Contact unassigned"}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isSending || !activeRecipient?.id}
                className="h-12 bg-muted/20 border-none shadow-inner focus-visible:ring-primary rounded-xl"
              />
              <Button 
                type="submit" 
                disabled={isSending || !newMessage.trim() || !activeRecipient?.id}
                className="h-12 px-6 rounded-xl gradient-primary shadow-lg shadow-primary/20 transition-transform active:scale-95"
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </form>
          </div>

          {/* Call Overlay */}
          {inCall && (
            <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col p-6 animate-in fade-in duration-300">
              <div className="flex-1 relative rounded-2xl overflow-hidden bg-slate-800 shadow-2xl border border-white/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Avatar className="w-32 h-32 ring-4 ring-primary animate-pulse">
                    <AvatarFallback className="bg-slate-700 text-primary-foreground text-4xl font-bold">
                      {recipientInitials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-xs font-black uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                    Live Call with {recipientName}
                  </span>
                </div>
              </div>
              <div className="h-24 flex items-center justify-center gap-6 mt-4">
                <Button
                  size="icon"
                  className={cn(
                    "w-14 h-14 rounded-full shadow-xl transition-all",
                    videoOn ? "bg-slate-700 hover:bg-slate-600" : "bg-red-500 hover:bg-red-600"
                  )}
                  onClick={() => setVideoOn(!videoOn)}
                >
                  {videoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="w-16 h-16 rounded-full shadow-xl hover:scale-110 active:scale-90 transition-all bg-red-600"
                  onClick={endCall}
                >
                  <PhoneOff className="w-8 h-8" />
                </Button>
                <Button
                  size="icon"
                  className={cn(
                    "w-14 h-14 rounded-full shadow-xl transition-all",
                    micOn ? "bg-slate-700 hover:bg-slate-600" : "bg-red-500 hover:bg-red-600"
                  )}
                  onClick={() => setMicOn(!micOn)}
                >
                  {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;
