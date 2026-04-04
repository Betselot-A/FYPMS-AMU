import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Timer,
  LayoutDashboard,
  ShieldCheck,
  Flag
} from "lucide-react";
import { toast } from "sonner";
import { projectService } from "@/api";
import { Project, Milestone } from "@/api/projectService";
import { cn } from "@/lib/utils";

const ProjectDeadlinesPage = () => {
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
      toast.error("Could not synchronize phase timeline.");
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

  const sortedMilestones = [...project.milestones].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link to={`/dashboard/staff/project/${projectId}?role=${role}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary mb-6 transition-all group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        BACK TO PROJECT OVERVIEW
      </Link>

      <div className="mb-10">
         <Badge variant="outline" className="text-muted-foreground border-border uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 mb-2">
            Temporal Management
         </Badge>
         <h1 className="text-3xl font-display font-bold text-foreground">Phase Timeline</h1>
         <p className="text-sm text-muted-foreground mt-1">Official institutional deadlines and administrative milestones for this research project.</p>
      </div>

      <div className="relative space-y-8 pl-10 border-l-2 border-border/40 ml-4 py-4">
        {sortedMilestones.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
              <Timer className="w-12 h-12 opacity-20 mb-4" />
              <p className="text-sm font-bold uppercase tracking-wider">No active milestones defined.</p>
              <p className="text-xs mt-1 italic">Contact the coordinator to sync the project schedule.</p>
           </div>
        ) : (
          sortedMilestones.map((m, idx) => {
            const isCompleted = m.status === "approved";
            const isLate = !isCompleted && new Date(m.dueDate) < new Date();
            
            return (
              <div key={m.id} className="relative">
                {/* Timeline Node */}
                <div className={cn(
                  "absolute -left-[51px] top-6 w-5 h-5 rounded-full border-4 border-background z-10 transition-colors shadow-sm",
                  isCompleted ? "bg-success" : isLate ? "bg-destructive animate-pulse" : "bg-muted-foreground/30"
                )} />

                <Card className={cn(
                  "shadow-card border-none overflow-hidden transition-all duration-300 hover:translate-x-1",
                  isCompleted ? "bg-muted/30" : isLate ? "ring-1 ring-destructive/20 shadow-lg shadow-destructive/5" : "hover:bg-muted/10"
                )}>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className={cn(
                        "md:w-48 p-6 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border/50",
                        isCompleted ? "bg-success/5" : isLate ? "bg-destructive/5" : "bg-muted/10"
                      )}>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Official Due Date</p>
                        <p className={cn(
                          "text-lg font-bold leading-tight",
                          isLate ? "text-destructive" : "text-foreground"
                        )}>
                          {new Date(m.dueDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                           {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                           ) : (
                              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                           )}
                           <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">
                              {isCompleted ? "VALIDATED" : isLate ? "OVERDUE" : "PENDING"}
                           </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-foreground text-sm uppercase tracking-tight">{m.title}</h3>
                          <Badge variant="outline" className={cn(
                            "text-[9px] font-bold uppercase tracking-wider border-none h-6 px-2",
                            isCompleted ? "bg-success/10 text-success" : 
                            isLate ? "bg-destructive/10 text-destructive" : 
                            "bg-warning/10 text-warning"
                          )}>
                             Phase {idx + 1}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed italic">{m.description || "Administrative project phase requiring submission and review."}</p>
                        
                        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/50">
                           <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                              <Flag className="w-3 h-3" />
                              Required Action: Artifact Upload
                           </div>
                           <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider ml-auto">
                              <ShieldCheck className="w-3 h-3 text-primary/60" />
                              {role.toUpperCase()} VERIFICATION REQUIRED
                           </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })
        )}
      </div>

      {!isLoading && sortedMilestones.length > 0 && (
         <div className="mt-12 p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm">
                  <LayoutDashboard className="w-5 h-5 text-primary" />
               </div>
               <div>
                  <p className="text-sm font-bold text-foreground">Timeline Insight</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">The project is currently in Phase {project.milestones.filter(m => m.status === 'approved').length + 1}</p>
               </div>
            </div>
            <Link to={`/dashboard/staff/project/${projectId}/status?role=${role}`}>
               <Button size="sm" variant="ghost" className="text-[10px] font-black uppercase tracking-widest gap-2">
                  View Full Status <ChevronRight className="w-3.5 h-3.5" />
               </Button>
            </Link>
         </div>
      )}
    </div>
  );
};

export default ProjectDeadlinesPage;
