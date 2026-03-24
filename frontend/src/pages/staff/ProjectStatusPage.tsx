// ============================================================
// Project Status Page (Examiner context)
// Track project progress and milestones
// ============================================================

import { useParams, useSearchParams, Link } from "react-router-dom";
import { mockProjects } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";

const ProjectStatusPage = () => {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "examiner";
  const project = mockProjects.find((p) => p.id === projectId);

  if (!project) return <p className="text-muted-foreground">Project not found.</p>;

  const completed = project.milestones.filter((m) => m.status === "approved").length;
  const progress = Math.round((completed / project.milestones.length) * 100);

  return (
    <div>
      <Link to={`/dashboard/staff/project/${projectId}?role=${role}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Project
      </Link>
      <h1 className="text-xl font-display font-bold text-foreground mb-1">Project Status</h1>
      <p className="text-sm text-muted-foreground mb-6">{project.title}</p>

      <Card className="shadow-card mb-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>
          <Progress value={progress} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {project.milestones.map((m) => (
          <Card key={m.id} className="shadow-card">
            <CardContent className="p-4 flex items-start gap-3">
              {m.status === "approved" ? (
                <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
              ) : m.status === "rejected" ? (
                <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground text-sm">{m.title}</h3>
                  <Badge variant="outline" className={
                    m.status === "approved" ? "bg-success/10 text-success border-success/20" :
                    m.status === "rejected" ? "bg-destructive/10 text-destructive border-destructive/20" :
                    "bg-warning/10 text-warning border-warning/20"
                  }>{m.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                <p className="text-xs text-muted-foreground mt-1">Due: {m.dueDate}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectStatusPage;
