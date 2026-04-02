import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Send, 
  User, 
  ChevronDown, 
  ChevronRight, 
  Award, 
  Star, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  LayoutDashboard
} from "lucide-react";
import { toast } from "sonner";
import projectService, { Project } from "@/api/projectService";
import { gradeService } from "@/api";
import { EvaluationPhase, GradeConfig } from "@/api/gradeService";
import evaluationService from "@/api/evaluationService";
import { cn } from "@/lib/utils";

const ProjectEvaluatePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [phaseConfig, setPhaseConfig] = useState<EvaluationPhase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [scores, setScores] = useState<Record<string, Record<string, string>>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!projectId || !user) return;
    try {
      setIsLoading(true);
      const [projRes, confRes] = await Promise.all([
        projectService.getById(projectId),
        gradeService.getConfig()
      ]);

      const fetchedProject = projRes.data;
      setProject(fetchedProject);

      // Identify Phase: Is the user the Advisor or the Examiner?
      const advisorId = typeof fetchedProject.advisorId === 'object' ? (fetchedProject.advisorId as any).id : fetchedProject.advisorId;
      const examinerId = typeof fetchedProject.examinerId === 'object' ? (fetchedProject.examinerId as any).id : fetchedProject.examinerId;

      let searchName = "";
      if (user.id === advisorId) searchName = "Advisor";
      else if (user.id === examinerId) searchName = "Examiner";
      
      if (searchName) {
        const phase = confRes.data.phases.find(p => p.name.includes(searchName));
        setPhaseConfig(phase || null);
      }

    } catch (error) {
      toast.error("Failed to load project evaluation data.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const members = useMemo(() => {
    if (!project) return [];
    return project.groupMembers;
  }, [project]);

  const maxTotal = useMemo(() => {
    if (!phaseConfig) return 0;
    return phaseConfig.criteria.reduce((sum, c) => sum + c.maxMark, 0);
  }, [phaseConfig]);

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

  const handleSubmit = async () => {
    if (!project || !phaseConfig) return;

    try {
      setIsSubmitting(true);
      
      const promises = members.map(async (m) => {
        const memberId = typeof m === 'string' ? m : m.id;
        const memberScores = scores[memberId] || {};
        
        const marks = phaseConfig.criteria.map(c => ({
          criterionId: (c as any)._id || c.id,
          mark: parseInt(memberScores[(c as any)._id || c.id]) || 0
        }));

        return evaluationService.submitEvaluation({
          projectId: project.id,
          studentId: memberId,
          phaseId: phaseConfig.id,
          marks,
          comments: comments[memberId] || ""
        });
      });

      await Promise.all(promises);
      toast.success(`Evaluations submitted for "${project.title}"`);
      navigate(`/dashboard/staff/project/${project.id}`);
    } catch (error) {
      toast.error("Failed to submit evaluations.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!project) return <div className="p-20 text-center text-muted-foreground">Project not found.</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link
        to={`/dashboard/staff/project/${projectId}`}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary mb-6 transition-all group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
        BACK TO PROJECT CONTEXT
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] font-black tracking-[0.2em] px-2 py-0.5">
             EVALUATION PORTAL
          </Badge>
          <h1 className="text-3xl font-display font-black text-foreground leading-tight">
            Perform Academic Assessment
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
             Project: <span className="text-foreground">{project.title}</span>
          </p>
        </div>
        
        {phaseConfig && (
           <div className="px-4 py-3 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3">
              <Star className="w-5 h-5 text-primary" />
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">ACTIVE PHASE</p>
                 <p className="text-sm font-bold text-foreground">{phaseConfig.name}</p>
              </div>
           </div>
        )}
      </div>

      {!phaseConfig && (
        <Card className="border-warning/30 bg-warning/5 mb-8">
           <CardContent className="p-6 flex items-center gap-4 text-warning">
              <AlertCircle className="w-6 h-6" />
              <p className="text-sm font-bold">
                 Role Mismatch: You are not assigned as the Advisor or Examiner for this project. 
                 Please contact the coordinator if this is an error.
              </p>
           </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {members.map((m) => {
          const memberId = typeof m === 'string' ? m : m.id;
          const memberName = typeof m === 'string' ? 'Loading...' : m.name;
          const isExpanded = expandedMember === memberId;
          const total = getMemberTotal(memberId);

          return (
            <Card key={memberId} className={cn(
              "shadow-card border-none transition-all duration-300",
              isExpanded && "ring-2 ring-primary/20"
            )}>
              <CardHeader
                className="pb-4 cursor-pointer hover:bg-muted/10 transition-all rounded-t-2xl"
                onClick={() => setExpandedMember(isExpanded ? null : memberId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      isExpanded ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                       {isExpanded ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black">{memberName}</CardTitle>
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Student Member</CardDescription>
                    </div>
                  </div>
                  <div className="px-4 py-1.5 bg-background border rounded-full shadow-sm">
                    <span className="text-sm font-black text-primary">{total}</span>
                    <span className="text-[10px] font-bold text-muted-foreground ml-1.5">/ {maxTotal}</span>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && phaseConfig && (
                <CardContent className="space-y-6 pt-2 px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 gap-3">
                    {phaseConfig.criteria.map((c, i) => (
                      <div key={(c as any)._id || c.id} className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between p-4 bg-muted/20 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-foreground">
                            {i + 1}. {c.label}
                          </p>
                          <div className="flex items-center gap-2">
                             <div className="w-20 h-1 rounded-full bg-muted overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${(parseInt(scores[memberId]?.[(c as any)._id || c.id] || '0') / c.maxMark) * 100}%` }} 
                                />
                             </div>
                             <p className="text-[9px] font-black text-muted-foreground tracking-tighter uppercase">MAX {c.maxMark} POINTS</p>
                          </div>
                        </div>
                        <Input
                          type="number"
                          min={0}
                          max={c.maxMark}
                          placeholder="0"
                          value={scores[memberId]?.[(c as any)._id || c.id] || ""}
                          onChange={(e) => handleScoreChange(memberId, (c as any)._id || c.id, e.target.value, c.maxMark)}
                          className="w-full sm:w-24 h-11 text-center font-display font-black text-xl bg-background border-none shadow-sm focus-visible:ring-primary/20"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Internal Remarks</Label>
                    <Textarea
                      placeholder="Enter qualitative performance feedback..."
                      value={comments[memberId] || ""}
                      onChange={(e) => setComments((prev) => ({ ...prev, [memberId]: e.target.value }))}
                      className="min-h-[100px] bg-background border-border/40 focus-visible:ring-primary/20 rounded-2xl resize-none"
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-border/50">
         <div className="text-xs text-muted-foreground font-medium text-center sm:text-left">
            All submitted marks are final and will be used for graduation grading.
         </div>
         <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !phaseConfig || members.length === 0}
          className="w-full sm:w-auto h-12 px-12 gradient-primary text-primary-foreground shadow-xl shadow-primary/20 rounded-2xl font-black uppercase tracking-widest text-xs"
         >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing Ledger...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit Final Assessment
              </>
            )}
         </Button>
      </div>
    </div>
  );
};

export default ProjectEvaluatePage;
