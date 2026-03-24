// ============================================================
// Staff: Communicate with Students
// ============================================================

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { mockProjects, mockUsers, mockMessages } from "@/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const StaffMessagesPage = () => {
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  if (!user) return null;

  // Get all students from projects this staff is advising or examining
  const relatedProjects = mockProjects.filter(
    (p) => p.advisorId === user.id || p.examinerId === user.id
  );
  const studentIds = [...new Set(relatedProjects.flatMap((p) => p.groupMembers))];
  const students = studentIds
    .map((id) => mockUsers.find((u) => u.id === id))
    .filter(Boolean);

  const messages = selectedStudent
    ? mockMessages.filter(
        (m) =>
          (m.fromUserId === user.id && m.toUserId === selectedStudent) ||
          (m.fromUserId === selectedStudent && m.toUserId === user.id)
      )
    : [];

  const handleSend = () => {
    if (!newMessage.trim()) return;
    toast({ title: "Message Sent", description: "Your message has been sent to the student." });
    setNewMessage("");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Communicate with Students</h1>
        <p className="text-sm text-muted-foreground mt-1">Message students from your assigned projects</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Student list */}
        <Card className="shadow-card lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Students</CardTitle>
            <CardDescription>Select a student to chat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No students assigned.</p>
            ) : (
              students.map((student) => {
                const isActive = selectedStudent === student!.id;
                const initials = student!.name.split(" ").map((n) => n[0]).join("");
                return (
                  <button
                    key={student!.id}
                    onClick={() => setSelectedStudent(student!.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isActive
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50 border border-transparent"
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{student!.name}</p>
                      <p className="text-xs text-muted-foreground">{student!.department}</p>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Chat area */}
        <Card className="shadow-card lg:col-span-2">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base">
              {selectedStudent
                ? mockUsers.find((u) => u.id === selectedStudent)?.name ?? "Chat"
                : "Select a student"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!selectedStudent ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Select a student to start messaging.</p>
              </div>
            ) : (
              <>
                <div className="p-4 space-y-3 min-h-[300px] max-h-[400px] overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Start the conversation!</p>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.fromUserId === user.id;
                      return (
                        <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted text-foreground rounded-bl-md"
                          }`}>
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{msg.date}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="p-4 border-t border-border flex gap-2">
                  <Textarea
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[44px] resize-none"
                    rows={1}
                  />
                  <Button onClick={handleSend} size="icon" className="shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffMessagesPage;
