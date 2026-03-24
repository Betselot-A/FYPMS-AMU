// ============================================================
// Coordinator: Evaluation Report
// Individual & documentation marks, all submitted marks, CSV export
// Grade weights: Advisor 35%, Coordinator 15%, Examiner 20%, Documentation 30%
// ============================================================

import { useState } from "react";
import { mockProjects, mockUsers } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Simulated submitted marks
const mockMarks: Record<string, {
  advisor: number | null;
  coordinator: number | null;
  examiner: number | null;
  documentation: number | null;
}> = {
  s1: { advisor: 28, coordinator: 12, examiner: 16, documentation: 24 },
  s2: { advisor: 30, coordinator: 13, examiner: 17, documentation: 26 },
  s3: { advisor: 25, coordinator: null, examiner: 15, documentation: null },
  s4: { advisor: null, coordinator: null, examiner: null, documentation: null },
};

const weights = { advisor: 35, coordinator: 15, examiner: 20, documentation: 30 };
const maxMarks = { advisor: 35, coordinator: 15, examiner: 20, documentation: 30 };

const students = mockUsers.filter((u) => u.role === "student");

const EvaluationReportPage = () => {
  const allFilled = students.every((s) => {
    const m = mockMarks[s.id];
    return m && m.advisor !== null && m.coordinator !== null && m.examiner !== null && m.documentation !== null;
  });

  const getTotal = (studentId: string) => {
    const m = mockMarks[studentId];
    if (!m) return null;
    if (m.advisor === null || m.coordinator === null || m.examiner === null || m.documentation === null) return null;
    return m.advisor + m.coordinator + m.examiner + m.documentation;
  };

  const handleExportCSV = () => {
    if (!allFilled) {
      toast({ title: "Cannot Export", description: "All results must be filled before exporting.", variant: "destructive" });
      return;
    }

    const headers = ["Student", "Department", "Project", "Advisor (35)", "Coordinator (15)", "Examiner (20)", "Documentation (30)", "Total (100)"];
    const rows = students.map((s) => {
      const m = mockMarks[s.id];
      const project = mockProjects.find((p) => p.groupMembers.includes(s.id));
      const total = getTotal(s.id);
      return [
        s.name,
        s.department,
        project?.title || "—",
        m?.advisor ?? "—",
        m?.coordinator ?? "—",
        m?.examiner ?? "—",
        m?.documentation ?? "—",
        total ?? "—",
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "evaluation_report.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV Exported", description: "Evaluation report downloaded." });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Evaluation Report</h1>
          <p className="text-sm text-muted-foreground mt-1">View all submitted marks and export results</p>
        </div>
        <Button onClick={handleExportCSV} disabled={!allFilled} variant={allFilled ? "default" : "outline"}>
          <Download className="w-4 h-4 mr-1.5" />
          Export CSV
        </Button>
      </div>

      {/* Weight summary */}
      <Card className="shadow-card mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Grade Weight Breakdown</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-center">
              <p className="text-lg font-bold text-primary">{weights.advisor}%</p>
              <p className="text-xs text-muted-foreground">Advisor</p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-accent/5 border border-accent/20 text-center">
              <p className="text-lg font-bold text-accent">{weights.coordinator}%</p>
              <p className="text-xs text-muted-foreground">Coordinator</p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-warning/5 border border-warning/20 text-center">
              <p className="text-lg font-bold text-warning">{weights.examiner}%</p>
              <p className="text-xs text-muted-foreground">Examiner</p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-info/5 border border-info/20 text-center">
              <p className="text-lg font-bold text-info">{weights.documentation}%</p>
              <p className="text-xs text-muted-foreground">Documentation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className="shadow-card mb-6">
        <CardContent className="p-4 flex items-center justify-between">
          <span className="text-sm text-foreground">CSV Export Status</span>
          {allFilled ? (
            <Badge className="bg-success/10 text-success border-success/20" variant="outline">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> All results filled — Ready to export
            </Badge>
          ) : (
            <Badge className="bg-destructive/10 text-destructive border-destructive/20" variant="outline">
              <XCircle className="w-3.5 h-3.5 mr-1" /> Some results missing
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Results table */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All Submitted Marks</CardTitle>
          <CardDescription>Individual evaluation results per student</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Student</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Project</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-medium">Advisor (/{maxMarks.advisor})</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-medium">Coordinator (/{maxMarks.coordinator})</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-medium">Examiner (/{maxMarks.examiner})</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-medium">Docs (/{maxMarks.documentation})</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-medium">Total (/100)</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const m = mockMarks[s.id];
                  const project = mockProjects.find((p) => p.groupMembers.includes(s.id));
                  const total = getTotal(s.id);
                  const complete = total !== null;

                  return (
                    <tr key={s.id} className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium text-foreground">{s.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{project?.title || "—"}</td>
                      <td className="py-3 px-4 text-center">
                        {m?.advisor !== null ? (
                          <span className="text-foreground">{m.advisor}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {m?.coordinator !== null ? (
                          <span className="text-foreground">{m.coordinator}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {m?.examiner !== null ? (
                          <span className="text-foreground">{m.examiner}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {m?.documentation !== null ? (
                          <span className="text-foreground">{m.documentation}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-foreground">
                        {total !== null ? total : "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {complete ? (
                          <CheckCircle className="w-4 h-4 text-success mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive mx-auto" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluationReportPage;
