import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FolderOpen, 
  Users, 
  ChevronRight, 
  Clock, 
  Search,
  LayoutDashboard,
  ShieldCheck,
  ArrowUpRight
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

const AdvisorProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await projectService.getAll({ advisorId: user.id });
      setProjects(res.data);
    } catch (error) {
      toast.error("Failed to synchronize assigned projects.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Skeleton className="h-64 w-full" />
           <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] font-black tracking-widest px-2 py-0.5 mb-2">
             ADVISOR PORTFOLIO
          </Badge>
          <h1 className="text-4xl font-display font-black text-foreground">Assigned Squads</h1>
          <p className="text-sm text-muted-foreground mt-1">
             Manage and mentor research groups assigned under your supervision.
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <input 
            type="text"
            placeholder="Search your squads..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 h-11 rounded-xl bg-muted/30 border-none focus:ring-1 focus:ring-primary/20 transition-all text-sm font-medium"
           />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <Card className="border-none bg-muted/20 shadow-none border-dashed border-2 border-border/50">
          <CardContent className="p-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-background border flex items-center justify-center mx-auto mb-6 shadow-sm">
               <FolderOpen className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No Squads Assigned</h3>
            <p className="text-muted-foreground font-medium text-sm mt-1 max-w-xs mx-auto">
               You are not currently supervising any research projects for this cycle.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const members = project.groupMembers;

            return (
              <Link key={project.id} to={`/dashboard/staff/project/${project.id}`}>
                <Card className="shadow-card border-none hover:ring-2 hover:ring-primary/20 transition-all duration-300 group overflow-hidden h-full flex flex-col">
                  <CardHeader className="pb-4 relative">
                    <div className="absolute top-0 right-0 p-4">
                        <Badge className={cn("text-[9px] font-black border-none h-6 px-2 uppercase tracking-widest", statusColors[project.status])}>
                           {project.status}
                        </Badge>
                    </div>
                    <div className="space-y-1 pt-2">
                        <CardTitle className="text-xl font-black group-hover:text-primary transition-colors leading-tight pr-12">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                           <ShieldCheck className="w-3.5 h-3.5" />
                           Lead Advisor Access
                        </CardDescription>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 space-y-6 flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {project.description || "No project description provided by the research group."}
                    </p>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> GROUP MEMBERS</span>
                          <span>{members.length} Total</span>
                       </div>
                       
                       <div className="flex flex-wrap gap-2">
                          {members.slice(0, 3).map((m, idx) => (
                             <div key={idx} className="h-8 px-3 rounded-xl bg-muted/40 border border-border/50 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary/40 shadow-sm" />
                                <span className="text-[10px] font-bold text-foreground">
                                   {typeof m === 'object' ? (m as any).name : 'Researcher'}
                                </span>
                             </div>
                          ))}
                          {members.length > 3 && (
                             <div className="h-8 px-2.5 rounded-xl border border-dashed border-border/50 flex items-center justify-center">
                                <span className="text-[10px] font-black text-muted-foreground">+{members.length - 3}</span>
                             </div>
                          )}
                       </div>
                    </div>

                    <div className="pt-6 border-t border-border/40 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-muted-foreground">
                         <Clock className="w-4 h-4" />
                         <span className="text-[10px] font-black uppercase tracking-widest">
                            {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'NO DEADLINE'}
                         </span>
                      </div>
                      
                      <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                         <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdvisorProjectsPage;
