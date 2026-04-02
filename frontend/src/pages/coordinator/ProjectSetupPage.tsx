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
import { CheckCircle2, UserCheck, Award, RefreshCw, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
      const examinerId = form.examinerId === "none" ? undefined : form.examinerId;
      const res = await projectService.assignStaff(projectId, form.advisorId, examinerId);
      setApprovedProjects((prev) => prev.map((p) => (p.id === projectId ? res.data : p)));
      toast.success("Staff Assigned", { 
        description: "Advisor and Examiner have been linked to the project squad." 
      });
    } catch (error: any) {
      toast.error("Assignment Failed", { 
        description: "Could not persist staff assignments. Please check permissions." 
      });
    } finally {
      setIsSaving(null);
    }
  };

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
            const advisor = (project.advisorId as any)?.name || staffList.find((s) => s.id === (typeof project.advisorId === 'string' ? project.advisorId : (project.advisorId as any)?.id))?.name;
            const examiner = (project.examinerId as any)?.name || staffList.find((s) => s.id === (typeof project.examinerId === 'string' ? project.examinerId : (project.examinerId as any)?.id))?.name;

            return (
              <Card key={project.id} className="shadow-card overflow-hidden border-sidebar-border/20">
                <CardHeader className="pb-4 bg-muted/5 border-b border-sidebar-border/10">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                          {project.title || "Untitled Group"}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 px-3 py-1 bg-background rounded-md border border-border/50 max-w-fit">
                        <Award className="w-3.5 h-3.5 text-accent" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Topic: <span className="text-foreground normal-case font-medium">{project.finalTitle || "Selection Pending"}</span>
                        </span>
                      </div>
                    </div>
                    <Badge className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm",
                      project.status === "in-progress" 
                        ? "bg-success/10 text-success border-success/20" 
                        : "bg-warning/10 text-warning border-warning/20"
                    )}>
                       {project.status === "in-progress" ? <CheckCircle2 className="w-3 h-3 mr-1.5" /> : <Clock className="w-3 h-3 mr-1.5" />}
                       {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Team Members List */}
                  <div className="space-y-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                       <UserCheck className="w-3.5 h-3.5" />
                       Assigned Squad Members
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(project.groupMembers as any[]).map((member: any) => (
                        <Badge key={member.id || member} variant="secondary" className="bg-muted/40 hover:bg-muted font-medium py-1 px-2.5 border-none">
                          {member.name || "Student"}
                        </Badge>
                      ))}
                    </div>
                  </div>

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
                            {staffList.length === 0 ? (
                              <SelectItem value="_none" disabled>No staff members found.</SelectItem>
                            ) : (
                              staffList.map((s) => (
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
                            <SelectItem value="none">— None —</SelectItem>
                            {staffList.map((s) => (
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
