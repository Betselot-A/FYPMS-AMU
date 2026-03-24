// ============================================================
// Coordinator: Project Management
// Modify title, advisor, and examiner
// ============================================================

import { useState } from "react";
import { mockProjects, mockUsers } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, FolderOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const staff = mockUsers.filter((u) => u.role === "staff");

const ProjectManagementPage = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", advisorId: "", examinerId: "" });

  const startEdit = (project: typeof mockProjects[0]) => {
    setEditingId(project.id);
    setEditForm({
      title: project.title,
      advisorId: project.advisorId,
      examinerId: project.examinerId || "",
    });
  };

  const handleSave = (projectId: string) => {
    toast({
      title: "Project Updated",
      description: `Changes saved for "${editForm.title}".`,
    });
    setEditingId(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Project Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Modify project titles, advisors, and examiners</p>
      </div>

      <div className="space-y-4">
        {mockProjects.map((project) => {
          const isEditing = editingId === project.id;
          const advisor = mockUsers.find((u) => u.id === project.advisorId);
          const examiner = project.examinerId ? mockUsers.find((u) => u.id === project.examinerId) : null;

          return (
            <Card key={project.id} className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-primary" />
                    {isEditing ? (
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                        className="max-w-sm"
                      />
                    ) : (
                      <CardTitle className="text-base">{project.title}</CardTitle>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {isEditing ? (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => handleSave(project.id)}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => startEdit(project)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Advisor</Label>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        value={editForm.advisorId}
                        onChange={(e) => setEditForm((f) => ({ ...f, advisorId: e.target.value }))}
                      >
                        <option value="">Select advisor...</option>
                        {staff.filter((s) => s.staffAssignment?.isAdvisor).map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm">Examiner</Label>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        value={editForm.examinerId}
                        onChange={(e) => setEditForm((f) => ({ ...f, examinerId: e.target.value }))}
                      >
                        <option value="">Select examiner...</option>
                        {staff.filter((s) => s.staffAssignment?.isExaminer).map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Advisor: </span>
                      <span className="font-medium text-foreground">{advisor?.name || "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Examiner: </span>
                      <span className="font-medium text-foreground">{examiner?.name || "—"}</span>
                    </div>
                    <div>
                      <Badge variant="outline" className="capitalize text-xs">{project.status}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectManagementPage;
