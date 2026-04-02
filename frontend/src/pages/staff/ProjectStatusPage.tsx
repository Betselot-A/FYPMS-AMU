import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Target,
  Calendar,
  ShieldCheck,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { projectService } from "@/api";
import { Project } from "@/api/projectService";
import { cn } from "@/lib/utils";

const ProjectStatusPage = () => {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "examiner";
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      const res = await projectService.getById(projectId);
      setProject(res.data);
    } catch (error) {
      toast.error("Could not sync project roadmap.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-40 w-full" />
        <div className="space-y-4">
           {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  if (!project) return <div className="p-20 text-center text-muted-foreground">Project records missing.</div>;

  const completed = project.milestones.filter((m) => m.status === "approved").length;
  const progress = Math.round((completed / project.milestones.length) * 100) || 0;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link to={`/dashboard/staff/project/${projectId}?role=${role}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary mb-6 transition-all group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        BACK TO PROJECT OVERVIEW
      </Link>

      <div className="mb-10">
         <Badge variant="outline" className="text-primary border-primary/20 uppercase text-[10px] font-black tracking-widest px-2 py-0.5 mb-2">
            Operational Roadmap
         </Badge>
         <h1 className="text-3xl font-display font-black text-foreground">Project Phase Tracking</h1>
         <p className="text-sm text-muted-foreground mt-1">Real-time visualization of research milestones and validation status.</p>
      </div>

      <Card className="shadow-card border-none bg-gradient-to-br from-primary/5 via-background to-background mb-10 overflow-hidden">
        <div className="h-1.5 w-full bg-muted">
           <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
        <CardContent className="p-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                 <div className="w-16 h-16 rounded-2xl bg-background border flex items-center justify-center shadow-sm">
                    <Target className="w-8 h-8 text-primary" />
                 </div>
                 <div>
                    <p className="text-2xl font-black text-foreground leading-none">{progress}%</p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1.5">OVERALL COMPLETION</p>
                 </div>
              </div>
              <div className="flex items-center gap-8">
                 <div className="text-center md:text-right">
                    <p className="font-bold text-foreground leading-none">{completed}</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">VALIDATED</p>
                 </div>
                 <div className="w-px h-8 bg-border/50 hidden md:block" />
                 <div className="text-center md:text-right">
                    <p className="font-bold text-foreground leading-none">{project.milestones.length - completed}</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">PENDING</p>
                 </div>
              </div>
           </div>
        </CardContent>
      </Card>

      <div className="relative pl-8 space-y-6">
        {/* Vertical line connector */}
        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-border/40" />
        
        {project.milestones.map((m, idx) => (
          <div key={m.id} className="relative group">
            {/* Status Indicator Point */}
            <div className={cn(
              "absolute -left-9 top-1.5 w-[14px] h-[14px] rounded-full border-2 border-background z-10 transition-all duration-500",
              m.status === "approved" ? "bg-success scale-125" : 
              m.status === "rejected" ? "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]" : 
              "bg-muted-foreground/30"
            )} />

            <Card className={cn(
              "shadow-card border-none transition-all duration-300",
              m.status === "approved" ? "bg-success/[0.02]" : "hover:bg-muted/30"
            )}>
              <CardContent className="p-5 flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors",
                  m.status === "approved" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {m.status === "approved" ? <ShieldCheck className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <h3 className="font-bold text-foreground text-base tracking-tight">{m.title}</h3>
                    <Badge variant="outline" className={cn(
                      "font-black text-[9px] uppercase tracking-widest border-none h-6 px-2",
                      m.status === "approved" ? "bg-success/10 text-success" : 
                      m.status === "rejected" ? "bg-destructive/10 text-destructive" : 
                      "bg-warning/10 text-warning"
                    )}>
                      {m.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xl">{m.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                     <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                        <Calendar className="w-3.5 h-3.5" />
                        DUE: {new Date(m.dueDate).toLocaleDateString()}
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectStatusPage;
