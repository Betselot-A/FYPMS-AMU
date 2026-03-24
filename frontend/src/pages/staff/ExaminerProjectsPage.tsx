// ============================================================
// Examiner: Assigned Projects, Student Groups & Project Details
// ============================================================

import { useAuth } from "@/contexts/AuthContext";
import { mockProjects, mockUsers } from "@/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FolderOpen, Users, Calendar, Target } from "lucide-react";

const statusColors: Record<string, string> = {
  "pending": "bg-warning/10 text-warning border-warning/20",
  "in-progress": "bg-info/10 text-info border-info/20",
  "under-review": "bg-primary/10 text-primary border-primary/20",
  "completed": "bg-success/10 text-success border-success/20",
};

const ExaminerProjectsPage = () => {
  const { user } = useAuth();
  if (!user) return null;

  const projects = mockProjects.filter((p) => p.examinerId === user.id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Assigned Projects</h1>
        <p className="text-sm text-muted-foreground mt-1">Projects assigned for examination</p>
      </div>

      {projects.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No projects assigned for examination.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const members = project.groupMembers
              .map((id) => mockUsers.find((u) => u.id === id))
              .filter(Boolean);
            const advisor = mockUsers.find((u) => u.id === project.advisorId);
            const completedMilestones = project.milestones.filter((m) => m.status === "approved").length;

            return (
              <Card key={project.id} className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription className="mt-1">{project.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className={statusColors[project.status]}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Group Members */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Student Group
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {members.map((member) => (
                        <div key={member!.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {member!.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">{member!.name}</p>
                            <p className="text-xs text-muted-foreground">{member!.department}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground">Advisor</p>
                      <p className="text-sm font-medium text-foreground">{advisor?.name ?? "—"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Deadline</p>
                        <p className="text-sm font-medium text-foreground">{project.deadline}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Milestones</p>
                        <p className="text-sm font-medium text-foreground">{completedMilestones}/{project.milestones.length} done</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExaminerProjectsPage;
