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
      toast.error("Data Load Error", {
        description: "Failed to sync evaluation standards from the server."
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalWeight = useMemo(() =>
    phases
      .filter((p) => p.active)
      .reduce((sum, p) => sum + Number(p.weight || 0), 0),
    [phases]);

  const isWeightValid = totalWeight === 100;

  const handleSave = async () => {
    // 1. Check total global weight
    if (!isWeightValid) {
      toast.error("Invalid Configuration", {
        description: `Total weight summation must be exactly 100%. Currently at ${totalWeight}%.`
      });
      return;
    }

    // 2. Check individual phase capacities
    const overCapacityPhase = phases.find(p => {
      const totalMarks = (p.criteria || []).reduce((sum, c) => sum + Number(c.maxMark || 0), 0);
      return totalMarks > p.weight;
    });

    if (overCapacityPhase) {
      const currentMarks = (overCapacityPhase.criteria || []).reduce((sum, c) => sum + Number(c.maxMark || 0), 0);
      toast.error("Capacity Violation", {
        description: `"${overCapacityPhase.name}" has ${currentMarks} marks, but its weight is only ${overCapacityPhase.weight}%. Please reduce criteria marks.`
      });
      return;
    }

    try {
      setIsSaving(true);
      // Persist only phases from Coordinator side to avoid overwriting admin's bands
      await gradeService.updateConfig({ phases });
      toast.success("Standards Published", {
        description: "Academic criteria and weightages updated successfully."
      });
    } catch (error) {
      toast.error("Update Failed", {
        description: "Could not persist criteria changes. Please check weights."
      });
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
              <Settings2 className="w-5 h-5" />
            </div>
            Evaluation Standards
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Coordinator: Define evaluation phases and weightage distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={addPhase} className="h-10 font-semibold px-5 rounded-lg hover:bg-primary/5 transition-all">
            <Plus className="w-4 h-4 mr-1.5" /> Add Phase
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

      {/* Role Context Informer */}
      <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-start gap-4">
        <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground/80 leading-relaxed">
          Coordinators manage the <b>Evaluation Phases</b> (Advisor marks, Examiner marks, etc.) and their respective weights. Institutional <b>Grade Boundaries</b> (A+, B, etc.) are managed by the System Admin.
        </p>
      </div>

      {/* Weight Distribution Monitor - Simplified */}
      <div className="flex items-center justify-between px-2 py-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Total Configuration Weight:</span>
          <span className={cn(
            "text-sm font-bold",
            isWeightValid ? "text-foreground" : "text-warning underline decoration-2 underline-offset-4"
          )}>
            {totalWeight}% / 100%
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {isWeightValid ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              Weight is balanced
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-warning font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              Adjustment of {100 - totalWeight}% required
            </span>
          )}
        </div>
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
              <CardHeader className="pb-4 border-b border-border/40">
                <div className="flex items-center justify-between flex-wrap gap-6">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center font-display font-bold text-lg text-muted-foreground border border-border/50">
                      {idx + 1}
                    </div>
                    <div className="space-y-1.5 flex-1 max-w-sm">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Phase Identity</label>
                      <Input
                        value={phase.name}
                        onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                        className="h-10 font-semibold bg-muted/20 border-border/50 px-4 transition-all focus-visible:bg-background"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Grade Weight (%)</label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          value={phase.weight}
                          onChange={(e) => updatePhase(phase.id, { weight: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                          className="w-24 h-10 text-center font-display font-bold text-xl bg-muted/20 border-border/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1.5 mr-4">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Active Status</label>
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
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase text-foreground/70 tracking-widest flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Performance Metrics
                  </h3>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "font-bold py-1 px-4 text-[10px] tracking-tight transition-colors",
                      phaseTotalMax > phase.weight 
                        ? "bg-destructive/10 border-destructive/30 text-destructive" 
                        : "bg-primary/5 border-primary/20 text-primary"
                    )}
                  >
                    {phaseTotalMax > phase.weight && <AlertCircle className="w-3 h-3 mr-1.5" />}
                    Aggregate Capacity: {phaseTotalMax} / {phase.weight} Marks
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(phase.criteria || []).map((c, cIdx) => (
                    <div
                      key={c.id || (c as any)._id}
                      className="group flex items-center gap-4 p-4 bg-muted/30 border border-border/50 hover:border-primary/20 hover:bg-background hover:shadow-sm transition-all rounded-xl"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground/30 cursor-grab shrink-0" />
                      <span className="text-xs font-semibold text-muted-foreground/40 w-6">{cIdx + 1}</span>
                      <Input
                        value={c.label}
                        onChange={(e) => updateCriterion(phase.id, (c.id || (c as any)._id), { label: e.target.value })}
                        className="flex-1 h-9 bg-transparent border-none shadow-none focus-visible:ring-0 font-bold"
                        placeholder="Performance Criterion"
                      />
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/60 rounded-lg border border-border/50 shrink-0">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Max</span>
                        <Input
                          type="number"
                          value={c.maxMark}
                          onChange={(e) => updateCriterion(phase.id, (c.id || (c as any)._id), { maxMark: parseInt(e.target.value) || 0 })}
                          className="w-10 h-7 bg-transparent border-none text-right font-bold p-0 focus-visible:ring-0"
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
                    className="h-full min-h-[60px] border-2 border-dashed border-border/60 hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all rounded-xl flex flex-col items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Append Metric</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!isWeightValid && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-500">
          <div className="bg-background/95 backdrop-blur-md border border-warning/30 text-warning px-6 py-3.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-3.5 ring-1 ring-warning/10">
            <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 animate-pulse" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">
              Pipeline Imbalance: <span className="font-display font-black ml-1 opacity-80">{totalWeight}%</span> <span className="mx-1 text-muted-foreground/50">/</span> 100%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriteriaSetupPage;
