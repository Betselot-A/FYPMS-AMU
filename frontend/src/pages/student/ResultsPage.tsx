import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Award, 
  FileText, 
  CheckCircle2, 
  BarChart3, 
  MessageSquare, 
  Star,
  Trophy,
  ArrowRight,
  TrendingUp,
  Lock,
  Clock,
  ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import projectService, { Project } from "@/api/projectService";
import { gradeService } from "@/api";
import { GradeConfig } from "@/api/gradeService";
import evaluationService, { EvaluationResult } from "@/api/evaluationService";
import { cn } from "@/lib/utils";

const ResultsPage = () => {
  const { user } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [config, setConfig] = useState<GradeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const projRes = await projectService.getAll();
      const myProject = projRes.data.find(p => p.groupMembers.some(m => (typeof m === 'string' ? m : m.id) === user.id));
      
      if (myProject) {
        setProject(myProject);
        
        const [evalRes, confRes] = await Promise.all([
           evaluationService.getEvaluationsByProject(myProject.id),
           gradeService.getConfig()
        ]);
        
        setEvaluations(evalRes.data);
        setConfig(confRes.data);
      }
    } catch (error) {
      toast.error("Results could not be synchronized.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Logic: Calculate weighted score for the logged-in student
  const transcriptData = useMemo(() => {
    if (!project || !user || evaluations.length === 0 || !config) return null;

    const studentEvals = evaluations.filter(e => {
       const sid = typeof e.studentId === 'string' ? e.studentId : e.studentId.id;
       return sid === user.id;
    });

    let totalWeightedScore = 0;
    const phaseBreakdown = config.phases.map(phase => {
       const evalForPhase = studentEvals.find(e => 
          (typeof e.phaseId === 'string' ? e.phaseId : (e.phaseId as any).id) === phase.id || e.phaseId === phase.id
       );
       
       const maxMark = phase.criteria.reduce((s, c) => s + c.maxMark, 0);
       const earnedMark = evalForPhase ? evalForPhase.marks.reduce((s, m) => s + m.mark, 0) : 0;
       const percentage = maxMark > 0 ? (earnedMark / maxMark) * 100 : 0;
       const weightedContribution = (percentage * phase.weight) / 100;
       
       totalWeightedScore += weightedContribution;
 
       return {
          ...phase,
          earnedMark,
          maxMark,
          percentage,
          weightedContribution,
          status: evalForPhase ? "Evaluated" : "Pending"
       };
    });

    // Find grade band
    const gradeBand = (config.bands || [])
      .sort((a, b) => b.minScore - a.minScore)
      .find(b => totalWeightedScore >= b.minScore);

    return {
       totalWeightedScore,
       grade: gradeBand?.label || "N/A",
       gradeColor: gradeBand?.color || "bg-primary/10 text-primary border-primary/20",
       phaseBreakdown,
       allFeedback: studentEvals.map(e => ({
          phase: config.phases.find(p => p.id === e.phaseId)?.name || "Evaluation",
          message: e.comments
       })).filter(f => f.message)
    };
  }, [project, user, evaluations, config]);

  const resultsReleased = project?.resultsReleased || false;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!project) {
     return (
        <div className="max-w-2xl mx-auto py-20 text-center">
           <BarChart3 className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
           <h2 className="text-xl font-bold text-foreground">No Academic Record Found</h2>
           <p className="text-muted-foreground mt-2">You must be assigned to an active project group to view final grading results.</p>
        </div>
     );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 pt-10 px-4 md:px-0">
      <div className="mb-10 text-center md:text-left space-y-1">
        <Badge variant="outline" className="text-muted-foreground border-border uppercase text-[10px] font-bold tracking-wider px-3 py-1 mb-2">
           Academic Performance Hub
        </Badge>
        <h1 className="text-4xl font-display font-bold text-foreground">Graduation Ledger</h1>
        <p className="text-sm text-muted-foreground">Institutional records for: <span className="text-foreground font-semibold">{project.title}</span></p>
      </div>

      {!resultsReleased ? (
        <Card className="border-none shadow-premium bg-muted/10 overflow-hidden relative group p-10 md:p-20 text-center border-2 border-dashed border-border/50 rounded-[2rem]">
           <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12">
              <Clock className="w-48 h-48" />
           </div>
           <CardContent className="space-y-8 relative z-10 p-0">
              <div className="w-20 h-20 rounded-3xl bg-warning/20 flex items-center justify-center mx-auto shadow-lg border border-warning/30">
                 <Lock className="w-10 h-10 text-warning animate-pulse" />
              </div>
               <div className="space-y-4 max-w-md mx-auto">
                  <h2 className="text-2xl font-display font-bold">Final Results Pending</h2>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                     Evaluations are currently undergoing final administrative review by the department coordinator. You will be notified once the official ledger is published.
                  </p>
               </div>
              <div className="pt-4">
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-border text-muted-foreground px-6 py-2 rounded-full uppercase tracking-wider font-bold text-[10px]">
                     Status: Quality Assurance Phase
                  </Badge>
              </div>
           </CardContent>
        </Card>
      ) : transcriptData ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Transcript Hero Card */}
          <Card className={cn(
             "border-none shadow-2xl shadow-primary/10 bg-gradient-to-br overflow-hidden text-primary-foreground relative group rounded-[2rem]",
             transcriptData.gradeColor.includes('destructive') ? "from-destructive to-destructive/80" : "from-primary to-primary/80"
          )}>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-1000">
               <Trophy className="w-64 h-64" />
            </div>
            
            <CardContent className="p-10 md:p-16 relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="space-y-6 text-center md:text-left flex-1">
                     <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Summative Academic Grade</p>
                        <h2 className="font-serif text-[72px] font-normal leading-[72px] text-[#131720]">{transcriptData.grade}</h2>
                     </div>
                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <div className="px-6 py-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
                           <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">AGGREGATE SCORE</p>
                           <p className="text-3xl font-bold">{transcriptData.totalWeightedScore.toFixed(1)}%</p>
                        </div>
                        <Badge className="bg-white text-primary font-bold uppercase text-[11px] h-10 px-6 border-none shadow-xl rounded-xl">
                           {transcriptData.grade.startsWith('A') ? 'Excellence Status' : 'Credit Status'}
                        </Badge>
                     </div>
                 </div>
                 
                 <div className="w-px h-32 bg-white/20 hidden md:block" />
                 
                 <div className="space-y-6 max-w-sm">
                    <p className="text-sm font-medium leading-relaxed opacity-95">
                       This record represents the final verified academic achievement for your final year project. 
                       We congratulate you on your dedication and successful research outcome.
                    </p>
                     <div className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider bg-white/10 px-5 py-2.5 rounded-xl border border-white/20">
                        <ShieldAlert className="w-4 h-4 text-white" />
                        Official Academic Transcript
                     </div>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown & Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <h3 className="text-xl font-serif font-bold text-foreground uppercase tracking-wider ml-2 flex items-center gap-2">
                   <TrendingUp className="w-5 h-5 text-primary" /> 
                   Weightage Distribution
                 </h3>
                {transcriptData.phaseBreakdown.map((phase) => (
                   <Card key={phase.id} className="shadow-premium border-none overflow-hidden hover:translate-y-[-4px] transition-all duration-300 rounded-[1.5rem] bg-card">
                      <CardContent className="p-7">
                         <div className="flex items-center justify-between mb-6">
                             <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-success/10 text-primary flex items-center justify-center font-display font-bold text-base border border-primary/20 shadow-sm">
                                   {phase.weight}%
                                 </div>
                                <div>
                                   <h4 className="font-serif font-bold text-foreground text-xl">{phase.name}</h4>
                                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phase Density</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-success">
                                   {phase.weightedContribution.toFixed(1)}%
                                </p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-60">Contribution</p>
                             </div>
                         </div>
                         <div className="space-y-3">
                             <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                <span>Performance Intensity</span>
                                <span className="text-foreground">{phase.percentage.toFixed(1)}%</span>
                             </div>
                            <div className="h-2.5 w-full bg-muted/30 rounded-full overflow-hidden p-0.5 border border-border/20">
                               <div 
                                 className="h-full bg-gradient-to-r from-primary to-success rounded-full shadow-[0_0_12px_rgba(var(--primary),0.2)]" 
                                 style={{ width: `${phase.percentage}%` }}
                               />
                            </div>
                            <p className="text-[11px] text-muted-foreground text-center pt-2 font-bold italic opacity-70">
                               Verified Score: {phase.earnedMark} / {phase.maxMark} points
                            </p>
                         </div>
                      </CardContent>
                   </Card>
                ))}
             </div>

              <div className="space-y-6">
                 <h3 className="text-xl font-serif font-bold text-foreground uppercase tracking-wider ml-2 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-success" />
                    Qualitative Remarks
                 </h3>
                <Card className="shadow-premium border-none bg-muted/5 rounded-[1.5rem]">
                   <CardContent className="p-8 space-y-10">
                      {transcriptData.allFeedback.length > 0 ? transcriptData.allFeedback.map((fb, idx) => (
                          <div key={idx} className="space-y-4">
                             <div className="flex items-center gap-3">
                                <Star className="w-4 h-4 text-success fill-success/20" />
                                <span className="text-[11px] font-serif font-bold uppercase tracking-wider text-primary">{fb.phase}</span>
                             </div>
                            <blockquote className="text-sm font-medium text-foreground/90 leading-relaxed italic bg-background/50 p-6 rounded-2xl shadow-sm border-l-4 border-success relative group hover:border-primary transition-all duration-300">
                               <span className="absolute -top-3 -left-1 text-4xl text-success/20 font-serif">"</span>
                               "{fb.message}"
                            </blockquote>
                         </div>
                      )) : (
                         <div className="py-24 text-center space-y-5 opacity-30">
                            <MessageSquare className="w-14 h-14 mx-auto text-muted-foreground" />
                            <p className="text-xs font-bold uppercase tracking-wider">No formal feedback records available at this time</p>
                         </div>
                      )}
                      
                      <div className="pt-8 border-t border-border/30">
                         <div className="p-6 bg-gradient-to-br from-primary/5 to-success/5 rounded-3xl border border-primary/10 flex items-center gap-6 shadow-inner">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                               <ShieldAlert className="w-6 h-6 text-primary opacity-60" />
                            </div>
                            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                               This ledger is a digitally signed academic document. For official transcripts, please contact the Registrar's Office.
                            </p>
                         </div>
                      </div>
                   </CardContent>
                </Card>
             </div>
          </div>
        </div>
      ) : (
        <Card className="border-none bg-muted/10 p-20 text-center rounded-[2rem]">
           <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
           <p className="text-muted-foreground font-bold uppercase tracking-wider text-xs">Awaiting Final Mark Aggregation</p>
        </Card>
      )}
    </div>
  );
};

export default ResultsPage;
