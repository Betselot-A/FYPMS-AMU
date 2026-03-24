// ============================================================
// Examiner: Evaluate Project & Submit Grades
// ============================================================

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { mockProjects, mockUsers } from "@/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Award, Star, FileCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ExaminerEvaluatePage = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  if (!user) return null;

  const projects = mockProjects.filter((p) => p.examinerId === user.id);

  const handleSubmitGrade = (projectId: string) => {
    const grade = grades[projectId];
    const comment = comments[projectId];
    if (!grade?.trim()) {
      toast({ title: "Error", description: "Please enter a grade.", variant: "destructive" });
      return;
    }
    toast({
      title: "Grade Submitted",
      description: `Grade ${grade} submitted for the project.`,
    });
    setGrades((prev) => ({ ...prev, [projectId]: "" }));
    setComments((prev) => ({ ...prev, [projectId]: "" }));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Evaluate & Grade Projects</h1>
        <p className="text-sm text-muted-foreground mt-1">Evaluate assigned projects and submit final grades</p>
      </div>

      {projects.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <Award className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No projects to evaluate.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const members = project.groupMembers
              .map((id) => mockUsers.find((u) => u.id === id)?.name)
              .filter(Boolean)
              .join(", ");

            return (
              <Card key={project.id} className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription>Students: {members}</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-info/10 text-info border-info/20">
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{project.description}</p>

                  {/* Milestones summary */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <FileCheck className="w-4 h-4" /> Milestones
                    </p>
                    <div className="space-y-1.5">
                      {project.milestones.map((m) => (
                        <div key={m.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-muted/30 border border-border">
                          <span className="text-foreground">{m.title}</span>
                          <Badge
                            variant="outline"
                            className={
                              m.status === "approved"
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-warning/10 text-warning border-warning/20"
                            }
                          >
                            {m.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grade form */}
                  <div className="pt-3 border-t border-border">
                    <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4" /> Submit Grade
                    </p>
                    <div className="flex gap-3 mb-3">
                      <Input
                        type="text"
                        placeholder="Grade (e.g. A, B+, 85)"
                        className="w-48"
                        value={grades[project.id] ?? ""}
                        onChange={(e) => setGrades((prev) => ({ ...prev, [project.id]: e.target.value }))}
                      />
                    </div>
                    <Textarea
                      placeholder="Evaluation comments (optional)..."
                      value={comments[project.id] ?? ""}
                      onChange={(e) => setComments((prev) => ({ ...prev, [project.id]: e.target.value }))}
                    />
                    <Button className="mt-3" onClick={() => handleSubmitGrade(project.id)}>
                      Submit Grade
                    </Button>
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

export default ExaminerEvaluatePage;
