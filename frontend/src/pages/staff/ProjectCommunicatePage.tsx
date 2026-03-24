// ============================================================
// Project Communicate Page (Advisor context)
// Chat with students in a specific project
// ============================================================

import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState } from "react";
import { mockProjects, mockUsers, mockMessages } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";

const ProjectCommunicatePage = () => {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "advisor";
  const { user } = useAuth();
  const project = mockProjects.find((p) => p.id === projectId);
  const [newMessage, setNewMessage] = useState("");

  if (!user || !project) return <p className="text-muted-foreground">Project not found.</p>;

  const members = project.groupMembers.map((id) => mockUsers.find((u) => u.id === id)).filter(Boolean);
  const relevantMessages = mockMessages.filter(
    (m) => (m.fromUserId === user.id || m.toUserId === user.id) &&
      (project.groupMembers.includes(m.fromUserId) || project.groupMembers.includes(m.toUserId) || m.fromUserId === user.id || m.toUserId === user.id)
  );

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setNewMessage("");
  };

  return (
    <div>
      <Link to={`/dashboard/staff/project/${projectId}?role=${role}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Project
      </Link>
      <h1 className="text-xl font-display font-bold text-foreground mb-1">Communicate</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {project.title} — Members: {members.map((m) => m!.name).join(", ")}
      </p>

      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
            {relevantMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.fromUserId === user.id ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-lg p-3 text-sm ${msg.fromUserId === user.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  <p className="text-xs font-medium mb-1 opacity-80">{msg.fromUserName}</p>
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            {relevantMessages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No messages yet.</p>
            )}
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={2}
              className="flex-1"
            />
            <Button onClick={handleSend} size="sm" className="self-end">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectCommunicatePage;
