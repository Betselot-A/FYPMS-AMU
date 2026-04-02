import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Award, 
  Star, 
  FileCheck, 
  ChevronRight, 
  Users, 
  Calendar,
  Search,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import projectService, { Project } from "@/api/projectService";
import { cn } from "@/lib/utils";

const ExaminerEvaluatePage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await projectService.getAll({ examinerId: user.id });
      setProjects(res.data);
    } catch (error) {
      toast.error("Failed to load assigned projects.");
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
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] font-black tracking-widest px-2 py-0.5 mb-2">
             EXAMINER PORTAL
          </Badge>
          <h1 className="text-3xl font-display font-black text-foreground">Assigned Assessments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and evaluate project presentations assigned to you for this academic cycle.
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <input 
            type="text"
            placeholder="Filter projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 h-11 rounded-xl bg-muted/30 border-none focus:ring-1 focus:ring-primary/20 transition-all text-sm"
           />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <Card className="border-none bg-muted/20 shadow-none border-dashed border-2 border-border/50">
          <CardContent className="p-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-background border flex items-center justify-center mx-auto mb-6 shadow-sm">
               <Award className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-medium">No projects found in your assessment queue.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const members = project.groupMembers;

            return (
              <Card key={project.id} className="shadow-card border-none hover:ring-2 hover:ring-primary/20 transition-all duration-300 group overflow-hidden">
                <CardHeader className="pb-4 relative">
                   <div className="absolute top-0 right-0 p-4">
                      <Badge className="bg-primary/5 text-primary text-[10px] font-black border-none h-7">
                         {project.status.toUpperCase()}
                      </Badge>
                   </div>
                   <div className="space-y-1 pt-2">
                      <CardTitle className="text-xl font-black group-hover:text-primary transition-colors leading-tight pr-12">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                         <Users className="w-3.5 h-3.5" />
                         {members.length} Squad Members
                      </CardDescription>
                   </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {project.description || "No project description provided by the student group."}
                  </p>

                  <div className="flex flex-wrap gap-2">
                     {members.slice(0, 3).map((m, idx) => (
                        <div key={idx} className="h-7 px-3 rounded-full bg-muted/40 border border-border/50 flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                           <span className="text-[10px] font-bold text-foreground">
                              {typeof m === 'object' ? (m as any).name : 'Student'}
                           </span>
                        </div>
                     ))}
                     {members.length > 3 && (
                        <div className="h-7 px-2 rounded-full border border-dashed border-border/50 flex items-center">
                           <span className="text-[10px] font-bold text-muted-foreground">+{members.length - 3}</span>
                        </div>
                     )}
                  </div>

                  <div className="pt-6 border-t border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                       <Calendar className="w-4 h-4" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">
                          {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD'}
                       </span>
                    </div>
                    
                    <Link to={`/dashboard/staff/project/${project.id}/evaluate`}>
                       <Button className="h-10 px-6 rounded-xl gradient-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/10">
                          Evaluate Now
                          <ChevronRight className="w-4 h-4 ml-2" />
                       </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExaminerEvaluatePage;
