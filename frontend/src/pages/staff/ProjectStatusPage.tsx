import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  Zap,
  MoreVertical,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { projectService } from "@/api";
import { Project } from "@/api/projectService";
import { cn } from "@/lib/utils";

const ProjectStatusPage = () => {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "examiner";
  
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const isStaffManager = user?.role === "coordinator" || user?.role === "admin" || (typeof project?.advisorId === 'object' ? project?.advisorId?.id === user?.id : project?.advisorId === user?.id);

  const toggleMilestoneStatus = async (milestoneId: string, currentStatus: string) => {
    if (!project || !projectId) return;
    const newStatus = currentStatus === "approved" ? "pending" : "approved";
    try {
      setIsUpdating(true);
      await projectService.updateMilestone(projectId, milestoneId, { status: newStatus as any });
      setProject(prev => prev ? {
        ...prev,
        milestones: prev.milestones.map(m => m.id === milestoneId ? { ...m, status: newStatus as any } : m)
      } : null);
      toast.success("Milestone Updated");
    } catch (error) {
      toast.error("Update Failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!project || !projectId) return;
    try {
      setIsUpdating(true);
      await projectService.deleteMilestone(projectId, milestoneId);
      setProject(prev => prev ? {
        ...prev,
        milestones: prev.milestones.filter(m => m.id !== milestoneId)
      } : null);
      toast.success("Milestone Removed");
    } catch (error) {
      toast.error("Delete Failed");
    } finally {
      setIsUpdating(false);
    }
  };

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
      <Link to={`/dashboard/staff/project/${projectId}?role=${role}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary mb-6 transition-all group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Project Overview
      </Link>

      <div className="mb-10">
         <Badge variant="outline" className="text-muted-foreground border-border uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 mb-2">
            Operational Roadmap
         </Badge>
         <h1 className="text-3xl font-display font-bold text-foreground">Project Phase Tracking</h1>
         <p className="text-sm text-muted-foreground mt-1 font-medium">Real-time visualization of research milestones and validation status.</p>
      </div>

      <Card className="shadow-card border border-border bg-muted/20 mb-10 overflow-hidden">
        <CardContent className="p-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-1">
                 <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Overall Project Progress</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-display text-foreground">{progress}%</span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Completion</span>
                 </div>
              </div>
              
              <div className="flex items-center gap-10">
                 <div className="text-center">
                    <p className="text-xl text-foreground leading-none">{completed}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">VALIDATED</p>
                 </div>
                 <div className="text-center">
                    <p className="text-xl text-foreground leading-none">{project.milestones.length - completed}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">PENDING</p>
                 </div>
                 <div className="text-center">
                    <p className="text-xl text-foreground leading-none">{project.milestones.length}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">TOTAL</p>
                 </div>
              </div>
           </div>
        </CardContent>
      </Card>

      <div className="relative pl-4 space-y-4">
        {/* Vertical line connector */}
        <div className="absolute left-[0px] top-4 bottom-4 w-0.5 bg-border/20" />
        
        {project.milestones.map((m, idx) => (
          <div key={m.id} className="relative group">
            <Card className={cn(
              "shadow-sm border border-border/50 transition-all duration-300",
              m.status === "approved" ? "bg-success/[0.01]" : "bg-background hover:bg-muted/30"
            )}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border shrink-0",
                  m.status === "approved" ? "bg-success/10 text-success border-success/20" : "bg-muted/50 text-muted-foreground border-border/50"
                )}>
                  {m.status === "approved" ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                       <h3 className="font-bold text-foreground text-sm tracking-tight">{m.title}</h3>
                       <Badge variant="outline" className={cn(
                         "font-bold text-[8px] uppercase tracking-widest border-none h-4 px-1.5",
                         m.status === "approved" ? "bg-success/10 text-success" : 
                         m.status === "rejected" ? "bg-destructive/10 text-destructive" : 
                         "bg-warning/10 text-warning"
                       )}>
                         {m.status}
                       </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xl font-medium line-clamp-1">{m.description}</p>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-2">
                     <Calendar className="w-3.5 h-3.5" />
                     {new Date(m.dueDate).toLocaleDateString()}
                  </div>
                </div>

                {isStaffManager && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={isUpdating}
                      className="h-8 px-3 text-[10px] font-bold uppercase hover:bg-primary/5 hover:text-primary transition-colors"
                      onClick={() => toggleMilestoneStatus(m.id, m.status)}
                    >
                       {m.status === "approved" ? "Reopen" : "Approve"}
                    </Button>
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted transition-colors">
                             <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleDeleteMilestone(m.id)} className="text-destructive focus:text-destructive gap-2 font-bold text-xs uppercase cursor-pointer">
                             <Trash2 className="w-3.5 h-3.5" /> Delete
                          </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectStatusPage;
