// ============================================================
// Coordinator: Project Management
// Modify title, advisor, and examiner
// ============================================================

import { useState, useEffect } from "react";
import projectService from "@/api/projectService";
import userService from "@/api/userService";
import { Project, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Save, X, FolderOpen, RefreshCw, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ProjectManagementPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", advisorId: "", examinerId: "" });
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [projRes, staffRes] = await Promise.all([
        projectService.getAll(),
        userService.getAll({ role: "staff", limit: 1000 }),
      ]);
      setProjects(projRes.data);
      setStaffList(staffRes.data.users || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startEdit = (project: Project) => {
    setEditingId(project.id);

    // Determine title
    let currentTitle = project.finalTitle || project.title;

    // Extract ID values for advisor and examiner since they might be populated objects
    let advId = "";
    if (project.advisorId) {
      advId = typeof project.advisorId === "object" ? (project.advisorId as any).id || (project.advisorId as any)._id : project.advisorId;
    }

    let exmId = "";
    if (project.examinerId) {
      exmId = typeof project.examinerId === "object" ? (project.examinerId as any).id || (project.examinerId as any)._id : project.examinerId;
    }

    setEditForm({
      title: currentTitle,
      advisorId: advId,
      examinerId: exmId,
    });
  };

  const handleSave = async (projectId: string) => {
    setIsSaving(projectId);
    try {
      const res = await projectService.update(projectId, {
        title: editForm.title || undefined,
        advisorId: editForm.advisorId || undefined,
        examinerId: editForm.examinerId || undefined,
      });

      setProjects((prev) => prev.map((p) => (p.id === projectId ? res.data : p)));
      setEditingId(null);
      toast({
        title: "Project Updated",
        description: "Changes saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Project Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Modify project titles, advisors, and examiners</p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12 text-sm text-muted-foreground">Loading projects...</div>
      ) : projects.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center text-muted-foreground">
            No projects found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const isEditing = editingId === project.id;

            let advId = "";
            let advName = "—";
            if (project.advisorId) {
              advId = typeof project.advisorId === "object" ? (project.advisorId as any).id || (project.advisorId as any)._id : project.advisorId;
              advName = typeof project.advisorId === "object" ? (project.advisorId as any).name : staffList.find(s => s.id === advId)?.name || advId;
            }

            let exmId = "";
            let exmName = "—";
            if (project.examinerId) {
              exmId = typeof project.examinerId === "object" ? (project.examinerId as any).id || (project.examinerId as any)._id : project.examinerId;
              exmName = typeof project.examinerId === "object" ? (project.examinerId as any).name : staffList.find(s => s.id === exmId)?.name || exmId;
            }

            return (
              <Card key={project.id} className="shadow-card overflow-hidden">
                <CardHeader className="pb-4 bg-muted/5 border-b border-border/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2.5">
                      {/* Identity Row */}
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        {isEditing ? (
                          <div className="space-y-1 flex-1 max-w-md">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Group Identity</Label>
                            <Input
                              value={editForm.title}
                              onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                              placeholder="Group Name"
                              className="h-9 font-bold"
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-foreground">{project.title || "Untitled Group"}</span>
                        )}
                      </div>

                      {/* Official Title Row */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <FolderOpen className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Official Project Topic</p>
                          <p className="text-base font-medium leading-tight">
                            {project.finalTitle || (project.proposalStatus === 'approved' ? "Topic Pending Sync" : "Selection in Progress")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {isEditing ? (
                        <>
                          <Button size="sm" variant="outline" className="h-9 px-3 border-success/30 text-success hover:bg-success/5" onClick={() => handleSave(project.id)} disabled={isSaving === project.id}>
                            {isSaving === project.id ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Changes
                          </Button>
                          <Button size="sm" variant="ghost" className="h-9 px-3" onClick={handleCancelEdit} disabled={isSaving === project.id}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary rounded-full transition-colors" onClick={() => startEdit(project)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Staff Assignment */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground/60 border-b border-border/50 pb-2">Academic Guidance</p>
                      {isEditing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">Advisor</Label>
                            <Select
                              value={editForm.advisorId || "none"}
                              onValueChange={(v) => setEditForm((f) => ({ ...f, advisorId: v === "none" ? "" : v }))}
                            >
                              <SelectTrigger className="h-10 text-sm">
                                <SelectValue placeholder="Select Advisor" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">— Unassigned —</SelectItem>
                                {staffList.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.department})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">Examiner</Label>
                            <Select
                              value={editForm.examinerId || "none"}
                              onValueChange={(v) => setEditForm((f) => ({ ...f, examinerId: v === "none" ? "" : v }))}
                            >
                              <SelectTrigger className="h-10 text-sm">
                                <SelectValue placeholder="Select Examiner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">— Unassigned —</SelectItem>
                                {staffList.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.department})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Advisor</p>
                            <p className="text-sm font-medium">{advName}</p>
                          </div>
                          <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Examiner</p>
                            <p className="text-sm font-medium">{exmName}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Team Context */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-border/50 pb-2">
                        <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground/60">Research Squad</p>
                        <Badge variant="outline" className={cn(
                          "text-[9px] px-2 py-0 uppercase font-black",
                          project.status === 'in-progress' ? "bg-success/5 text-success border-success/20" : "bg-warning/5 text-warning border-warning/20"
                        )}>
                          {project.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(project.groupMembers as any[]).map((member) => (
                          <Badge key={member.id || member} variant="secondary" className="bg-background border border-border/50 font-medium text-xs px-2.5 py-1">
                            {member.name || "Student"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectManagementPage;
