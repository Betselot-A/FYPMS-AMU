// ============================================================
// Student: Project Status Page
// ============================================================

import { useAuth } from "@/contexts/AuthContext";
import { mockProjects } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, XCircle } from "lucide-react";

const statusIcon: Record<string, React.ReactNode> = {
  approved: <CheckCircle className="w-4 h-4 text-success" />,
  pending: <Clock className="w-4 h-4 text-warning" />,
  rejected: <XCircle className="w-4 h-4 text-destructive" />,
};

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  "in-progress": "bg-info/10 text-info border-info/20",
};

const ProjectStatusPage = () => {
  const { user } = useAuth();
  if (!user) return null;

  const myProjects = mockProjects.filter((p) => p.groupMembers.includes(user.id));

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-1">Project Status</h1>
      <p className="text-muted-foreground text-sm mb-6">Track the progress of your project milestones.</p>

      {myProjects.length === 0 && (
        <p className="text-sm text-muted-foreground">You are not part of any project yet.</p>
      )}

      {myProjects.map((project) => {
        const approved = project.milestones.filter((m) => m.status === "approved").length;
        const total = project.milestones.length;
        return (
          <Card key={project.id} className="shadow-card mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <Badge variant="outline" className={statusColors[project.status]}>{project.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{project.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <Progress value={(approved / total) * 100} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground font-medium">{approved}/{total} milestones</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Milestones</p>
              <div className="space-y-2">
                {project.milestones.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                    <div className="flex items-center gap-3">
                      {statusIcon[m.status]}
                      <div>
                        <p className="text-sm font-medium text-foreground">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{m.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={`text-xs ${statusColors[m.status]}`}>{m.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">Due: {m.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProjectStatusPage;
