// ============================================================
// Coordinator: Staff Assignment Page
// Assign Advisor and Examiner to approved project groups
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, UserCheck, Award, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import userService from "@/api/userService";
import projectService from "@/api/projectService";
import { User, Project } from "@/types";

const ProjectSetupPage = () => {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [approvedProjects, setApprovedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assignForm, setAssignForm] = useState<Record<string, { advisorId: string; examinerId: string }>>({});
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, projectsRes] = await Promise.all([
        userService.getAll({ role: "staff" }),
        projectService.getAll(),
      ]);
      setStaffList(usersRes.data.users);
      // Only show approved proposals that still need staff, or already have staff
      setApprovedProjects(projectsRes.data.filter((p) => p.proposalStatus === "approved"));
    } catch {
      toast.error("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getForm = (projectId: string) =>
    assignForm[projectId] || { advisorId: "", examinerId: "" };

  const updateForm = (projectId: string, field: "advisorId" | "examinerId", value: string) => {
    setAssignForm((prev) => ({
      ...prev,
      [projectId]: { ...getForm(projectId), [field]: value },
    }));
  };

  const handleAssign = async (projectId: string) => {
    const form = getForm(projectId);
    if (!form.advisorId) {
      toast.error("Please select an Advisor before assigning.");
      return;
    }
    setIsSaving(projectId);
    try {
      const res = await projectService.assignStaff(projectId, form.advisorId, form.examinerId || undefined);
      setApprovedProjects((prev) => prev.map((p) => (p.id === projectId ? res.data : p)));
      toast.success("Staff assigned! The project is now In Progress.");
    } catch (error: any) {
      toast.error("Failed to assign staff", { description: error.response?.data?.message });
    } finally {
      setIsSaving(null);
    }
  };

  const advisors = staffList.filter((s) => s.staffAssignment?.isAdvisor);
  const examiners = staffList.filter((s) => s.staffAssignment?.isExaminer);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Staff Assignment</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Assign Advisors and Examiners to groups whose proposals have been approved.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : approvedProjects.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center text-muted-foreground">
            No approved proposals yet. Approve proposals in the Grouping page first.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {approvedProjects.map((project) => {
            const form = getForm(project.id);
            const hasStaff = project.advisorId || project.examinerId;
            const advisor = (project.advisorId as any)?.name || staffList.find((s) => s.id === project.advisorId)?.name;
            const examiner = (project.examinerId as any)?.name || staffList.find((s) => s.id === project.examinerId)?.name;

            return (
              <Card key={project.id} className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{project.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">{project.description}</CardDescription>
                    </div>
                    <Badge className={`${project.status === "in-progress" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"} text-xs capitalize`}>
                      {project.status === "in-progress" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : null}
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current staff (if already assigned) */}
                  {hasStaff && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-xs text-muted-foreground">Current Advisor</p>
                        <p className="text-sm font-medium text-foreground">{advisor || "Not assigned"}</p>
                      </div>
                      <div className="px-3 py-2 rounded-lg bg-warning/5 border border-warning/20">
                        <p className="text-xs text-muted-foreground">Current Examiner</p>
                        <p className="text-sm font-medium text-foreground">{examiner || "Not assigned"}</p>
                      </div>
                    </div>
                  )}

                  {/* Assignment form */}
                  {project.status !== "in-progress" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-xs">
                          <UserCheck className="w-3.5 h-3.5" /> Assign Advisor
                        </Label>
                        <Select value={form.advisorId} onValueChange={(v) => updateForm(project.id, "advisorId", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select advisor..." />
                          </SelectTrigger>
                          <SelectContent>
                            {advisors.length === 0 ? (
                              <SelectItem value="_none" disabled>No advisors found — set staff flags in Admin panel</SelectItem>
                            ) : (
                              advisors.map((s) => (
                                <SelectItem key={s.id} value={s.id}>{s.name} ({s.department})</SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-xs">
                          <Award className="w-3.5 h-3.5" /> Assign Examiner (optional)
                        </Label>
                        <Select value={form.examinerId} onValueChange={(v) => updateForm(project.id, "examinerId", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select examiner..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">— None —</SelectItem>
                            {examiners.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.name} ({s.department})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2">
                        <Button
                          onClick={() => handleAssign(project.id)}
                          disabled={isSaving === project.id}
                          className="gradient-primary text-primary-foreground"
                        >
                          {isSaving === project.id ? "Assigning..." : "Assign Staff & Start Project"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-green-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Staff assigned. This project is now in progress.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectSetupPage;
