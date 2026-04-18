import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Download,
  CheckCircle2,
  BarChart3,
  FileSpreadsheet,
  Users,
  Search,
  RefreshCw,
  Trophy,
  Send,
  Unlock,
  AlertCircle,
  Filter,
  TrendingUp,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import projectService, { Project } from "@/api/projectService";
import { gradeService } from "@/api";
import { GradeConfig } from "@/api/gradeService";
import evaluationService, { EvaluationResult } from "@/api/evaluationService";
import userService from "@/api/userService";
import { User } from "@/types";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ReportRow {
  student: User;
  project: Project | undefined;
  phaseResults: Record<string, number | null>;
  finalScore: number;
  grade: string;
  gradeColor: string;
  isComplete: boolean;
  resultsReleased: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
const EvaluationReportPage = () => {
  const [config, setConfig] = useState<GradeConfig | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [allEvaluations, setAllEvaluations] = useState<
    Record<string, EvaluationResult[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isReleasing, setIsReleasing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [confRes, projRes, userRes] = await Promise.all([
        gradeService.getConfig(),
        projectService.getAll(),
        userService.getAll(),
      ]);

      const fetchedProjects = projRes.data;
      setConfig(confRes.data);
      setProjects(fetchedProjects);
      setStudents(userRes.data.users.filter((u) => u.role === "student"));

      const evalPromises = fetchedProjects.map(async (p) => {
        try {
          const res = await evaluationService.getEvaluationsByProject(p.id);
          return { projectId: p.id, results: res.data };
        } catch {
          return { projectId: p.id, results: [] };
        }
      });

      const evalData = await Promise.all(evalPromises);
      const evalMap: Record<string, EvaluationResult[]> = {};
      evalData.forEach((d) => {
        evalMap[d.projectId] = d.results;
      });
      setAllEvaluations(evalMap);
    } catch {
      toast.error("Report System Error", { 
        description: "Failed to compile students' academic records." 
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Compute Report Rows ────────────────────────────────────────────────────
  const reportData = useMemo<ReportRow[]>(() => {
    if (!config) return [];

    return students.map((student) => {
      const project = projects.find((p) =>
        p.groupMembers.some(
          (m) => (typeof m === "string" ? m : m.id) === student.id
        )
      );
      const evals = project ? allEvaluations[project.id] || [] : [];

      const phaseResults: Record<string, number | null> = {};
      let totalWeightedScore = 0;
      let isComplete = true;

      config.phases
        .filter((p) => p.active)
        .forEach((phase) => {
          const phaseEval = evals.find((e) => {
            const eStudentId = typeof e.studentId === "string" ? e.studentId : e.studentId.id;
            return e.phaseId === phase.id && eStudentId === student.id;
          });
          
          if (phaseEval) {
            const maxPossible = phase.criteria.reduce(
              (s, c) => s + c.maxMark,
              0
            );
            const scorePercent =
              maxPossible > 0 ? phaseEval.totalMark / maxPossible : 0;
            phaseResults[phase.id] = phaseEval.totalMark;
            totalWeightedScore += scorePercent * phase.weight;
          } else {
            phaseResults[phase.id] = null;
            isComplete = false;
          }
        });

      const finalScore = Math.round(totalWeightedScore * 100) / 100;
      const band = config.bands.find(
        (b) => finalScore >= b.minScore && finalScore <= b.maxScore
      );

      return {
        student,
        project,
        phaseResults,
        finalScore,
        grade: isComplete ? (band?.label || "F") : "Pending",
        gradeColor: isComplete 
          ? (band?.color || "bg-destructive/10 text-destructive border-destructive/20") 
          : "bg-muted text-muted-foreground border-border",
        isComplete,
        resultsReleased: project?.resultsReleased || false,
      };
    });
  }, [config, students, projects, allEvaluations]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (reportData.length === 0)
      return { avg: 0, completion: 0, published: 0, total: 0 };
    const avg =
      reportData.reduce((s, r) => s + r.finalScore, 0) / reportData.length;
    const completion =
      (reportData.filter((r) => r.isComplete).length / reportData.length) * 100;
    const published = reportData.filter((r) => r.resultsReleased).length;
    return {
      avg: Math.round(avg),
      completion: Math.round(completion),
      published,
      total: reportData.length,
    };
  }, [reportData]);

  // ── Departments for filter ─────────────────────────────────────────────────
  const departments = Array.from(
    new Set(students.map((s) => s.department))
  ).filter(Boolean);

  // ── Filtered Data ──────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    return reportData.filter((r) => {
      const matchSearch =
        r.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.project?.title || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept =
        deptFilter === "all" || r.student.department === deptFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && r.resultsReleased) ||
        (statusFilter === "pending" && !r.resultsReleased && r.isComplete) ||
        (statusFilter === "incomplete" && !r.isComplete);
      return matchSearch && matchDept && matchStatus;
    });
  }, [reportData, searchQuery, deptFilter, statusFilter]);

  // ── Release Results ────────────────────────────────────────────────────────
  const handleReleaseResults = async (projectId: string) => {
    try {
      setIsReleasing(projectId);
      await projectService.releaseResults(projectId);
      toast.success("Results Released", { 
        description: "Evaluations have been officially published to student dashboards." 
      });
      fetchData();
    } catch {
      toast.error("Release Failed", { 
        description: "Server could not finalize results publication." 
      });
    } finally {
      setIsReleasing(null);
    }
  };

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!config) return;
    const activePhases = config.phases.filter((p) => p.active);
    const headers = [
      "Student Name",
      "Email",
      "Department",
      "Project Title",
      ...activePhases.map((p) => `${p.name} (${p.weight}%)`),
      "Final Score (%)",
      "Grade",
      "Status",
    ];
    const rows = filteredData.map((r) =>
      [
        r.student.name,
        r.student.email,
        r.student.department || "N/A",
        r.project?.title || "No Project",
        ...activePhases.map((p) =>
          r.phaseResults[p.id] !== null ? r.phaseResults[p.id] : "Pending"
        ),
        r.finalScore,
        r.grade,
        r.resultsReleased ? "Published" : r.isComplete ? "Ready" : "Incomplete",
      ].join(",")
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `coordinator_report_${Date.now()}.csv`);
    link.click();
    toast.success("Export Complete", { 
      description: "Academic report CSV has been downloaded to your device." 
    });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-16">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[480px] w-full rounded-xl" />
      </div>
    );
  }

  // ── Active evaluation phases ───────────────────────────────────────────────
  const activePhases = config?.phases.filter((p) => p.active) || [];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            Academic Report
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive performance record for all registered students.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="h-10 font-semibold px-4 rounded-lg"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleExportCSV}
            className="h-10 font-semibold px-5 rounded-lg gradient-primary text-primary-foreground shadow-sm shadow-primary/10"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* ── Summary Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <Card className="border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Total
              </span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground leading-none">
              {stats.total}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Registered students
            </p>
          </CardContent>
        </Card>

        {/* Avg Score */}
        <Card className="border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Avg Score
              </span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground leading-none">
              {stats.avg}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Class average performance
            </p>
          </CardContent>
        </Card>

        {/* Evaluation Completion */}
        <Card className="border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Evaluated
              </span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground leading-none">
              {stats.completion}%
            </p>
            <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all"
                style={{ width: `${stats.completion}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Published */}
        <Card className="border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-warning" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Published
              </span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground leading-none">
              {stats.published}
              <span className="text-lg text-muted-foreground font-medium">
                /{stats.total}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Results released to students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Report Table ──────────────────────────────────────────────────── */}
      <Card className="border shadow-sm overflow-hidden">
        {/* Table Filters */}
        <CardHeader className="p-4 border-b bg-muted/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Student Performance Ledger
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {filteredData.length} of {reportData.length} students shown
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search name, email or project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              {/* Department filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="h-9 rounded-lg border border-border bg-background text-xs font-medium px-3 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                >
                  <option value="all">All Departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background text-xs font-medium px-3 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="pending">Ready to Publish</option>
                <option value="incomplete">Incomplete</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/10 text-muted-foreground text-[10px] font-bold uppercase tracking-widest leading-none">
                  <th className="text-left py-3 px-6">Student</th>
                  <th className="text-left py-3 px-4">Department</th>
                  <th className="text-left py-3 px-4">Project Title</th>
                  {/* Dynamic evaluation phase columns */}
                  {activePhases.map((phase) => (
                    <th key={phase.id} className="text-center py-3 px-4">
                      {phase.name}
                      <span className="block text-[10px] font-normal normal-case text-muted-foreground/70">
                        {phase.weight}% weight
                      </span>
                    </th>
                  ))}
                  <th className="text-center py-4 px-4">Grade</th>
                  <th className="text-center py-4 px-4">Score</th>
                  <th className="text-right py-4 px-6">Release</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/30">
                {filteredData.length === 0 && (
                  <tr>
                    <td
                      colSpan={6 + activePhases.length}
                      className="py-20 text-center text-muted-foreground"
                    >
                      <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-25" />
                      <p className="text-sm">No records found.</p>
                    </td>
                  </tr>
                )}

                {filteredData.map((row) => (
                  <tr
                    key={row.student.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    {/* Student */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 rounded-lg shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold rounded-lg">
                            {getInitials(row.student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate leading-tight">
                            {row.student.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {row.student.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-4 px-4">
                      {row.student.department ? (
                        <Badge variant="secondary" className="font-normal text-xs">
                          {row.student.department}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground/50 italic">
                          N/A
                        </span>
                      )}
                    </td>

                    {/* Project Title */}
                    <td className="py-4 px-4">
                      <p className="text-foreground font-medium truncate max-w-[160px]">
                        {row.project?.title || (
                          <span className="text-muted-foreground/50 italic font-normal text-xs">
                            No project
                          </span>
                        )}
                      </p>
                    </td>

                    {/* Phase marks */}
                    {activePhases.map((phase) => (
                      <td key={phase.id} className="py-4 px-4 text-center">
                        {row.phaseResults[phase.id] !== null ? (
                          <span className="font-semibold text-foreground">
                            {row.phaseResults[phase.id]}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 italic">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </td>
                    ))}

                    {/* Grade badge */}
                    <td className="py-4 px-4 text-center">
                      {row.grade === "Pending" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/50 italic font-medium justify-center">
                          <Clock className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      ) : (
                        <Badge
                          className={cn(
                            "px-3 py-1 font-bold text-sm rounded-lg border capitalize",
                            row.gradeColor
                          )}
                        >
                          {row.grade}
                        </Badge>
                      )}
                    </td>

                    {/* Final Score */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="font-bold text-primary text-sm">
                          {row.finalScore}%
                        </span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden border border-border/50">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${row.finalScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Release action */}
                    <td className="py-4 px-6 text-right">
                      {row.resultsReleased ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 border border-success/20 px-3 py-1.5 rounded-full">
                          <Unlock className="w-3 h-3" />
                          Published
                        </span>
                      ) : row.isComplete ? (
                        <Button
                          size="sm"
                          onClick={() => handleReleaseResults(row.project!.id)}
                          disabled={!!isReleasing}
                          className="h-8 px-4 text-xs gradient-primary text-primary-foreground shadow-sm shadow-primary/20 gap-1.5"
                        >
                          {isReleasing === row.project?.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-3 h-3" />
                              Release
                            </>
                          )}
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 italic">
                          <AlertCircle className="w-3 h-3 text-warning/60" />
                          Awaiting marks
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Footer Note ───────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-xl border bg-muted/20 px-5 py-4">
        <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Result Release Protocol
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Clicking <strong>Release</strong> officially publishes the student's
            final grade. Students are notified immediately, the project is
            archived as completed, and results become visible on the student's
            dashboard. This action cannot be undone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EvaluationReportPage;
