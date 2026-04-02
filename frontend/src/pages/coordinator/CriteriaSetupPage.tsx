import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Settings2, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  GripVertical,
  Activity,
  Layers,
  ShieldCheck,
  RefreshCw,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { gradeService } from "@/api";
import { EvaluationPhase, Criterion } from "@/api/gradeService";
import { cn } from "@/lib/utils";

const CriteriaSetupPage = () => {
  const [phases, setPhases] = useState<EvaluationPhase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch real data from database
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await gradeService.getConfig();
      setPhases(res.data.phases || []);
    } catch (error) {
      toast.error("Failed to load evaluation standards.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalWeight = useMemo(() => 
    phases.filter((p) => p.active).reduce((sum, p) => sum + p.weight, 0),
  [phases]);

  const isWeightValid = totalWeight === 100;

  const handleSave = async () => {
    if (!isWeightValid) {
      toast.error("Invalid Configuration", { 
        description: `Total active weight must be exactly 100%. Current: ${totalWeight}%`,
      });
      return;
    }

    try {
      setIsSaving(true);
      // Persist only phases from Coordinator side to avoid overwriting admin's bands
      await gradeService.updateConfig({ phases });
      toast.success("Academic criteria updated successfully!");
    } catch (error) {
      toast.error("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePhase = (phaseId: string, updates: Partial<EvaluationPhase>) => {
    setPhases(prev => prev.map(p => p.id === phaseId ? { ...p, ...updates } : p));
  };

  const updateCriterion = (phaseId: string, criterionId: string, updates: Partial<Criterion>) => {
    setPhases(prev => prev.map(p => {
      if (p.id !== phaseId) return p;
      return {
        ...p,
        criteria: p.criteria.map(c => (c.id || (c as any)._id) === criterionId ? { ...c, ...updates } : c)
      };
    }));
  };

  const addCriterion = (phaseId: string) => {
    setPhases(prev => prev.map(p => {
      if (p.id !== phaseId) return p;
      return {
        ...p,
        criteria: [...p.criteria, { id: `c-${Date.now()}`, label: "New Criterion", maxMark: 5 }]
      };
    }));
  };

  const removeCriterion = (phaseId: string, criterionId: string) => {
    setPhases(prev => prev.map(p => {
      if (p.id !== phaseId) return p;
      return {
        ...p,
        criteria: p.criteria.filter(c => (c.id || (c as any)._id) !== criterionId)
      };
    }));
  };

  const addPhase = () => {
    const newId = `phase-${Date.now()}`;
    setPhases(prev => [
      ...prev,
      { id: newId, name: "New Evaluation Phase", active: true, weight: 0, criteria: [] }
    ]);
  };

  const removePhase = (phaseId: string) => {
    setPhases(prev => prev.filter(p => p.id !== phaseId));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 border-b">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Settings2 className="w-5 h-5 text-primary-foreground" />
             </div>
             Evolution Standards
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Coordinator: Define evaluation phases and weightage distribution.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <Button variant="outline" onClick={addPhase} className="h-11 border-2 font-bold px-6 rounded-xl hover:bg-primary/5 transition-all">
              <Plus className="w-4 h-4 mr-2" /> Add Phase
           </Button>
           <Button 
            disabled={isSaving || !isWeightValid} 
            onClick={handleSave}
            className="gradient-primary text-primary-foreground h-11 px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
           >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Publish Config
                </>
              )}
           </Button>
        </div>
      </div>

      {/* Weight Distribution Monitor */}
      <Card className={cn(
        "border-2 transition-all duration-500 overflow-hidden shadow-none",
        isWeightValid ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"
      )}>
        <CardContent className="p-6">
           <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 flex-1 w-full">
                <div className="flex items-center justify-between mb-2">
                   <p className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Academic Weight Pipeline
                   </p>
                   <span className={cn(
                     "text-2xl font-display font-black",
                     isWeightValid ? "text-success" : "text-warning"
                   )}>
                      {totalWeight}% / 100%
                   </span>
                </div>
                <Progress 
                  value={totalWeight} 
                  className={cn(
                    "h-3 bg-muted shadow-inner overflow-hidden",
                    isWeightValid ? "bg-success/20" : "bg-warning/20"
                  )} 
                />
              </div>
              
              <div className="shrink-0 flex items-center gap-4 px-6 py-4 bg-background rounded-2xl border border-border/50 shadow-sm">
                 {isWeightValid ? (
                   <CheckCircle2 className="w-6 h-6 text-success animate-in zoom-in duration-500" />
                 ) : (
                   <AlertCircle className="w-6 h-6 text-warning animate-pulse" />
                 )}
                 <div>
                    <p className="text-xs font-black uppercase tracking-tighter">
                       {isWeightValid ? "Distribution Balanced" : "Balance Required"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight max-w-[140px]">
                       {isWeightValid ? "Standards are balanced and ready for evaluation." : `Adjustment of ${100 - totalWeight}% is needed to proceed.`}
                    </p>
                 </div>
              </div>
           </div>
        </CardContent>
      </Card>

      {/* Role Context Informer */}
      <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-start gap-4">
         <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
         <p className="text-xs text-muted-foreground/80 leading-relaxed">
            Coordinators manage the <b>Evaluation Phases</b> (Advisor marks, Examiner marks, etc.) and their respective weights. Institutional <b>Grade Boundaries</b> (A+, B, etc.) are managed by the System Admin.
         </p>
      </div>

      {/* Phases Builder */}
      <div className="grid grid-cols-1 gap-6">
        {phases.map((phase, idx) => {
          const phaseTotalMax = (phase.criteria || []).reduce((sum, c) => sum + (c.maxMark || 0), 0);
          
          return (
            <Card key={phase.id} className={cn(
              "shadow-card border-none transition-all duration-300 relative group",
              !phase.active && "opacity-60 grayscale-[0.5]"
            )}>
              <CardHeader className="pb-4 border-b border-border/50">
                <div className="flex items-center justify-between flex-wrap gap-6">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center font-display font-black text-lg text-muted-foreground border">
                       {idx + 1}
                    </div>
                    <div className="space-y-1.5 flex-1 max-w-sm">
                       <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Phase Identity</label>
                       <Input 
                        value={phase.name} 
                        onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                        className="h-10 font-bold bg-muted/40 border-none px-4 transition-all focus-visible:bg-background"
                       />
                    </div>
                    
                    <div className="space-y-1.5">
                       <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Grade Weight (%)</label>
                       <div className="flex items-center gap-3">
                          <Input 
                            type="number"
                            value={phase.weight}
                            onChange={(e) => updatePhase(phase.id, { weight: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                            className="w-24 h-10 text-center font-display font-black text-xl bg-muted/40 border-none"
                          />
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                     <div className="flex flex-col items-end gap-1.5 mr-4">
                        <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Active Status</label>
                        <Switch 
                          checked={phase.active} 
                          onCheckedChange={(checked) => updatePhase(phase.id, { active: checked })} 
                        />
                     </div>
                     <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10 w-10 transition-all opacity-0 group-hover:opacity-100"
                      onClick={() => removePhase(phase.id)}
                     >
                        <Trash2 className="w-4 h-4" />
                     </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-8 space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase text-foreground/70 tracking-widest flex items-center gap-2">
                       <Layers className="w-4 h-4" />
                       Performance Metrics
                    </h3>
                    <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black py-1 px-4 text-[11px] tracking-tight">
                       AGGREGATE CAPACITY: {phaseTotalMax} MARKS
                    </Badge>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(phase.criteria || []).map((c, cIdx) => (
                      <div 
                        key={c.id || (c as any)._id} 
                        className="group flex items-center gap-4 p-4 bg-muted/20 border-2 border-transparent hover:border-primary/20 hover:bg-background hover:shadow-md transition-all rounded-2xl"
                      >
                         <GripVertical className="w-4 h-4 text-muted-foreground/20 cursor-grab shrink-0" />
                         <span className="text-xs font-black text-muted-foreground/40 w-6">{cIdx + 1}</span>
                         <Input 
                            value={c.label}
                            onChange={(e) => updateCriterion(phase.id, (c.id || (c as any)._id), { label: e.target.value })}
                            className="flex-1 h-9 bg-transparent border-none shadow-none focus-visible:ring-0 font-bold"
                            placeholder="Performance Criterion"
                         />
                         <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-xl border border-border/40 shrink-0">
                            <span className="text-[10px] font-black text-muted-foreground uppercase">Max</span>
                            <Input 
                              type="number"
                              value={c.maxMark}
                              onChange={(e) => updateCriterion(phase.id, (c.id || (c as any)._id), { maxMark: parseInt(e.target.value) || 0 })}
                              className="w-10 h-7 bg-transparent border-none text-right font-black p-0 focus-visible:ring-0"
                            />
                         </div>
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                          onClick={() => removeCriterion(phase.id, (c.id || (c as any)._id))}
                         >
                            <Trash2 className="w-3.5 h-3.5" />
                         </Button>
                      </div>
                    ))}
                    
                    <Button 
                      variant="ghost" 
                      onClick={() => addCriterion(phase.id)}
                      className="h-full min-h-[60px] border-2 border-dashed border-muted-foreground/20 hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all rounded-2xl flex flex-col items-center justify-center gap-1"
                    >
                       <Plus className="w-4 h-4" />
                       <span className="text-[10px] font-heavy uppercase tracking-widest">Append Metric</span>
                    </Button>
                 </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Floating Status Indicator */}
      {!isWeightValid && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 animate-in slide-in-from-bottom-10 duration-500">
           <div className="bg-warning text-warning-foreground px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border-2 border-warning/20 backdrop-blur-xl">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-black uppercase tracking-tight">
                 Pipeline Imbalance ({totalWeight}% / 100%). Adjust to proceed.
              </span>
           </div>
        </div>
      )}
    </div>
  );
};

export default CriteriaSetupPage;
