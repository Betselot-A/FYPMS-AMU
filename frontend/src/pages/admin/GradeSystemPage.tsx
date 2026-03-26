// ============================================================
// Admin: Grade System Grouping
// Define grade boundaries and classifications
// ============================================================

import { useState, useEffect } from "react";
import { gradeService } from "@/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, BarChart3, ClipboardCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { GradeBand, Criterion } from "@/api/gradeService";

const initialBands: GradeBand[] = [
  { id: "g1", label: "A+", minScore: 90, maxScore: 100, color: "bg-success/10 text-success border-success/20" },
  { id: "g2", label: "A", minScore: 85, maxScore: 89, color: "bg-success/10 text-success border-success/20" },
  { id: "g3", label: "A-", minScore: 80, maxScore: 84, color: "bg-success/10 text-success border-success/20" },
  { id: "g4", label: "B+", minScore: 75, maxScore: 79, color: "bg-info/10 text-info border-info/20" },
  { id: "g5", label: "B", minScore: 70, maxScore: 74, color: "bg-info/10 text-info border-info/20" },
  { id: "g6", label: "B-", minScore: 65, maxScore: 69, color: "bg-info/10 text-info border-info/20" },
  { id: "g7", label: "C+", minScore: 60, maxScore: 64, color: "bg-warning/10 text-warning border-warning/20" },
  { id: "g8", label: "C", minScore: 55, maxScore: 59, color: "bg-warning/10 text-warning border-warning/20" },
  { id: "g9", label: "C-", minScore: 50, maxScore: 54, color: "bg-warning/10 text-warning border-warning/20" },
  { id: "g10", label: "F", minScore: 0, maxScore: 49, color: "bg-destructive/10 text-destructive border-destructive/20" },
];

const GradeSystemPage = () => {
  const [bands, setBands] = useState<GradeBand[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const response = await gradeService.getConfig();
      setBands(response.data.bands || []);
      setCriteria(response.data.criteria || []);
    } catch (error) {
      toast.error("Failed to load grading system configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await gradeService.updateConfig({ bands, criteria });
      toast.success("Grading system updated successfully");
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBand = (id: string) => {
    setBands((prev) => prev.filter((b) => b.id !== id));
  };

  const handleAddBand = () => {
    const newBand: GradeBand = {
      id: `g${Date.now()}`,
      label: "New",
      minScore: 0,
      maxScore: 0,
      color: "bg-muted/10 text-muted-foreground border-border",
    };
    setBands((prev) => [...prev, newBand]);
  };

  const updateBand = (id: string, field: keyof GradeBand, value: string | number) => {
    setBands((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleDeleteCriterion = (id: string) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddCriterion = () => {
    const newCriterion: Criterion = {
      id: `c${Date.now()}`,
      name: "New Criterion",
      weight: 10,
      phase: "general",
    };
    setCriteria((prev) => [...prev, newCriterion]);
  };

  const updateCriterion = (id: string, field: keyof Criterion, value: any) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Grade System</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure grade boundaries and classifications</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1.5" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading grading configuration...</p>
        </div>
      ) : (
        <Tabs defaultValue="bands" className="space-y-6">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="bands" className="gap-2">
              <BarChart3 className="w-4 h-4" /> Grade Bands
            </TabsTrigger>
            <TabsTrigger value="criteria" className="gap-2">
              <ClipboardCheck className="w-4 h-4" /> Evaluation Criteria
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bands">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Grade Boundaries</CardTitle>
                  <CardDescription>Define score ranges for each grade classification</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddBand}>
                  <Plus className="w-4 h-4 mr-1.5" /> Add Band
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bands.map((band) => (
                    <div
                      key={band.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-muted/10"
                    >
                      <div className="w-24">
                        <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">Label</Label>
                        <Input
                          value={band.label}
                          onChange={(e) => updateBand(band.id, "label", e.target.value)}
                          className="text-center font-bold"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div>
                          <Label className="text-[10px] uppercase text-muted-foreground mb-1 block text-center">Min</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={band.minScore}
                            onChange={(e) => updateBand(band.id, "minScore", parseInt(e.target.value) || 0)}
                            className="w-20 text-center"
                          />
                        </div>
                        <span className="text-muted-foreground self-end mb-2">—</span>
                        <div>
                          <Label className="text-[10px] uppercase text-muted-foreground mb-1 block text-center">Max</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={band.maxScore}
                            onChange={(e) => updateBand(band.id, "maxScore", parseInt(e.target.value) || 0)}
                            className="w-20 text-center"
                          />
                        </div>
                      </div>
                      <div className="flex-1" />
                      <Badge variant="outline" className={`text-xs ${band.color}`}>
                        {band.label}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive h-8 w-8 p-0"
                        onClick={() => handleDeleteBand(band.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {bands.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl border-border text-muted-foreground">
                      No grade bands defined.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="criteria">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Evaluation Components</CardTitle>
                  <CardDescription>Assign weightage to different project phases (Total must be 100%)</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddCriterion}>
                  <Plus className="w-4 h-4 mr-1.5" /> Add Criterion
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-4 py-2 bg-primary/5 rounded-lg border border-primary/10">
                    <span className="text-sm font-medium">Current Total Weight:</span>
                    <Badge variant={totalWeight === 100 ? "success" : "destructive"} className="text-sm px-4">
                      {totalWeight}%
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {criteria.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-muted/10 font-sans"
                      >
                        <div className="flex-1">
                          <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">Criterion Name</Label>
                          <Input
                            value={c.name}
                            onChange={(e) => updateCriterion(c.id, "name", e.target.value)}
                            placeholder="e.g. Midterm Presentation"
                          />
                        </div>
                        <div className="w-24">
                          <Label className="text-[10px] uppercase text-muted-foreground mb-1 block text-center">Weight (%)</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={c.weight}
                            onChange={(e) => updateCriterion(c.id, "weight", parseInt(e.target.value) || 0)}
                            className="text-center font-bold"
                          />
                        </div>
                        <div className="w-40">
                          <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">Phase</Label>
                          <Select
                            value={c.phase}
                            onValueChange={(val) => updateCriterion(c.id, "phase", val)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="advisor">Advisor</SelectItem>
                              <SelectItem value="examiner">Examiner</SelectItem>
                              <SelectItem value="coordinator">Coordinator</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="pt-5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive h-8 w-8 p-0"
                            onClick={() => handleDeleteCriterion(c.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default GradeSystemPage;
