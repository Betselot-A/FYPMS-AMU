// ============================================================
// Coordinator: Criteria Setup
// Editable evaluation phases, criteria, weights
// ============================================================

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings, Plus, Trash2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CriterionItem {
  id: string;
  label: string;
  maxMark: number;
}

interface EvaluationPhase {
  id: string;
  name: string;
  active: boolean;
  weight: number;
  criteria: CriterionItem[];
}

const initialPhases: EvaluationPhase[] = [
  {
    id: "phase-advisor",
    name: "Advisor Evaluation",
    active: true,
    weight: 35,
    criteria: [
      { id: "c1", label: "Project understanding", maxMark: 10 },
      { id: "c2", label: "Progress and effort", maxMark: 10 },
      { id: "c3", label: "Documentation quality", maxMark: 10 },
      { id: "c4", label: "Communication", maxMark: 5 },
    ],
  },
  {
    id: "phase-coordinator",
    name: "Coordinator Evaluation",
    active: true,
    weight: 15,
    criteria: [
      { id: "c5", label: "Criterion 1", maxMark: 5 },
      { id: "c6", label: "Criterion 2", maxMark: 5 },
      { id: "c7", label: "Criterion 3", maxMark: 5 },
    ],
  },
  {
    id: "phase-examiner",
    name: "Examiner Evaluation",
    active: true,
    weight: 20,
    criteria: [
      { id: "c8", label: "Pace of presentation", maxMark: 3 },
      { id: "c9", label: "Confidence and manner", maxMark: 3 },
      { id: "c10", label: "Clarity and eye contact", maxMark: 3 },
      { id: "c11", label: "Body language", maxMark: 3 },
      { id: "c12", label: "General knowledge", maxMark: 2 },
      { id: "c13", label: "Answering questions", maxMark: 3 },
      { id: "c14", label: "Language use", maxMark: 3 },
    ],
  },
  {
    id: "phase-documentation",
    name: "Documentation",
    active: true,
    weight: 30,
    criteria: [
      { id: "c15", label: "Report structure", maxMark: 10 },
      { id: "c16", label: "Technical content", maxMark: 10 },
      { id: "c17", label: "References and citations", maxMark: 10 },
    ],
  },
];

const CriteriaSetupPage = () => {
  const [phases, setPhases] = useState<EvaluationPhase[]>(initialPhases);

  const togglePhase = (phaseId: string) => {
    setPhases((prev) =>
      prev.map((p) => (p.id === phaseId ? { ...p, active: !p.active } : p))
    );
  };

  const updatePhaseWeight = (phaseId: string, weight: number) => {
    setPhases((prev) =>
      prev.map((p) => (p.id === phaseId ? { ...p, weight } : p))
    );
  };

  const updatePhaseName = (phaseId: string, name: string) => {
    setPhases((prev) =>
      prev.map((p) => (p.id === phaseId ? { ...p, name } : p))
    );
  };

  const updateCriterion = (phaseId: string, criterionId: string, field: "label" | "maxMark", value: string | number) => {
    setPhases((prev) =>
      prev.map((p) =>
        p.id === phaseId
          ? {
              ...p,
              criteria: p.criteria.map((c) =>
                c.id === criterionId ? { ...c, [field]: value } : c
              ),
            }
          : p
      )
    );
  };

  const addCriterion = (phaseId: string) => {
    setPhases((prev) =>
      prev.map((p) =>
        p.id === phaseId
          ? {
              ...p,
              criteria: [
                ...p.criteria,
                { id: `c${Date.now()}`, label: "New criterion", maxMark: 5 },
              ],
            }
          : p
      )
    );
  };

  const removeCriterion = (phaseId: string, criterionId: string) => {
    setPhases((prev) =>
      prev.map((p) =>
        p.id === phaseId
          ? { ...p, criteria: p.criteria.filter((c) => c.id !== criterionId) }
          : p
      )
    );
  };

  const handleSave = () => {
    if (totalWeight !== 100) {
      toast({ title: "Error", description: "Total active weight must equal 100%.", variant: "destructive" });
      return;
    }
    toast({ title: "Criteria Saved", description: "Evaluation criteria have been updated." });
  };

  const totalWeight = phases.filter((p) => p.active).reduce((sum, p) => sum + p.weight, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Criteria Setup</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure evaluation phases, criteria, and weights</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-1.5" /> Save Changes
        </Button>
      </div>

      {/* Weight summary */}
      <Card className="shadow-card mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Total Active Weight</span>
            </div>
            <Badge
              variant="outline"
              className={totalWeight === 100
                ? "bg-success/10 text-success border-success/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
              }
            >
              {totalWeight}%{totalWeight !== 100 && " (must equal 100%)"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {phases.map((phase) => {
          const phaseTotal = phase.criteria.reduce((sum, c) => sum + c.maxMark, 0);

          return (
            <Card key={phase.id} className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Input
                      value={phase.name}
                      onChange={(e) => updatePhaseName(phase.id, e.target.value)}
                      className="w-56 font-semibold"
                    />
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={phase.weight}
                        onChange={(e) => updatePhaseWeight(phase.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                      />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Max: {phaseTotal} marks
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {phase.active ? "Active" : "Inactive"}
                    </span>
                    <Switch checked={phase.active} onCheckedChange={() => togglePhase(phase.id)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {phase.criteria.map((c, i) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 border border-border"
                    >
                      <span className="text-sm text-muted-foreground w-6 shrink-0">{i + 1}.</span>
                      <Input
                        value={c.label}
                        onChange={(e) => updateCriterion(phase.id, c.id, "label", e.target.value)}
                        className="flex-1 text-sm"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-muted-foreground">/</span>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          value={c.maxMark}
                          onChange={(e) => updateCriterion(phase.id, c.id, "maxMark", parseInt(e.target.value) || 1)}
                          className="w-16 text-center text-sm"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive shrink-0"
                        onClick={() => removeCriterion(phase.id, c.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => addCriterion(phase.id)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Criterion
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CriteriaSetupPage;
