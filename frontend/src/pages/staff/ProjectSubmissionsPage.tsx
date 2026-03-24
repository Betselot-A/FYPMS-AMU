// ============================================================
// Project Submissions Page (Advisor context)
// Review files, provide marks and feedback for a specific project
// ============================================================

import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState } from "react";
import { mockProjects, mockSubmissions } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ProjectSubmissionsPage = () => {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "advisor";
  const project = mockProjects.find((p) => p.id === projectId);
  const submissions = mockSubmissions.filter((s) => s.projectId === projectId);

  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [marksMap, setMarksMap] = useState<Record<string, string>>({});

  if (!project) return <p className="text-muted-foreground">Project not found.</p>;

  const handleSubmitFeedback = (subId: string) => {
    const feedback = feedbackMap[subId];
    const marks = marksMap[subId];
    if (!feedback && !marks) return;
    toast({ title: "Feedback Submitted", description: `Marks: ${marks || "N/A"} — Feedback sent for submission.` });
    setFeedbackMap((prev) => ({ ...prev, [subId]: "" }));
    setMarksMap((prev) => ({ ...prev, [subId]: "" }));
  };

  return (
    <div>
      <Link to={`/dashboard/staff/project/${projectId}?role=${role}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Project
      </Link>
      <h1 className="text-xl font-display font-bold text-foreground mb-1">Submissions</h1>
      <p className="text-sm text-muted-foreground mb-6">{project.title}</p>

      <div className="space-y-4">
        {submissions.map((sub) => (
          <Card key={sub.id} className="shadow-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{sub.title}</CardTitle>
                <Badge variant="outline" className={sub.status === "submitted" ? "bg-primary/10 text-primary border-primary/20" : "bg-success/10 text-success border-success/20"}>
                  {sub.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Submitted: {sub.submissionDate}</p>
              <div className="flex flex-wrap gap-2">
                {sub.files.map((f) => (
                  <span key={f} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                    <FileText className="w-3 h-3" /> {f}
                  </span>
                ))}
              </div>

              {sub.feedback?.map((fb) => (
                <div key={fb.id} className="bg-muted/50 rounded-lg p-3 text-sm">
                  <p className="font-medium text-foreground text-xs">{fb.fromUserName}</p>
                  <p className="text-muted-foreground text-xs mt-1">{fb.message}</p>
                </div>
              ))}

              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Marks (e.g. 85/100)"
                    value={marksMap[sub.id] || ""}
                    onChange={(e) => setMarksMap((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                    className="w-36"
                  />
                </div>
                <Textarea
                  placeholder="Write feedback..."
                  value={feedbackMap[sub.id] || ""}
                  onChange={(e) => setFeedbackMap((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                  rows={2}
                />
                <Button size="sm" onClick={() => handleSubmitFeedback(sub.id)}>
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {submissions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No submissions yet for this project.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectSubmissionsPage;
