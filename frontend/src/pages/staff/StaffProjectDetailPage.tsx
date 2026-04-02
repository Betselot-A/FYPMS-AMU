import { useParams, Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardCheck,
  Clock,
  MessageSquare,
  Award,
  Activity,
  ArrowLeft,
  Users,
  FileText,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import projectService, { Project } from "@/api/projectService";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  "pending": "bg-warning/10 text-warning border-warning/20",
  "approved": "bg-success/10 text-success border-success/20",
  "in-progress": "bg-info/10 text-info border-info/20",
  "submitted": "bg-primary/10 text-primary border-primary/20",
  "completed": "bg-success/10 text-success border-success/20",
};

const StaffProjectDetailPage = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      const res = await projectService.getById(projectId);
      setProject(res.data);
    } catch (error) {
      toast.error("Project details could not be retrieved.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Determine role dynamically
  const isAdvisor = project && (typeof project.advisorId === 'object'
    ? (project.advisorId as any).id === user?.id
    : project.advisorId === user?.id);

  const isExaminer = project && (typeof project.examinerId === 'object'
    ? (project.examinerId as any).id === user?.id
    : project.examinerId === user?.id);

  const role = isAdvisor ? "advisor" : isExaminer ? "examiner" : "viewer";

  const features = [
    {
      label: "Submissions",
      icon: ClipboardCheck,
      path: "submissions",
      description: "Review uploaded files, provide marks and feedback",
      visible: isAdvisor
    },
    {
      label: "Evaluate Students",
      icon: Award,
      path: "evaluate",
      description: "Submit academic marks based on university criteria",
      visible: isAdvisor || isExaminer
    },
    {
      label: "Project Details",
      icon: FileText,
      path: "details",
      description: "View full project information and documentation",
      visible: true
    },
    {
      label: "Timeline & Status",
      icon: Clock,
      path: "status",
      description: "Monitor evaluation deadlines and milestones",
      visible: true
    },
    {
      label: "Messaging",
      icon: MessageSquare,
      path: "/dashboard/staff/messages",
      description: "Secure communication with project members",
      visible: isAdvisor
    },
  ];

  const basePath = `/dashboard/staff/project/${projectId}`;
  const isSubPage = location.pathname !== basePath;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!project) return <div className="p-20 text-center text-muted-foreground">Unauthorized access or project missing.</div>;

  if (isSubPage) {
    return <Outlet />;
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary mb-6 transition-all group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        BACK TO OVERVIEW
      </Link>

      <Card className="shadow-card border-none bg-gradient-to-br from-background to-muted/20 overflow-hidden mb-8">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] font-black uppercase tracking-widest", statusColors[project.status])}>
                  {project.status}
                </Badge>
                <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none">
                  {isAdvisor ? "Lead Advisor" : isExaminer ? "Panel Examiner" : "Stakeholder"}
                </Badge>
              </div>
              <CardTitle className="text-3xl font-display font-black text-foreground leading-tight">
                {project.title}
              </CardTitle>
              <CardDescription className="text-sm font-medium leading-relaxed max-w-2xl mt-2 line-clamp-2">
                {project.description}
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-2xl bg-background border flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 rounded-2xl bg-background shadow-inner">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Squad Size</p>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold">{project.groupMembers.length} Members</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Academic Year</p>
              <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                2025/26 GC
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Phase Deadline</p>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning" />
                <span className="text-sm font-bold">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Unset'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Assigned Role</p>
              <span className="text-sm font-bold text-primary capitalize">{role}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] ml-2 mb-4">
          Operational Control
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.filter(f => f.visible).map((feature) => (
            <Link key={feature.path} to={feature.path.startsWith("/") ? feature.path : `${basePath}/${feature.path}?role=${role}`}>
              <Card className="shadow-card border-none hover:bg-muted/10 transition-all duration-300 group cursor-pointer h-full">
                <CardContent className="p-6 flex items-start gap-4 h-full">
                  <div className="w-12 h-12 rounded-2xl bg-muted/30 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-all shadow-sm">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-foreground text-lg">{feature.label}</h3>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffProjectDetailPage;
