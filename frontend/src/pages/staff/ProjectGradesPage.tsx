import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Send, 
  User, 
  Target, 
  Award, 
  CheckCircle2, 
  Loader2,
  Calculator,
  ShieldCheck,
  Zap,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { projectService, evaluationService, gradeService } from "@/api";
import { Project } from "@/api/projectService";
import { EvaluationPhase, Criterion } from "@/api/gradeService";
import { cn } from "@/lib/utils";

const ProjectGradesPage = () => {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "examiner";
  
  const [project, setProject] = useState<Project | null>(null);
  const [phase, setPhase] = useState<EvaluationPhase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // scores[studentId][criterionId] = number
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      const [projRes, configRes] = await Promise.all([
        projectService.getById(projectId),
        gradeService.getConfig()
      ]);
      
      setProject(projRes.data);
      
      // Determine relevant phase based on role
      const searchName = role === 'advisor' ? 'Advisor' : 'Examiner';
      const targetPhase = configRes.data.phases.find(p => p.name.includes(searchName)) || configRes.data.phases[0];
      setPhase(targetPhase);
      
    } catch (error) {
      toast.error("Could not synchronize evaluation criteria.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleScoreChange = (studentId: string, criterionId: string, value: string, max: number) => {
    const num = parseInt(value) || 0;
    if (num > max) {
       toast.warning(`Maximum mark for this criterion is ${max}`);
       return;
    }
    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [criterionId]: num,
      },
    }));
  };

  const calculateStudentTotal = (studentId: string) => {
    if (!phase) return 0;
    const studentScores = scores[studentId] || {};
    return phase.criteria.reduce((sum, c) => sum + (studentScores[c.id] || 0), 0);
  };

  const handleSubmitAll = async () => {
    if (!project || !phase) return;
    
    setIsSubmitting(true);
    try {
      const submissionPromises = project.groupMembers.map(m => {
        const studentId = typeof m === 'object' ? (m as any).id : m;
        const studentScores = scores[studentId] || {};
        
        return evaluationService.submitEvaluation({
          projectId: project.id,
          studentId: studentId,
          phaseId: phase.id,
          marks: phase.criteria.map(c => ({
            criterionId: c.id,
            mark: studentScores[c.id] || 0
          })),
          comments: comments[studentId] || ""
        });
      });

      await Promise.all(submissionPromises);
      toast.success("Squad evaluation committed successfully.");
    } catch (error) {
       toast.error("Failed to commit final grades.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-40 w-full" />
        <div className="space-y-4">
           {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  if (!project || !phase) return <div className="p-20 text-center text-muted-foreground">Evaluation structure missing.</div>;

  const maxPhaseScore = phase.criteria.reduce((sum, c) => sum + c.maxMark, 0);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link to={`/dashboard/staff/project/${projectId}?role=${role}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary mb-6 transition-all group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        BACK TO PROJECT OVERVIEW
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
           <Badge variant="outline" className="text-primary border-primary/20 uppercase text-[10px] font-black tracking-widest px-2 py-0.5 mb-2">
              Formal Assessment Phase: {phase.name}
           </Badge>
           <h1 className="text-3xl font-display font-black text-foreground">Scorecard Entry</h1>
           <p className="text-sm text-muted-foreground mt-1">Submit technical evaluation marks for each student in the squad.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="text-right">
              <p className="text-2xl font-black text-foregroundLeading-none">/ {maxPhaseScore}</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">MAX PHASE POINTS</p>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        {project.groupMembers.map((m, idx) => {
          const studentId = typeof m === 'object' ? (m as any).id : m;
          const studentName = typeof m === 'object' ? (m as any).name : `CANDIDATE ${idx + 1}`;
          const isExpanded = expandedStudent === studentId;
          const total = calculateStudentTotal(studentId);

          return (
            <Card key={studentId} className={cn(
              "shadow-card border-none transition-all duration-300",
              isExpanded ? "ring-2 ring-primary/20" : "hover:bg-muted/30"
            )}>
              <CardHeader
                className="p-6 cursor-pointer flex flex-row items-center justify-between"
                onClick={() => setExpandedStudent(isExpanded ? null : studentId)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                     <User className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black text-foreground">{studentName}</CardTitle>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">CANDIDATE SCORECARD</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                   <div className="text-right">
                      <p className="text-2xl font-black text-primary leading-none">{total}</p>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">TOTAL MARK</p>
                   </div>
                   <ChevronRight className={cn("w-5 h-5 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="px-6 pb-8 pt-0 space-y-6 animate-in fade-in slide-in-from-top-2">
                  <div className="h-px bg-border/40 w-full mb-6" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {phase.criteria.map((c) => (
                      <div key={c.id} className="space-y-3">
                        <div className="flex justify-between items-center">
                           <Label className="text-xs font-bold text-foreground uppercase tracking-tight">{c.label}</Label>
                           <span className="text-[10px] font-black text-muted-foreground">MAX: {c.maxMark}</span>
                        </div>
                        <div className="relative">
                           <Input
                             type="number"
                             min={0}
                             max={c.maxMark}
                             placeholder="0"
                             value={scores[studentId]?.[c.id] ?? ""}
                             onChange={(e) => handleScoreChange(studentId, c.id, e.target.value, c.maxMark)}
                             className="h-12 border-none bg-muted/50 rounded-xl pl-12 font-bold text-lg focus-visible:ring-primary/20"
                           />
                           <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                     <Label className="text-xs font-bold text-foreground uppercase tracking-tight block mb-3">INTERNAL EVALUATOR COMMENTS</Label>
                     <textarea 
                        className="w-full min-h-[100px] border-none bg-muted/50 rounded-2xl p-4 text-sm font-medium resize-none focus:ring-1 focus:ring-primary/20 outline-none"
                        placeholder="Add critical observation regarding student performance..."
                        value={comments[studentId] || ""}
                        onChange={(e) => setComments(prev => ({ ...prev, [studentId]: e.target.value }))}
                     />
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-12">
        <Button 
          disabled={isSubmitting || project.groupMembers.length === 0}
          onClick={handleSubmitAll} 
          className="w-full h-16 rounded-2xl gradient-primary text-primary-foreground font-black text-lg uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
             <><Loader2 className="w-6 h-6 animate-spin" /> COMMITTING GRADES...</>
          ) : (
             <><Award className="w-6 h-6" /> COMMIT FINAL EVALUATION</>
          )}
        </Button>
        <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-tighter mt-4 flex items-center justify-center gap-2">
           <ShieldCheck className="w-3.5 h-3.5 text-success" /> 
           This action will finalize the phase marks and trigger graduation ledger updates.
        </p>
      </div>
    </div>
  );
};

export default ProjectGradesPage;
