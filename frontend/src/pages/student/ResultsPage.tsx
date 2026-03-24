// ============================================================
// Student: Results Page
// ============================================================

import { useAuth } from "@/contexts/AuthContext";
import { mockProjects, mockSubmissions } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, FileText } from "lucide-react";

const ResultsPage = () => {
  const { user } = useAuth();
  if (!user) return null;

  const myProjects = mockProjects.filter((p) => p.groupMembers.includes(user.id));
  const mySubmissions = mockSubmissions.filter((s) => s.userId === user.id);

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-1">Results</h1>
      <p className="text-muted-foreground text-sm mb-6">View your project evaluation results and feedback.</p>

      {myProjects.length === 0 && (
        <p className="text-sm text-muted-foreground">No results available yet.</p>
      )}

      {myProjects.map((project) => (
        <Card key={project.id} className="shadow-card mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Award className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <CardDescription>
                  Status: <Badge variant="outline" className="ml-1 capitalize">{project.status}</Badge>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Submission Feedback</p>
            <div className="space-y-3">
              {mySubmissions
                .filter((s) => s.projectId === project.id)
                .map((sub) => (
                  <div key={sub.id} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{sub.title}</span>
                      <Badge variant="outline" className="ml-auto text-xs capitalize">{sub.status}</Badge>
                    </div>
                    {sub.feedback && sub.feedback.length > 0 ? (
                      sub.feedback.map((fb) => (
                        <div key={fb.id} className="mt-2 p-3 rounded bg-muted">
                          <p className="text-xs font-medium text-foreground">{fb.fromUserName}</p>
                          <p className="text-sm text-muted-foreground mt-1">{fb.message}</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">{fb.date}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">No feedback yet.</p>
                    )}
                  </div>
                ))}
              {mySubmissions.filter((s) => s.projectId === project.id).length === 0 && (
                <p className="text-sm text-muted-foreground">No submissions for this project yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ResultsPage;
