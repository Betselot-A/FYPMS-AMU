import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  ChevronDown, 
  ChevronRight, 
  Send, 
  UserCheck, 
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import projectService, { Project } from "@/api/projectService";
import { gradeService } from "@/api";
import { EvaluationPhase, Criterion } from "@/api/gradeService";
import evaluationService from "@/api/evaluationService";
import { cn } from "@/lib/utils";

const AdvisorMarkPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [phaseConfig, setPhaseConfig] = useState<EvaluationPhase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, Record<string, string>>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [projRes, critRes] = await Promise.all([
        projectService.getAll(),
        gradeService.getConfig()
      ]);
      
      // Filter for projects that have an advisor assigned
      setProjects(projRes.data.filter(p => p.advisorId && !['completed', 'rejected'].includes(p.status)));
      
      const advisorPhase = critRes.data.phases.find(p => p.name.includes('Advisor'));
      setPhaseConfig(advisorPhase || null);
    } catch (error) {
      toast.error("Failed to load evaluation data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMemberTotal = (memberId: string) => {
    const memberScores = scores[memberId] || {};
    return Object.values(memberScores).reduce((sum, v) => sum + (parseInt(v) || 0), 0);
  };

  const handleScoreChange = (memberId: string, criteriaId: string, value: string, max: number) => {
    const numValue = Math.min(max, Math.max(0, parseInt(value) || 0));
    setScores((prev) => ({
      ...prev,
      [memberId]: {
        ...(prev[memberId] || {}),
        [criteriaId]: numValue.toString(),
      },
    }));
  };

  const handleSubmit = async (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project || !phaseConfig) return;

    try {
      setIsSubmitting(projectId);
      
      // Submit evaluations for each member
      const promises = project.groupMembers.map(async (m) => {
        const memberId = typeof m === 'string' ? m : m.id;
        const memberScores = scores[memberId] || {};
        
        const marks = phaseConfig.criteria.map(c => ({
          criterionId: (c as any)._id || c.id,
          mark: parseInt(memberScores[(c as any)._id || c.id]) || 0
        }));

        return evaluationService.submitEvaluation({
          projectId,
          studentId: memberId,
          phaseId: phaseConfig.id,
          marks,
          comments: `Entered by Coordinator on behalf of Advisor`
        });
      });

      await Promise.all(promises);
      toast.success(`Advisor marks submitted for "${project.title}"`);
      setSelectedProject(null);
    } catch (error) {
      toast.error("Failed to submit advisor marks.");
    } finally {
      setIsSubmitting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
                <UserCheck className="w-5 h-5 text-primary" />
             </div>
             Advisor Mark Entry
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Coordinator Portal: Entry of advisor evaluation marks on behalf of project advisors.
          </p>
        </div>
        
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-full bg-muted/30 border-none focus-visible:bg-background transition-all shadow-sm"
           />
        </div>
      </div>

      {!phaseConfig && (
        <Card className="border-warning/30 bg-warning/5 mb-6">
           <CardContent className="p-6 flex items-center gap-4 text-warning">
              <AlertCircle className="w-6 h-6" />
              <p className="text-sm font-bold">
                 Warning: No "Advisor Evaluation" phase active. Please configure it in Criteria Setup first.
              </p>
           </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredProjects.map((project) => {
          const isSelected = selectedProject === project.id;
          const members = project.groupMembers;
          const advisorName = typeof project.advisorId === 'object' ? (project.advisorId as any).name : 'Assigned Advisor';

          return (
            <Card key={project.id} className={cn(
              "shadow-card border-none transition-all duration-300",
              isSelected && "ring-2 ring-primary/20"
            )}>
              <CardHeader
                className="pb-4 cursor-pointer hover:bg-muted/10 transition-all rounded-t-xl overflow-hidden"
                onClick={() => setSelectedProject(isSelected ? null : project.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                       {isSelected ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">{project.title}</CardTitle>
                      <CardDescription className="text-xs font-medium flex items-center gap-2 mt-0.5">
                         <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[9px] font-black uppercase tracking-tighter">
                            ADVISOR
                         </Badge>
                         {advisorName}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <Badge variant="outline" className="h-6 px-3 font-bold uppercase tracking-widest text-[9px]">
                       {project.status}
                     </Badge>
                     <span className="text-[10px] text-muted-foreground mr-1">{members.length} Squad Members</span>
                  </div>
                </div>
              </CardHeader>

              {isSelected && (
                <CardContent className="space-y-4 pt-2 px-6 pb-6 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 gap-3">
                    {members.map((m) => {
                      const memberId = typeof m === 'string' ? m : m.id;
                      const memberName = typeof m === 'string' ? 'Loading...' : m.name;
                      const isMemberExpanded = expandedMember === memberId;
                      const total = getMemberTotal(memberId);
                      const maxTotal = phaseConfig?.criteria.reduce((s,c) => s+c.maxMark, 0) || 0;

                      return (
                        <div key={memberId} className={cn(
                          "border border-border/50 rounded-2xl transition-all overflow-hidden bg-background/50",
                          isMemberExpanded ? "ring-1 ring-primary/30 shadow-sm" : "hover:border-primary/20"
                        )}>
                          <div 
                            className="p-4 cursor-pointer flex items-center justify-between"
                            onClick={() => setExpandedMember(isMemberExpanded ? null : memberId)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center shadow-inner">
                                 <User className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div>
                                 <span className="font-bold text-foreground block leading-tight">{memberName}</span>
                                 <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Student Member</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <div className="px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                                  <span className="text-sm font-black text-primary">{total}</span>
                                  <span className="text-[10px] font-bold text-muted-foreground/60 ml-1.5">/ {maxTotal}</span>
                               </div>
                               <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-all", isMemberExpanded && "rotate-180")} />
                            </div>
                          </div>

                          {isMemberExpanded && phaseConfig && (
                            <div className="px-5 pb-6 space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                              <div className="p-3 bg-muted/30 rounded-xl border border-border/50 text-[10px] text-muted-foreground font-medium flex items-start gap-2">
                                 <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                 Please enter marks provided by the project advisor. All changes are logged for academic transparency.
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                {phaseConfig.criteria.map((c, i) => (
                                  <div key={(c as any)._id || c.id} className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between p-4 bg-background rounded-xl border border-border/40 shadow-sm transition-all hover:border-primary/20">
                                    <div className="space-y-1 flex-1">
                                      <p className="text-sm font-bold text-foreground">
                                        {i + 1}. {c.label}
                                      </p>
                                      <div className="flex items-center gap-2">
                                         <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                                            <div 
                                              className="h-full bg-primary/40 rounded-full" 
                                              style={{ width: `${(parseInt(scores[memberId]?.[(c as any)._id || c.id] || '0') / c.maxMark) * 100}%` }}
                                            />
                                         </div>
                                         <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">
                                           Max: {c.maxMark} PTS
                                         </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <Input
                                         type="number"
                                         min={0}
                                         max={c.maxMark}
                                         placeholder="0"
                                         value={scores[memberId]?.[(c as any)._id || c.id] || ""}
                                         onChange={(e) => handleScoreChange(memberId, (c as any)._id || c.id, e.target.value, c.maxMark)}
                                         className="w-full sm:w-24 h-10 text-center font-display font-black text-xl bg-muted/20 border-none focus-visible:ring-primary/20"
                                       />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-4 gap-3 border-t border-border/40 mt-6">
                    <Button 
                      variant="ghost"
                      onClick={() => setSelectedProject(null)}
                      className="px-6 rounded-xl font-bold text-xs uppercase tracking-widest"
                    >
                       Cancel
                    </Button>
                    <Button 
                      onClick={() => handleSubmit(project.id)} 
                      disabled={!!isSubmitting || !phaseConfig}
                      className="gradient-primary text-primary-foreground h-11 px-10 shadow-lg shadow-primary/20 rounded-xl font-bold uppercase tracking-widest text-xs"
                    >
                      {isSubmitting === project.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Finalize Marks
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
        
        {filteredProjects.length === 0 && searchQuery && (
           <div className="py-20 text-center opacity-40">
              <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin-slow" />
              <p className="text-xl font-bold">Identifying relevant projects...</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdvisorMarkPage;
