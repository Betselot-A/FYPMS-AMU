import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Users, 
  FileText, 
  Calendar, 
  Target, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  LayoutDashboard,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import { projectService, fileService } from "@/api";
import { Project } from "@/api/projectService";
import { ProjectFile } from "@/api/fileService";
import { cn } from "@/lib/utils";

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
  
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      const [projRes, fileRes] = await Promise.all([
        projectService.getById(projectId),
        fileService.getProjectFiles(projectId)
      ]);
      setProject(projRes.data);
      setFiles(fileRes.data);
    } catch (error) {
      toast.error("Could not retrieve project dossier.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const completedMilestones = project.milestones.filter((m) => m.status === "approved").length;
  const progress = Math.round((completedMilestones / project.milestones.length) * 100) || 0;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <Link to={`/dashboard/staff/project/${projectId}?role=${role}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary mb-6 transition-all group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        BACK TO PROJECT OVERVIEW
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div>
           <Badge variant="outline" className="text-primary border-primary/20 uppercase text-[10px] font-black tracking-widest px-2 py-0.5 mb-2">
              Administrative Dossier
           </Badge>
           <h1 className="text-3xl font-display font-black text-foreground">{project.title}</h1>
           <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{project.description}</p>
        </div>
        <div className="flex gap-2">
           <Badge className={cn("px-3 py-1 font-black text-[10px] uppercase tracking-widest border-none h-8 flex items-center gap-1.5", statusColors[project.status])}>
              {project.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              {project.status}
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Card */}
        <Card className="lg:col-span-1 shadow-card border-none bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="pb-2">
             <div className="flex items-center gap-2 text-primary">
                <Target className="w-4 h-4" />
                <CardTitle className="text-sm font-black uppercase tracking-widest">Phase Progression</CardTitle>
             </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4 mb-6">
               <div className="flex items-end justify-between mb-2">
                  <span className="text-4xl font-black text-foreground">{progress}%</span>
                  <span className="text-[10px] font-black text-muted-foreground uppercase mb-1.5 tracking-tighter">Overall sync</span>
               </div>
               <Progress value={progress} className="h-2.5 bg-muted" />
            </div>
            <p className="text-[11px] text-muted-foreground font-medium leading-relaxed italic">
              {completedMilestones} of {project.milestones.length} milestones successfully validated by the lead advisor.
            </p>
          </CardContent>
        </Card>

        {/* Squad Members */}
        <Card className="lg:col-span-2 shadow-card border-none">
          <CardHeader className="pb-2">
             <div className="flex items-center gap-2 text-foreground">
                <Users className="w-4 h-4" />
                <CardTitle className="text-sm font-black uppercase tracking-widest">Student Squad members</CardTitle>
             </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
            {project.groupMembers.map((m, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center text-[10px] font-black text-primary shadow-sm">
                   {typeof m === 'object' ? (m as any).name.charAt(0) : 'S'}
                </div>
                <div>
                   <p className="text-sm font-bold text-foreground leading-tight">
                      {typeof m === 'object' ? (m as any).name : `Student Member ${idx + 1}`}
                   </p>
                   <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-tighter mt-0.5">
                      {typeof m === 'object' ? (m as any).department : 'CANDIDATE'}
                   </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Timeline Summary */}
        <Card className="lg:col-span-3 shadow-card border-none overflow-hidden">
           <div className="h-1 bg-primary/20 w-full" />
           <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm font-black uppercase tracking-widest">Artifact History</CardTitle>
                 </div>
                 <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-muted text-muted-foreground px-2">
                    Latest Activity
                 </Badge>
              </div>
           </CardHeader>
           <CardContent className="p-0 border-t border-border/40">
              <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                    <thead>
                       <tr className="bg-muted/30 text-muted-foreground font-black uppercase text-[10px] tracking-widest border-b border-border/50">
                          <th className="text-left py-4 px-6 italic">DOCUMENT TITLE</th>
                          <th className="text-center py-4 px-4">TYPE</th>
                          <th className="text-center py-4 px-4">UPLOAD DATE</th>
                          <th className="text-right py-4 px-6">STATUS</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                       {files.length === 0 ? (
                          <tr>
                             <td colSpan={4} className="py-12 text-center text-muted-foreground italic text-xs font-medium">
                                No formal artifacts have been committed to the project vault yet.
                             </td>
                          </tr>
                       ) : (
                          files.slice(0, 5).map((file) => (
                             <tr key={file.id} className="hover:bg-muted/10 transition-colors">
                                <td className="py-4 px-6">
                                   <div className="flex items-center gap-3">
                                      <FileText className="w-4 h-4 text-primary/60" />
                                      <span className="font-bold text-foreground truncate max-w-[200px]">{file.originalName}</span>
                                   </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                   <Badge variant="outline" className="text-[9px] font-bold uppercase border-muted h-6">
                                      {file.fileCategory || "DRAFT"}
                                   </Badge>
                                </td>
                                <td className="py-4 px-4 text-center">
                                   <span className="text-[10px] font-black text-muted-foreground uppercase">{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                   <div className="flex items-center justify-end gap-1.5 text-success">
                                      <Activity className="w-3.5 h-3.5" />
                                      <span className="text-[10px] font-black uppercase tracking-widest">VERIFIED</span>
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
