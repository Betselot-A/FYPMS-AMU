import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Calendar, 
  Target, 
  Activity,
  ArrowUpRight,
  Milestone as MilestoneIcon,
  Search
} from "lucide-react";
import projectService, { Project, Milestone } from "@/api/projectService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusIcon: Record<string, React.ReactNode> = {
  approved: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  pending: <Clock className="w-5 h-5 text-amber-500" />,
  rejected: <XCircle className="w-5 h-5 text-rose-500" />,
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rejected: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  "in-progress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const ProjectStatusPage = () => {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      // Fetch projects where student is a member
      const res = await projectService.getAll();
      const myProject = res.data.find(p => p.groupMembers.some(m => (typeof m === 'string' ? m : m.id) === user.id));
      if (myProject) {
        setProject(myProject);
      }
    } catch (error) {
      toast.error("Process synchronization failed.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const progress = useMemo(() => {
    if (!project || !project.milestones || project.milestones.length === 0) return 0;
    const approved = project.milestones.filter((m) => m.status === "approved").length;
    return Math.round((approved / project.milestones.length) * 100);
  }, [project]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <Target className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
        <h2 className="text-xl font-bold text-foreground font-display">No Active Project Journey</h2>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
          You are currently not assigned to an active research group. 
          Please contact your coordinator for deployment.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-10 space-y-2">
        <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] font-black tracking-widest px-2 py-0.5">
           REAL-TIME TRACKING
        </Badge>
        <h1 className="text-4xl font-display font-black text-foreground">Project Roadmap</h1>
        <p className="text-sm text-muted-foreground">Monitoring integrity and milestone completion for: <span className="text-foreground font-bold">{project.title}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <Card className="md:col-span-2 shadow-xl shadow-primary/5 border-none bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <Activity className="w-40 h-40" />
            </div>
            <CardContent className="p-8 relative z-10 flex flex-col justify-between h-full min-h-[200px]">
               <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">OPERATIONAL STATUS</p>
                  <div className="flex items-center gap-3">
                     <h2 className="text-3xl font-black capitalize">{project.status}</h2>
                     <Badge className="bg-white/20 text-white backdrop-blur-md border-none uppercase text-[10px] font-black px-3">
                        Phase 1 Active
                     </Badge>
                  </div>
               </div>
               
               <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                     <span>Journey Completion</span>
                     <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-md">
                     <div 
                        className="h-full bg-white transition-all duration-1000 ease-out" 
                        style={{ width: `${progress}%` }} 
                     />
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card className="shadow-card border-none bg-muted/30 overflow-hidden group">
            <CardContent className="p-8 h-full flex flex-col justify-center items-center text-center space-y-4">
               <div className="w-16 h-16 rounded-3xl bg-background flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <MilestoneIcon className="w-8 h-8 text-primary" />
               </div>
               <div>
                  <p className="text-2xl font-black text-foreground">
                     {project.milestones.filter(m => m.status === 'approved').length} <span className="text-muted-foreground font-medium">/ {project.milestones.length}</span>
                  </p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Milestones Finalized</p>
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Journey Timeline</h3>
        <div className="relative space-y-4">
          <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-muted/60" />
          
          {project.milestones.map((milestone, idx) => {
            const isActive = idx === 0 || project.milestones[idx-1].status === 'approved';
            
            return (
              <div key={milestone.id} className={cn(
                "relative pl-14 transition-all duration-300",
                isActive ? "opacity-100" : "opacity-70 grayscale-[0.5]"
              )}>
                <div className={cn(
                  "absolute left-0 w-14 flex justify-center py-2 z-10",
                )}>
                   <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center border-4 border-background transition-all",
                      milestone.status === 'approved' ? "bg-emerald-500" : milestone.status === 'rejected' ? "bg-rose-500" : "bg-muted"
                   )}>
                      {milestone.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-white" />}
                   </div>
                </div>
                
                <Card className={cn(
                  "shadow-card border-none hover:ring-2 hover:ring-primary/20 transition-all",
                  isActive && "ring-2 ring-primary/40 bg-primary/[0.02]"
                )}>
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                            <h4 className="font-bold text-foreground">{milestone.title}</h4>
                            <Badge variant="outline" className={cn("text-[9px] font-black uppercase h-5 transition-colors", statusColors[milestone.status])}>
                               {milestone.status}
                            </Badge>
                         </div>
                         <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </div>
                      <div className="flex items-center gap-6 sm:text-right shrink-0">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">DEADLINE</p>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                               <Calendar className="w-3.5 h-3.5 text-primary" />
                               {milestone.dueDate}
                            </div>
                         </div>
                         <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectStatusPage;
