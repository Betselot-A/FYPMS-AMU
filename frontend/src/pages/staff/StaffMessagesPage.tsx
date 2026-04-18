// ============================================================
// Staff: Communicate with Students
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { projectService, notificationService, userService, messageService } from "@/api";
import { Message } from "@/api/messageService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Loader2, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import type { Project, User as UserType, Notification } from "@/types";
import { cn } from "@/lib/utils";

const StaffMessagesPage = () => {
  const { user } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [students, setStudents] = useState<UserType[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [adminUser, setAdminUser] = useState<UserType | null>(null);

  // Fetch all authorized contacts (Coordinators, Colleagues, assigned Students)
  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoadingStudents(true);
      // Fetch users - backend now automatically handles discovery restrictions for staff
      const res = await userService.getAll({ limit: 1000 });
      setStudents(res.data.users.filter(u => u.id !== user.id)); // Exclude self
    } catch (error) {
      toast.error("Contact Sync Error", { description: "Could not retrieve your authorized contact list." });
    } finally {
      setIsLoadingStudents(false);
    }
  }, [user]);

  // Fetch admin user
  const fetchAdmin = useCallback(async () => {
    try {
      const res = await userService.getAll({ limit: 1000 });
      const admin = res.data.users.find(u => u.role === "admin");
      if (admin) setAdminUser(admin);
    } catch (error) {
      console.error("Error fetching admin:", error);
    }
  }, []);

  // Fetch messages history
  const fetchMessages = useCallback(async () => {
    if (!user || !selectedStudentId) return;
    try {
      setIsLoadingMessages(true);
      const res = await messageService.getConversation(selectedStudentId);
      setMessages(res.data);
    } catch {
      toast.error("Could not synchronize conversation");
    } finally {
      setIsLoadingMessages(false);
    }
  }, [user, selectedStudentId]);

  useEffect(() => {
    fetchData();
    fetchAdmin();
  }, [fetchData, fetchAdmin]);

  useEffect(() => {
    if (selectedStudentId) {
      fetchMessages();
      const intervalId = setInterval(fetchMessages, 10000);
      return () => clearInterval(intervalId);
    }
  }, [selectedStudentId, fetchMessages]);

  // Categorize for UI
  const leadership = students.filter(s => ["admin", "coordinator"].includes(s.role));
  const colleagues = students.filter(s => s.role === "staff");
  const myStudents = students.filter(s => s.role === "student");

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedStudentId || !user) return;
    
    setIsSending(true);
    try {
      await messageService.sendMessage({
        receiverId: selectedStudentId,
        content: newMessage.trim()
      });
      setNewMessage("");
      fetchMessages();
    } catch {
      toast.error("Failed to transmit message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="mb-10">
        <Badge variant="outline" className="border-border text-muted-foreground uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 mb-2">
           COMMUNICATION HUB
        </Badge>
        <h1 className="text-4xl font-display font-bold text-foreground">Secure Messaging</h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">Communicate with students and stakeholders from your assigned projects.</p>
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
                <p className="text-xs">Finding contacts...</p>
              </div>
            ) : students.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 px-4">No authorized contacts found for your account.</p>
            ) : (
              <div className="space-y-6">
                {/* Leadership Section */}
                {leadership.length > 0 && (
                  <div>
                    <h4 className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Leadership & Support</h4>
                    <div className="space-y-1">
                      {leadership.map(contact => (
                        <ContactButton 
                          key={contact.id} 
                          contact={contact} 
                          isActive={selectedStudentId === contact.id} 
                          onClick={() => setSelectedStudentId(contact.id)} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Colleagues Section */}
                {colleagues.length > 0 && (
                  <div>
                    <h4 className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">My Department Staff</h4>
                    <div className="space-y-1">
                      {colleagues.map(contact => (
                        <ContactButton 
                          key={contact.id} 
                          contact={contact} 
                          isActive={selectedStudentId === contact.id} 
                          onClick={() => setSelectedStudentId(contact.id)} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Students Section */}
                {myStudents.length > 0 && (
                  <div>
                    <h4 className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Assigned Students</h4>
                    <div className="space-y-1">
                      {myStudents.map(contact => (
                        <ContactButton 
                          key={contact.id} 
                          contact={contact} 
                          isActive={selectedStudentId === contact.id} 
                          onClick={() => setSelectedStudentId(contact.id)} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                    <CardTitle className="text-sm">
                      {selectedStudent.id === adminUser?.id ? "System Support" : selectedStudent.name}
                    </CardTitle>
                    <p className="text-[10px] text-muted-foreground">
                      {selectedStudent.id === adminUser?.id ? "Report bugs or data issues" : "Active Conversation"}
                    </p>
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
                <p className="text-sm text-muted-foreground">No recent messages found for this student.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}>
                      <p className="leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1.5 opacity-70 ${isOwn ? "text-right" : "text-left"}`}>
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

const ContactButton = ({ contact, isActive, onClick }: { contact: UserType, isActive: boolean, onClick: () => void }) => {
  const initials = contact.name.split(" ").map((n) => n[0]).join("").toUpperCase();
  
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
        isActive
          ? "bg-primary/10 text-primary shadow-sm"
          : "hover:bg-muted/50 text-foreground"
      }`}
    >
      <Avatar className="w-8 h-8 border border-border shrink-0">
        <AvatarFallback className={cn(
          "text-[10px] font-bold",
          contact.role === "admin" || contact.role === "coordinator" ? "bg-primary text-primary-foreground" : "bg-background text-primary"
        )}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="overflow-hidden">
        <div className="flex items-center gap-2">
           <p className={cn("text-xs truncate", isActive ? "font-bold" : "font-medium")}>{contact.name}</p>
           {contact.role !== "student" && (
             <Badge variant="outline" className="text-[8px] px-1 py-0 h-3 capitalize font-bold border-primary/20 bg-primary/5 text-primary">
               {contact.role}
             </Badge>
           )}
        </div>
        <p className="text-[10px] text-muted-foreground truncate leading-tight">{contact.department || "General Administration"}</p>
      </div>
    </button>
  );
};

export default StaffMessagesPage;
