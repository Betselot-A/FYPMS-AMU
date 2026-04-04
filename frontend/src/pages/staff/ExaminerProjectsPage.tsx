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
      <div className="mb-10">
        <Badge variant="outline" className="border-border text-muted-foreground uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 mb-2">
           EXAMINER PORTFOLIO
        </Badge>
        <h1 className="text-4xl font-display font-bold text-foreground">Assigned Projects</h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">Projects assigned for academic examination and assessment.</p>
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
              <Card key={project.id} className="shadow-card border-none hover:ring-2 hover:ring-primary/20 transition-all duration-300 group overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{project.title}</CardTitle>
                      <CardDescription className="text-xs mt-1 text-muted-foreground font-medium">{project.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-border/50", statusColors[project.status])}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Group Members */}
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Student Group
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {members.map((member) => (
                        <div key={member!.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary uppercase">
                              {member!.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold text-foreground">{member!.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{member!.department}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Advisor</p>
                      <p className="text-sm font-bold text-foreground">{advisor?.name ?? "—"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Deadline</p>
                        <p className="text-sm font-bold text-foreground">{project.deadline}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Milestones</p>
                        <p className="text-sm font-bold text-foreground">{completedMilestones}/{project.milestones.length} done</p>
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
