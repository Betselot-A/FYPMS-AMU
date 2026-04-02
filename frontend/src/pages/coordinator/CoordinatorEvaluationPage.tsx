import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  ChevronDown, 
  ChevronRight, 
  Send, 
  Award, 
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

const CoordinatorEvaluationPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [phaseConfig, setPhaseConfig] = useState<EvaluationPhase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, Record<string, string>>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [projRes, critRes] = await Promise.all([
        projectService.getAll(),
        gradeService.getConfig()
      ]);
      
      setProjects(projRes.data.filter(p => !['completed', 'rejected'].includes(p.status)));
      
      const coordPhase = critRes.data.phases.find(p => p.name.includes('Coordinator'));
      setPhaseConfig(coordPhase || null);
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
          comments: comments[memberId] || ""
        });
      });

      await Promise.all(promises);
      toast.success(`Evaluations submitted for "${project.title}"`);
      setSelectedProject(null);
    } catch (error) {
      toast.error("Failed to submit evaluations.");
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
             <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Award className="w-5 h-5 text-primary-foreground" />
             </div>
             Coordinator Evaluation
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {phaseConfig 
              ? `Evaluate students based on "${phaseConfig.name}" (Max ${phaseConfig.criteria.reduce((s,c) => s+c.maxMark, 0)} marks)`
              : "No coordinator phase configured in Standards Setup."}
          </p>
        </div>
        
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-muted/30 border-none focus-visible:bg-background transition-all"
           />
        </div>
      </div>

      {!phaseConfig && (
        <Card className="border-warning/30 bg-warning/5">
           <CardContent className="p-6 flex items-center gap-4 text-warning">
              <AlertCircle className="w-6 h-6" />
              <p className="text-sm font-bold">
                 Warning: No "Coordinator Evaluation" phase active. Please configure it in Criteria Setup first.
              </p>
           </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredProjects.map((project) => {
          const isSelected = selectedProject === project.id;
          const members = project.groupMembers;

          return (
            <Card key={project.id} className={cn(
              "shadow-card border-none transition-all duration-300",
              isSelected && "ring-2 ring-primary/20"
            )}>
              <CardHeader
                className="pb-4 cursor-pointer hover:bg-muted/20 transition-all rounded-t-xl"
                onClick={() => setSelectedProject(isSelected ? null : project.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                      isSelected ? "bg-primary text-primary-foreground rotate-90" : "bg-muted text-muted-foreground"
                    )}>
                       <ChevronRight className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">{project.title}</CardTitle>
                      <CardDescription className="text-xs font-medium flex items-center gap-2 mt-1">
                         <User className="w-3.5 h-3.5" />
                         {members.length} Squad Members
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="h-7 px-3 font-bold uppercase tracking-widest text-[10px]">
                    {project.status}
                  </Badge>
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
                          "border border-border/50 rounded-2xl transition-all overflow-hidden",
                          isMemberExpanded ? "bg-muted/20" : "hover:bg-muted/10"
                        )}>
                          <div 
                            className="p-4 cursor-pointer flex items-center justify-between"
                            onClick={() => setExpandedMember(isMemberExpanded ? null : memberId)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center">
                                 <User className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <span className="font-bold text-foreground">{memberName}</span>
                            </div>
                            <div className="flex items-center gap-4">
                               <div className="px-3 py-1 bg-background rounded-full border border-border shadow-sm">
                                  <span className="text-xs font-black text-primary">{total}</span>
                                  <span className="text-[10px] font-bold text-muted-foreground ml-1">/ {maxTotal}</span>
                               </div>
                               <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-all", isMemberExpanded && "rotate-180")} />
                            </div>
                          </div>

                          {isMemberExpanded && phaseConfig && (
                            <div className="px-5 pb-5 space-y-5 animate-in fade-in duration-300">
                              <div className="grid grid-cols-1 gap-4">
                                {phaseConfig.criteria.map((c, i) => (
                                  <div key={(c as any)._id || c.id} className="flex flex-col md:flex-row md:items-center gap-3 justify-between p-3 bg-background rounded-xl border border-border/40">
                                    <div className="space-y-1 flex-1">
                                      <p className="text-sm font-bold text-foreground">
                                        {i + 1}. {c.label}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                        MAX CAPACITY: {c.maxMark} POINTS
                                      </p>
                                    </div>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={c.maxMark}
                                      placeholder="0"
                                      value={scores[memberId]?.[(c as any)._id || c.id] || ""}
                                      onChange={(e) => handleScoreChange(memberId, (c as any)._id || c.id, e.target.value, c.maxMark)}
                                      className="w-full md:w-24 h-10 text-center font-display font-black text-lg bg-muted/20 border-none"
                                    />
                                  </div>
                                ))}
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Performance Feedback</Label>
                                <Textarea
                                  placeholder="Provide qualitative feedback for this student..."
                                  value={comments[memberId] || ""}
                                  onChange={(e) => setComments((prev) => ({ ...prev, [memberId]: e.target.value }))}
                                  className="min-h-[80px] bg-background border-border/50 focus-visible:ring-primary/20 rounded-xl text-sm"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button 
                      onClick={() => handleSubmit(project.id)} 
                      disabled={!!isSubmitting || !phaseConfig}
                      className="gradient-primary text-primary-foreground h-11 px-8 shadow-lg shadow-primary/10 rounded-xl"
                    >
                      {isSubmitting === project.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Finalizing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Submit Evaluated Marks
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
              <Search className="w-12 h-12 mx-auto mb-4" />
              <p className="text-xl font-bold">No matching projects found</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default CoordinatorEvaluationPage;
