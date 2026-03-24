// ============================================================
// Examiner: Project Status Overview
// ============================================================

import { useAuth } from "@/contexts/AuthContext";
import { mockProjects } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, CheckCircle, Clock } from "lucide-react";

const statusColors: Record<string, string> = {
  "pending": "bg-warning/10 text-warning border-warning/20",
  "in-progress": "bg-info/10 text-info border-info/20",
  "under-review": "bg-primary/10 text-primary border-primary/20",
  "completed": "bg-success/10 text-success border-success/20",
};

const ExaminerStatusPage = () => {
  const { user } = useAuth();
  if (!user) return null;

  const projects = mockProjects.filter((p) => p.examinerId === user.id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Project Status</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor progress of projects you're examining</p>
      </div>

      {projects.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No projects assigned.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const total = project.milestones.length;
            const completed = project.milestones.filter((m) => m.status === "approved").length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Card key={project.id} className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <Badge variant="outline" className={statusColors[project.status]}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-medium text-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Milestones */}
                  <div className="space-y-2">
                    {project.milestones.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 text-sm">
                        {m.status === "approved" ? (
                          <CheckCircle className="w-4 h-4 text-success shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-warning shrink-0" />
                        )}
                        <span className={`flex-1 ${m.status === "approved" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {m.title}
                        </span>
                        <span className="text-xs text-muted-foreground">{m.dueDate}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground">Deadline: {project.deadline}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExaminerStatusPage;
