// ============================================================
// Admin: Grade System Grouping
// Define grade boundaries and classifications
// ============================================================

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface GradeBand {
  id: string;
  label: string;
  minScore: number;
  maxScore: number;
  color: string;
}

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
  const [bands, setBands] = useState<GradeBand[]>(initialBands);

  const handleSave = () => {
    toast({ title: "Grade System Saved", description: "Grade boundaries have been updated." });
  };

  const handleDelete = (id: string) => {
    setBands((prev) => prev.filter((b) => b.id !== id));
  };

  const handleAdd = () => {
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Grade System</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure grade boundaries and classifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Band
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-1.5" /> Save Changes
          </Button>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Grade Bands</CardTitle>
          </div>
          <CardDescription>Define score ranges for each grade classification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bands.map((band) => (
              <div
                key={band.id}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-muted/10"
              >
                <div className="w-20">
                  <Input
                    value={band.label}
                    onChange={(e) => updateBand(band.id, "label", e.target.value)}
                    className="text-center font-bold"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={band.minScore}
                    onChange={(e) => updateBand(band.id, "minScore", parseInt(e.target.value) || 0)}
                    className="w-20 text-center"
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={band.maxScore}
                    onChange={(e) => updateBand(band.id, "maxScore", parseInt(e.target.value) || 0)}
                    className="w-20 text-center"
                  />
                </div>
                <Badge variant="outline" className={`text-xs ${band.color}`}>
                  {band.label}
                </Badge>
                <div className="flex-1" />
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive h-8 w-8 p-0"
                  onClick={() => handleDelete(band.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GradeSystemPage;
