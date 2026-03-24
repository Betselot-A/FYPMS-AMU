// ============================================================
// Student: Chat Page (reusable for Advisor & Examiner)
// Examiner chat includes video conferencing option
// ============================================================

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { mockMessages, mockUsers } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatPageProps {
  recipientRole: "advisor" | "examiner";
}

const ChatPage = ({ recipientRole }: ChatPageProps) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [inCall, setInCall] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const { toast } = useToast();

  if (!user) return null;

  const recipient = mockUsers.find((u) =>
    u.role === "staff" && (
      recipientRole === "advisor" ? u.staffAssignment?.isAdvisor : u.staffAssignment?.isExaminer
    )
  );
  const recipientName = recipient?.name || (recipientRole === "advisor" ? "Your Advisor" : "Your Examiner");
  const recipientInitials = recipientName.split(" ").map((n) => n[0]).join("").toUpperCase();

  const chat = messages.filter(
    (m) =>
      (m.fromUserId === user.id && m.toUserId === recipient?.id) ||
      (m.fromUserId === recipient?.id && m.toUserId === user.id)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        fromUserId: user.id,
        fromUserName: user.name,
        toUserId: recipient?.id || "",
        content: newMessage.trim(),
        date: new Date().toISOString().split("T")[0],
      },
    ]);
    setNewMessage("");
  };

  const startCall = () => {
    setInCall(true);
    setVideoOn(true);
    setMicOn(true);
    toast({ title: "Video call started", description: `Connecting with ${recipientName}...` });
  };

  const endCall = () => {
    setInCall(false);
    toast({ title: "Call ended", description: "The video call has been disconnected." });
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-1">
        Communicate with {recipientRole === "advisor" ? "Advisor" : "Examiner"}
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        {recipientRole === "examiner"
          ? "Chat or start a video conference with your examiner."
          : `Send messages directly to ${recipientName}.`}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Card */}
        <Card className="shadow-card">
          <CardHeader className="border-b border-border pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">{recipientInitials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{recipientName}</CardTitle>
                <p className="text-xs text-muted-foreground capitalize">{recipientRole}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {chat.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-10">No messages yet. Start the conversation!</p>
              )}
              {chat.map((msg) => {
                const isMe = msg.fromUserId === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      isMe
                        ? "gradient-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}>
                      <p>{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <form onSubmit={handleSend} className="border-t border-border p-3 flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" className="gradient-primary text-primary-foreground shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Video Conferencing - Only for Examiner */}
        {recipientRole === "examiner" && (
          <Card className="shadow-card">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" /> Video Conference
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!inCall ? (
                <div className="flex flex-col items-center justify-center h-80 p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Video className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Start a Video Call</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                    Connect with {recipientName} for a face-to-face discussion about your project.
                  </p>
                  <Button onClick={startCall} className="gradient-primary text-primary-foreground px-6">
                    <Video className="w-4 h-4 mr-2" /> Start Call
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col h-80">
                  {/* Video area */}
                  <div className="flex-1 bg-sidebar rounded-none flex items-center justify-center relative">
                    <div className="text-center">
                      <Avatar className="w-20 h-20 mx-auto mb-3">
                        <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-2xl font-bold">
                          {recipientInitials}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sidebar-foreground font-medium">{recipientName}</p>
                      <p className="text-sidebar-foreground/60 text-xs mt-1">Connected</p>
                    </div>
                    {/* Self preview */}
                    <div className="absolute bottom-3 right-3 w-24 h-18 rounded-lg bg-sidebar-accent flex items-center justify-center border-2 border-sidebar-border">
                      <p className="text-sidebar-foreground text-xs font-medium">You</p>
                    </div>
                  </div>
                  {/* Controls */}
                  <div className="flex items-center justify-center gap-3 p-4 border-t border-border">
                    <Button
                      variant={micOn ? "outline" : "destructive"}
                      size="icon"
                      className="rounded-full w-10 h-10"
                      onClick={() => setMicOn(!micOn)}
                    >
                      {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant={videoOn ? "outline" : "destructive"}
                      size="icon"
                      className="rounded-full w-10 h-10"
                      onClick={() => setVideoOn(!videoOn)}
                    >
                      {videoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="rounded-full w-10 h-10"
                      onClick={endCall}
                    >
                      <PhoneOff className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
