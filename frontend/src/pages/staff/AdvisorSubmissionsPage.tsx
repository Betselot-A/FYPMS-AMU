// ============================================================
// Advisor: Evaluate Submissions — review files, provide marks & feedback
// ============================================================

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { mockProjects, mockSubmissions, mockUsers } from "@/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ClipboardCheck, FileText, MessageSquare, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdvisorSubmissionsPage = () => {
  const { user } = useAuth();
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [markInputs, setMarkInputs] = useState<Record<string, string>>({});

  if (!user) return null;

  const advisorProjects = mockProjects.filter((p) => p.advisorId === user.id);
  const projectIds = advisorProjects.map((p) => p.id);
  const submissions = mockSubmissions.filter((s) => projectIds.includes(s.projectId));

  const getStudentName = (userId: string) =>
    mockUsers.find((u) => u.id === userId)?.name ?? "Unknown";
  const getProjectTitle = (projectId: string) =>
    mockProjects.find((p) => p.id === projectId)?.title ?? "Unknown";

  const handleSubmitFeedback = (submissionId: string) => {
    const feedback = feedbackInputs[submissionId];
    const mark = markInputs[submissionId];
    if (!feedback?.trim()) {
      toast({ title: "Error", description: "Please enter feedback.", variant: "destructive" });
      return;
    }
    toast({
      title: "Feedback Submitted",
      description: `Feedback${mark ? ` with mark ${mark}` : ""} sent for submission.`,
    });
    setFeedbackInputs((prev) => ({ ...prev, [submissionId]: "" }));
    setMarkInputs((prev) => ({ ...prev, [submissionId]: "" }));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Evaluate Submissions</h1>
        <p className="text-sm text-muted-foreground mt-1">Review student uploads, provide marks and feedback</p>
      </div>

      {submissions.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <ClipboardCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No submissions to review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <Card key={sub.id} className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{sub.title}</CardTitle>
                    <CardDescription>
                      {getProjectTitle(sub.projectId)} — by {getStudentName(sub.userId)}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      sub.status === "submitted"
                        ? "bg-warning/10 text-warning border-warning/20"
                        : sub.status === "reviewed"
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-primary/10 text-primary border-primary/20"
                    }
                  >
                    {sub.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Files */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Uploaded Files
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sub.files.map((file) => (
                      <span key={file} className="px-3 py-1.5 text-xs rounded-md border border-border bg-muted/30 text-foreground">
                        {file}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Existing feedback */}
                {sub.feedback && sub.feedback.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Previous Feedback
                    </p>
                    {sub.feedback.map((fb) => (
                      <div key={fb.id} className="p-3 rounded-lg bg-muted/30 border border-border text-sm mb-2">
                        <p className="font-medium text-foreground">{fb.fromUserName}</p>
                        <p className="text-muted-foreground mt-1">{fb.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{fb.date}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Provide feedback */}
                <div className="pt-2 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" /> Provide Feedback & Mark
                  </p>
                  <div className="flex gap-3 mb-3">
                    <Input
                      type="number"
                      placeholder="Mark (0-100)"
                      className="w-32"
                      value={markInputs[sub.id] ?? ""}
                      onChange={(e) => setMarkInputs((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                    />
                  </div>
                  <Textarea
                    placeholder="Write your feedback here..."
                    value={feedbackInputs[sub.id] ?? ""}
                    onChange={(e) => setFeedbackInputs((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                  />
                  <Button className="mt-3" onClick={() => handleSubmitFeedback(sub.id)}>
                    Submit Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvisorSubmissionsPage;
