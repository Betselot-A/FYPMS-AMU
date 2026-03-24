// ============================================================
// Project Details Page (Examiner context)
// Full project information and documentation
// ============================================================

import { useParams, useSearchParams, Link } from "react-router-dom";
import { mockProjects, mockUsers, mockSubmissions } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Users, FileText, Calendar } from "lucide-react";

const statusColors: Record<string, string> = {
  "pending": "bg-warning/10 text-warning border-warning/20",
  "approved": "bg-success/10 text-success border-success/20",
  "in-progress": "bg-info/10 text-info border-info/20",
  "under-review": "bg-accent/10 text-accent border-accent/20",
  "completed": "bg-success/10 text-success border-success/20",
};

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "examiner";
  const project = mockProjects.find((p) => p.id === projectId);

  if (!project) return <p className="text-muted-foreground">Project not found.</p>;

  const members = project.groupMembers.map((id) => mockUsers.find((u) => u.id === id)).filter(Boolean);
  const submissions = mockSubmissions.filter((s) => s.projectId === projectId);
  const completedMilestones = project.milestones.filter((m) => m.status === "approved").length;
  const progress = Math.round((completedMilestones / project.milestones.length) * 100);

  return (
    <div>
      <Link to={`/dashboard/staff/project/${projectId}?role=${role}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Project
      </Link>
      <h1 className="text-xl font-display font-bold text-foreground mb-1">Project Details</h1>
      <p className="text-sm text-muted-foreground mb-6">{project.title}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Overview</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Description</p>
              <p className="text-foreground">{project.description}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant="outline" className={statusColors[project.status]}>{project.status}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">Deadline: {project.deadline}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Group Members</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {members.map((m) => (
              <div key={m!.id} className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{m!.name}</span>
                <span className="text-xs text-muted-foreground">({m!.department})</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Progress</CardTitle></CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-2" />
            <p className="text-xs text-muted-foreground">{completedMilestones} of {project.milestones.length} milestones completed ({progress}%)</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Submitted Files</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {submissions.map((s) => (
              <div key={s.id} className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{s.title}</span>
                <span className="text-xs text-muted-foreground">({s.submissionDate})</span>
              </div>
            ))}
            {submissions.length === 0 && <p className="text-sm text-muted-foreground">No files submitted.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
