// ============================================================
// Student: Unified Chat Page
// Manage conversations with Advisor and Examiner in one place
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Video, VideoOff, Mic, MicOff, PhoneOff, Loader2, MessageSquare, ShieldCheck, UserCog } from "lucide-react";
import { toast } from "sonner";
import { notificationService } from "@/api";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types";

type RecipientRole = "advisor" | "examiner";

const ChatPage = () => {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState<RecipientRole>("advisor");
  const [newMessage, setNewMessage] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  if (!user) return null;

  // Find recipients
  const advisor = mockUsers.find(u => u.role === "staff" && u.staffAssignment?.isAdvisor);
  const examiner = mockUsers.find(u => u.role === "staff" && u.staffAssignment?.isExaminer);

  const activeRecipient = activeRole === "advisor" ? advisor : examiner;
  const recipientName = activeRecipient?.name || (activeRole === "advisor" ? "Your Advisor" : "Your Examiner");
  const recipientInitials = recipientName.split(" ").map((n) => n[0]).join("").toUpperCase();

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await notificationService.getAll();
      setNotifications(res.data);
    } catch {
      toast.error("Could not load chat history");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const chat = notifications.filter(
    (n) => {
      const sId = typeof n.senderId === 'object' ? n.senderId.id : n.senderId;
      return (n.userId === user.id && sId === activeRecipient?.id) ||
        (sId === user.id && n.userId === activeRecipient?.id);
    }
  ).sort((a, b) => new Date(a.date || a.createdAt || 0).getTime() - new Date(b.date || b.createdAt || 0).getTime());

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRecipient?.id) return;

    setIsSending(true);
    try {
      await notificationService.create({
        userId: activeRecipient.id,
        subject: `Message from ${user.name}`,
        message: newMessage.trim(),
        type: "info"
      });
      setNewMessage("");
      fetchMessages();
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
          </CardContent>
        </Card>

        {/* Main Content: Chat & Video */}
        <div className="lg:col-span-3 grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
          {/* Chat Card */}
          <Card className="shadow-card flex flex-col overflow-hidden h-full">
            <CardHeader className="border-b border-border py-4 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 ring-2 ring-primary/10">
                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{recipientInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-sm">{recipientName}</CardTitle>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{activeRole}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground animate-pulse">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-xs font-medium">Synchronizing messages...</p>
                </div>
              ) : chat.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
                  <MessageSquare className="w-12 h-12 mb-3 stroke-1" />
                  <p className="text-sm font-medium">No messages yet.</p>
                  <p className="text-xs mt-1">Start the conversation with your {activeRole}!</p>
                </div>
              ) : (
                chat.map((n) => {
                  const isMe = n.senderId === user.id || (typeof n.senderId === 'object' && n.senderId.id === user.id);
                  return (
                    <div key={n.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-background border border-border text-foreground rounded-bl-sm"
                      )}>
                        <p className="leading-relaxed">{n.message}</p>
                        <p className={cn(
                          "text-[9px] mt-1.5 opacity-70 font-medium",
                          isMe ? "text-right" : "text-left"
                        )}>
                          {new Date(n.date || n.createdAt || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
            <div className="p-4 border-t border-border bg-background">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 h-11 bg-muted/30 border-none focus-visible:ring-primary/20"
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isSending || !newMessage.trim()}
                  className="h-11 w-11 rounded-xl gradient-primary text-primary-foreground shrink-0 shadow-md transition-transform active:scale-95"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </Card>

          {/* Context Panel (Video or Info) */}
          <Card className={cn(
            "shadow-card overflow-hidden h-full transition-all duration-300",
            activeRole === "examiner" ? "opacity-100 translate-y-0" : "hidden xl:flex xl:opacity-50 xl:grayscale xl:pointer-events-none"
          )}>
            <CardHeader className="border-b border-border py-4 bg-primary/5">
              <CardTitle className="text-sm flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" /> Video Conference
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              {!inCall ? (
                <div className="flex flex-col items-center justify-center flex-1 p-8 text-center bg-sidebar/10">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-8 ring-primary/5">
                    <Video className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Connect Remotely</h3>
                  <p className="text-sm text-muted-foreground mb-8 max-w-[240px] mx-auto">
                    Face-to-face discussion with your examiner about your project progress and evaluation.
                  </p>
                  <Button 
                    onClick={startCall} 
                    disabled={activeRole !== "examiner"}
                    className="gradient-primary text-primary-foreground px-8 h-11 rounded-full shadow-lg shadow-primary/20"
                  >
                    <Video className="w-4 h-4 mr-2" /> Start Meeting
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col flex-1 bg-zinc-950 text-white relative">
                  {/* Remote video area */}
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <Avatar className="w-24 h-24 ring-4 ring-primary/30 ring-offset-4 ring-offset-zinc-950">
                      <AvatarFallback className="bg-zinc-800 text-white text-2xl font-bold">
                        {recipientInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-lg font-semibold">{recipientName}</p>
                      <Badge variant="outline" className="mt-2 bg-primary/10 text-primary border-primary/20 animate-pulse">
                        LIVE CONNECTION
                      </Badge>
                    </div>
                  </div>

                  {/* Local video preview */}
                  <div className="absolute top-4 right-4 w-32 h-44 rounded-xl bg-zinc-800 border-2 border-zinc-700 overflow-hidden shadow-2xl flex items-center justify-center">
                    {!videoOn ? (
                      <div className="flex flex-col items-center gap-1 opacity-50">
                        <VideoOff className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">OFF</span>
                      </div>
                    ) : (
                       <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">YOU</span>
                    )}
                  </div>

                  {/* Video Controls */}
                  <div className="p-6 bg-zinc-900/90 backdrop-blur-md flex items-center justify-center gap-4">
                    <Button
                      variant={micOn ? "outline" : "destructive"}
                      size="icon"
                      className="rounded-full w-12 h-12 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"
                      onClick={() => setMicOn(!micOn)}
                    >
                      {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </Button>
                    <Button
                      variant={videoOn ? "outline" : "destructive"}
                      size="icon"
                      className="rounded-full w-12 h-12 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"
                      onClick={() => setVideoOn(!videoOn)}
                    >
                      {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </Button>
                    <div className="w-px h-8 bg-zinc-800 mx-2" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="rounded-full w-14 h-14 shadow-lg shadow-destructive/20 active:scale-90 transition-transform"
                      onClick={endCall}
                    >
                      <PhoneOff className="w-6 h-6 fill-current" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
