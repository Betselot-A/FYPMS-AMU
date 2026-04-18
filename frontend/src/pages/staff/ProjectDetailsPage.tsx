import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Users, 
  FileText, 
  Calendar as CalendarIcon, 
  Target, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  LayoutDashboard,
  Activity,
  Plus,
  Trash2,
  MoreVertical,
  Flag,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { projectService, fileService } from "@/api";
import submissionService from "@/api/submissionService";
import { Project, Milestone } from "@/api/projectService";
import { ProjectFile } from "@/api/fileService";
import { Submission } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors: Record<string, string> = {
  "pending": "bg-warning/10 text-warning border-warning/20",
  "in-progress": "bg-info/10 text-info border-info/20",
  "under-review": "bg-primary/10 text-primary border-primary/20",
  "completed": "bg-success/10 text-success border-success/20",
};

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "examiner";
  
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // New Milestone State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    dueDate: new Date(),
    description: ""
  });

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      const [projRes, subRes] = await Promise.all([
        projectService.getById(projectId),
        submissionService.getByProject(projectId)
      ]);
      setProject(projRes.data);
      setSubmissions(subRes.data);
    } catch (error) {
      toast.error("Could not retrieve project dossier.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (newStatus: string) => {
    if (!project || !projectId) return;
    try {
      setIsUpdating(true);
      await projectService.update(projectId, { status: newStatus as any });
      setProject(prev => prev ? { ...prev, status: newStatus as any } : null);
      toast.success("Status Updated", { description: `Project is now ${newStatus}.` });
    } catch (error) {
      toast.error("Update Failed", { description: "Could not change project status." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!project || !projectId || !newMilestone.title) return;
    try {
      setIsUpdating(true);
      const res = await projectService.addMilestone(projectId, {
        title: newMilestone.title,
        dueDate: newMilestone.dueDate.toISOString(),
        description: newMilestone.description
      });
      setProject(prev => prev ? { 
        ...prev, 
        milestones: [...(prev.milestones || []), res.data] 
      } : null);
      setIsAddDialogOpen(false);
      setNewMilestone({ title: "", dueDate: new Date(), description: "" });
      toast.success("Milestone Created", { description: "Added to project timeline." });
    } catch (error) {
      toast.error("Creation Failed", { description: "Could not add milestone." });
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleMilestoneStatus = async (milestoneId: string, currentStatus: string) => {
    if (!project || !projectId) return;
    const newStatus = currentStatus === "approved" ? "pending" : "approved";
    try {
      await projectService.updateMilestone(projectId, milestoneId, { status: newStatus as any });
      setProject(prev => prev ? {
        ...prev,
        milestones: prev.milestones.map(m => m.id === milestoneId ? { ...m, status: newStatus as any } : m)
      } : null);
      toast.success("Milestone Updated");
    } catch (error) {
      toast.error("Update Failed");
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!project || !projectId) return;
    try {
      await projectService.deleteMilestone(projectId, milestoneId);
      setProject(prev => prev ? {
        ...prev,
        milestones: prev.milestones.filter(m => m.id !== milestoneId)
      } : null);
      toast.success("Milestone Removed");
    } catch (error) {
      toast.error("Delete Failed");
    }
  };

  const isStaffManager = user?.role === "coordinator" || user?.role === "admin" || (typeof project?.advisorId === 'object' ? project?.advisorId?.id === user?.id : project?.advisorId === user?.id);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Skeleton className="h-32 w-full" />
           <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!project) return <div className="p-20 text-center text-muted-foreground">Project records missing.</div>;


  return (
    <div className="max-w-5xl mx-auto pb-20">
      <Link to={`/dashboard/staff/project/${projectId}?role=${role}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary mb-6 transition-all group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Project Overview
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div>
           <Badge variant="outline" className="text-muted-foreground border-border uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 mb-2">
              Administrative Dossier
           </Badge>
           <h1 className="text-3xl font-display font-bold text-foreground">{project.title}</h1>
           <p className="text-sm text-muted-foreground mt-1 max-w-2xl font-medium">{project.description}</p>
        </div>
        <div className="flex items-center gap-3">
           {isStaffManager ? (
             <Select 
               defaultValue={project.status} 
               onValueChange={handleStatusChange}
               disabled={isUpdating}
             >
               <SelectTrigger className={cn("w-[160px] h-9 font-bold text-[10px] uppercase tracking-wider border-none shadow-sm", statusColors[project.status])}>
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="pending">Pending</SelectItem>
                 <SelectItem value="in-progress">In-Progress</SelectItem>
                 <SelectItem value="under-review">Under-Review</SelectItem>
                 <SelectItem value="completed">Completed</SelectItem>
               </SelectContent>
             </Select>
           ) : (
             <Badge className={cn("px-3 py-1 font-bold text-[10px] uppercase tracking-wider border-none h-8 flex items-center gap-1.5", statusColors[project.status])}>
                {project.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {project.status}
             </Badge>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Squad Members */}
        <Card className="lg:col-span-3 shadow-card border-none">
          <CardHeader className="pb-2">
             <div className="flex items-center gap-2 text-foreground">
                <Users className="w-4 h-4" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Student Squad members</CardTitle>
             </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
            {project.groupMembers.map((m, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center text-[10px] font-bold text-primary shadow-sm">
                   {typeof m === 'object' ? (m as any).name.charAt(0) : 'S'}
                </div>
                <div>
                   <p className="text-sm font-bold text-foreground leading-tight">
                      {typeof m === 'object' ? (m as any).name : `Student Member ${idx + 1}`}
                   </p>
                   <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                      {typeof m === 'object' ? (m as any).department : 'CANDIDATE'}
                   </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-card border-none">
          <CardHeader className="pb-4 border-b border-border/40">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground">
                   <Target className="w-4 h-4 text-primary" />
                   <CardTitle className="text-sm font-bold uppercase tracking-wider">Project Timeline</CardTitle>
                </div>
                {isStaffManager && (
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase gap-1.5 hover:bg-primary/5 hover:text-primary transition-all">
                        <Plus className="w-3.5 h-3.5" /> Add Milestone
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add Project Milestone</DialogTitle>
                        <DialogDescription>Create a key checkpoint for this student group.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="title" className="text-xs font-bold uppercase text-muted-foreground">Checkpoint Title</Label>
                          <Input id="title" value={newMilestone.title} onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Chapter 1 First Draft" />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-xs font-bold uppercase text-muted-foreground">Target Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newMilestone.dueDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newMilestone.dueDate ? format(newMilestone.dueDate, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={newMilestone.dueDate} onSelect={(date) => date && setNewMilestone(prev => ({ ...prev, dueDate: date }))} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="desc" className="text-xs font-bold uppercase text-muted-foreground">Description (Optional)</Label>
                          <Input id="desc" value={newMilestone.description} onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))} placeholder="Key deliverables expected..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" onClick={handleAddMilestone} disabled={!newMilestone.title || isUpdating} className="gradient-primary">
                          {isUpdating ? "Saving..." : "Create Milestone"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
             </div>
          </CardHeader>
          <CardContent className="pt-6">
             {(!project.milestones || project.milestones.length === 0) ? (
               <div className="py-10 text-center border-2 border-dashed border-border/30 rounded-2xl bg-muted/5">
                 <Flag className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                 <p className="text-sm font-semibold text-foreground">No milestones defined</p>
                 <p className="text-[11px] text-muted-foreground mt-1 max-w-xs mx-auto">Build the project timeline by adding key checkpoints and deadlines.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {project.milestones.map((milestone, idx) => (
                   <div key={milestone.id} className="group relative flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-background hover:bg-muted/5 transition-all">
                      <div className={cn(
                        "mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                        milestone.status === "approved" ? "bg-success/10 text-success border-success/20 shadow-sm" : "bg-muted/50 text-muted-foreground border-border/50"
                      )}>
                        {milestone.status === "approved" ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-foreground text-sm truncate">{milestone.title}</h4>
                            <Badge variant="outline" className={cn("text-[9px] font-bold uppercase px-1.5 py-0 h-4", milestone.status === "approved" ? "bg-success/5 text-success border-success/20" : "bg-warning/5 text-warning border-warning/20")}>
                               {milestone.status}
                            </Badge>
                         </div>
                         <p className="text-xs text-muted-foreground line-clamp-1">{milestone.description || "Project checkpoint"}</p>
                         <div className="flex items-center gap-3 mt-3">
                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
                               <CalendarIcon className="w-3.5 h-3.5" />
                               {new Date(milestone.dueDate).toLocaleDateString()}
                            </span>
                         </div>
                      </div>

                      {isStaffManager && (
                        <div className="flex items-center gap-2">
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="h-8 px-3 text-[10px] font-bold uppercase hover:bg-primary/5 hover:text-primary"
                             onClick={() => toggleMilestoneStatus(milestone.id, milestone.status)}
                           >
                              {milestone.status === "approved" ? "Reopen" : "Approve"}
                           </Button>
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                 </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                 <DropdownMenuItem onClick={() => handleDeleteMilestone(milestone.id)} className="text-destructive focus:text-destructive gap-2 font-bold text-xs uppercase">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                 </DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </div>
                      )}
                   </div>
                 ))}
               </div>
             )}
          </CardContent>
        </Card>

        {/* Artifact History */}
        <Card className="lg:col-span-3 shadow-card border-none overflow-hidden">
           <div className="h-1 bg-primary/20 w-full" />
           <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">Artifact History</CardTitle>
                 </div>
                 <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2">
                    Latest Activity
                 </Badge>
              </div>
           </CardHeader>
           <CardContent className="p-0 border-t border-border/40">
              <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                    <thead>
                       <tr className="bg-muted/30 text-muted-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border/50">
                          <th className="text-left py-4 px-6 italic">DOCUMENT TITLE</th>
                          <th className="text-center py-4 px-4">TYPE</th>
                          <th className="text-center py-4 px-4">UPLOAD DATE</th>
                          <th className="text-right py-4 px-6">STATUS</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                       {submissions.length === 0 ? (
                          <tr>
                             <td colSpan={4} className="py-12 text-center text-muted-foreground italic text-xs font-medium">
                                No formal artifacts have been committed to the project vault yet.
                             </td>
                          </tr>
                       ) : (
                          submissions.slice(0, 5).map((sub) => (
                             <tr key={sub.id} className="hover:bg-muted/10 transition-colors">
                                <td className="py-4 px-6">
                                   <div className="flex items-center gap-3">
                                      <FileText className="w-4 h-4 text-primary/60" />
                                      <span className="font-bold text-foreground truncate max-w-[200px]">{sub.title}</span>
                                   </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                   <Badge variant="outline" className="text-[9px] font-bold uppercase border-muted h-6">
                                      SUBMISSION
                                   </Badge>
                                </td>
                                <td className="py-4 px-4 text-center">
                                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{new Date(sub.submissionDate).toLocaleDateString()}</span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                   <div className="flex items-center justify-end gap-1.5 ">
                                      <Activity className="w-3.5 h-3.5 text-muted-foreground/60" />
                                      <span className={cn("text-[10px] font-bold uppercase tracking-wider", sub.status === 'graded' ? 'text-success' : sub.status === 'reviewed' ? 'text-info' : 'text-warning')}>
                                        {sub.status}
                                      </span>
                                   </div>
                                </td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
