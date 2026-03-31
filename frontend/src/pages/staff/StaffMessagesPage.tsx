// ============================================================
// Staff: Communicate with Students
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { projectService, notificationService, userService } from "@/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Project, User as UserType, Notification } from "@/types";

const StaffMessagesPage = () => {
  const { user } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [students, setStudents] = useState<UserType[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Fetch projects and students
  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoadingStudents(true);
      // Fetch projects where staff is advisor or examiner
      const [advisorRes, examinerRes] = await Promise.all([
        projectService.getAll({ advisorId: user.id }),
        projectService.getAll({ examinerId: user.id })
      ]);
      
      const allProjects = [...advisorRes.data, ...examinerRes.data];
      const uniqueProjects = allProjects.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

      // Extract unique student IDs
      const studentIds = [...new Set(uniqueProjects.flatMap(p => p.groupMembers))];
      
      if (studentIds.length > 0) {
        // For simplicity, we'll fetch all users and filter. 
        // In a large system, we'd use a search/bulk fetch endpoint.
        const usersRes = await userService.getAll({ limit: 1000 });
        const filteredStudents = usersRes.data.users.filter(u => studentIds.includes(u.id));
        setStudents(filteredStudents);
      }
    } catch (error) {
      console.error("Error loading staff data:", error);
      toast.error("Could not load assigned students");
    } finally {
      setIsLoadingStudents(false);
    }
  }, [user]);

  // Fetch messages history
  const fetchMessages = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoadingMessages(true);
      const res = await notificationService.getAll();
      setNotifications(res.data);
    } catch {
      toast.error("Could not load message history");
    } finally {
      setIsLoadingMessages(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
    fetchMessages();
  }, [fetchData, fetchMessages]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Filter notifications to only show conversation between this staff and the selected student
  const messages = selectedStudentId
    ? notifications.filter((n) => {
        const sId = typeof n.senderId === 'object' ? n.senderId.id : n.senderId;
        return (n.userId === user?.id && sId === selectedStudentId) ||
               (sId === user?.id && n.userId === selectedStudentId);
      }).sort((a, b) => new Date(a.date || a.createdAt || 0).getTime() - new Date(b.date || b.createdAt || 0).getTime())
    : [];

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedStudentId || !user) return;
    
    setIsSending(true);
    try {
      await notificationService.create({
        userId: selectedStudentId,
        subject: `Message from Staff: ${user.name}`,
        message: newMessage.trim(),
        type: "info"
      });
      setNewMessage("");
      fetchMessages(); // Refresh conversation
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Communicate with Students</h1>
        <p className="text-sm text-muted-foreground mt-1">Message students from your assigned projects</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student list */}
        <Card className="shadow-card lg:col-span-1">
          <CardHeader className="pb-3 px-4">
            <CardTitle className="text-base">Students</CardTitle>
            <CardDescription>Select a student to chat</CardDescription>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {isLoadingStudents ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-xs">Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 px-4">No students assigned to your projects.</p>
            ) : (
              students.map((student) => {
                const isActive = selectedStudentId === student.id;
                const initials = student.name.split(" ").map((n) => n[0]).join("").toUpperCase();
                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <Avatar className="w-8 h-8 border border-border">
                      <AvatarFallback className="text-[10px] bg-background text-primary font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="text-sm truncate">{student.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{student.department}</p>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Chat area */}
        <Card className="shadow-card lg:col-span-2 flex flex-col h-[600px]">
          <CardHeader className="py-3 px-4 border-b border-border">
            <div className="flex items-center gap-3">
              {selectedStudent ? (
                <>
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarFallback className="text-[10px] bg-primary/5 text-primary font-bold">
                      {selectedStudent.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm">{selectedStudent.name}</CardTitle>
                    <p className="text-[10px] text-muted-foreground">Active Conversation</p>
                  </div>
                </>
              ) : (
                <CardTitle className="text-sm">Select a Conversation</CardTitle>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {!selectedStudentId ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-base font-medium text-foreground">Your Student Inbox</h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-1">
                  Select a student from the left menu to view the message history and send new updates.
                </p>
              </div>
            ) : isLoadingMessages ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-xs">Loading conversation...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
                <p className="text-sm text-muted-foreground">No recent notifications or messages found for this student.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const sId = typeof msg.senderId === 'object' ? msg.senderId.id : msg.senderId;
                const isOwn = sId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}>
                      <p className="leading-relaxed">{msg.message}</p>
                      <p className={`text-[10px] mt-1.5 opacity-70 ${isOwn ? "text-right" : "text-left"}`}>
                        {new Date(msg.date || msg.createdAt || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>

          {selectedStudentId && (
            <div className="p-4 border-t border-border bg-muted/20">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message to the student..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[60px] max-h-[120px] resize-none bg-background shadow-inner"
                  disabled={isSending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isSending || !newMessage.trim()}
                  className="h-auto px-4 self-stretch gradient-primary text-primary-foreground"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StaffMessagesPage;
