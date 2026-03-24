// ============================================================
// Staff Project Detail Page
// Shows project info + feature links based on advisor/examiner context
// ============================================================

import { useParams, useSearchParams, Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockProjects, mockUsers, mockSubmissions } from "@/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FolderOpen, ClipboardCheck, Clock, MessageSquare, Award,
  Activity, ArrowLeft, Users, FileText, Send,
} from "lucide-react";

const statusColors: Record<string, string> = {
  "pending": "bg-warning/10 text-warning border-warning/20",
  "approved": "bg-success/10 text-success border-success/20",
  "in-progress": "bg-info/10 text-info border-info/20",
  "submitted": "bg-primary/10 text-primary border-primary/20",
  "reviewed": "bg-accent/10 text-accent border-accent/20",
  "under-review": "bg-accent/10 text-accent border-accent/20",
  "completed": "bg-success/10 text-success border-success/20",
};

const advisorFeatures = [
  { label: "Submissions", icon: ClipboardCheck, path: "submissions", description: "Review uploaded files, provide marks and feedback" },
  { label: "Deadlines", icon: Clock, path: "deadlines", description: "Monitor evaluation deadlines and milestones" },
  { label: "Communicate", icon: MessageSquare, path: "communicate", description: "Chat with students in this project" },
];

const examinerFeatures = [
  { label: "Project Details", icon: FileText, path: "details", description: "View full project information and documentation" },
  { label: "Evaluate & Grade", icon: Award, path: "evaluate", description: "Evaluate students and submit grades per member" },
  { label: "Project Status", icon: Activity, path: "status", description: "Track project progress and milestones" },
];

const StaffProjectDetailPage = () => {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const location = useLocation();

  const role = searchParams.get("role") as "advisor" | "examiner" | null;
  const project = mockProjects.find((p) => p.id === projectId);

  if (!user || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found.</p>
        <Link to="/dashboard" className="text-primary hover:underline text-sm mt-2 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const members = project.groupMembers
    .map((id) => mockUsers.find((u) => u.id === id))
    .filter(Boolean);

  const submissions = mockSubmissions.filter((s) => s.projectId === project.id);
  const features = role === "examiner" ? examinerFeatures : advisorFeatures;
  const basePath = `/dashboard/staff/project/${projectId}`;

  // Check if we're on a sub-page
  const isSubPage = location.pathname !== basePath;

  if (isSubPage) {
    return <Outlet />;
  }

  return (
    <div>
      {/* Back button */}
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Project header */}
      <Card className="shadow-card mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{project.title}</CardTitle>
              <CardDescription className="mt-1">{project.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={statusColors[project.status]}>
                {project.status}
              </Badge>
              <Badge variant="outline" className={role === "advisor" ? "bg-primary/10 text-primary border-primary/20" : "bg-warning/10 text-warning border-warning/20"}>
                {role === "advisor" ? "Advising" : "Examining"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Group Members</p>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{members.map((m) => m!.name).join(", ")}</span>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Deadline</p>
              <span className="text-foreground">{project.deadline}</span>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Submissions</p>
              <span className="text-foreground">{submissions.length} file(s)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature cards */}
      <h2 className="text-lg font-semibold text-foreground mb-4">
        {role === "advisor" ? "Advisor Actions" : "Examiner Actions"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feature) => (
          <Link key={feature.path} to={`${basePath}/${feature.path}?role=${role}`}>
            <Card className="shadow-card hover:shadow-md transition-shadow cursor-pointer border-border hover:border-primary/30">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{feature.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StaffProjectDetailPage;
