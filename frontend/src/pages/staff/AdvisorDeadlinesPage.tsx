// ============================================================
// Advisor: Monitor Evaluation Deadlines
// ============================================================

import { useAuth } from "@/contexts/AuthContext";
import { mockProjects } from "@/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react";

const AdvisorDeadlinesPage = () => {
  const { user } = useAuth();
  if (!user) return null;

  const projects = mockProjects.filter((p) => p.advisorId === user.id);

  const allMilestones = projects.flatMap((p) =>
    p.milestones.map((m) => ({ ...m, projectTitle: p.title, projectId: p.id }))
  );

  const sorted = [...allMilestones].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const now = new Date();
  const isOverdue = (date: string, status: string) =>
    status === "pending" && new Date(date) < now;
  const isUpcoming = (date: string, status: string) => {
    const d = new Date(date);
    const diff = d.getTime() - now.getTime();
    return status === "pending" && diff > 0 && diff < 14 * 24 * 60 * 60 * 1000;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Evaluation Deadlines</h1>
        <p className="text-sm text-muted-foreground mt-1">Track milestones across your advising projects</p>
      </div>

      {sorted.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No deadlines to track.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((m) => {
            const overdue = isOverdue(m.dueDate, m.status);
            const upcoming = isUpcoming(m.dueDate, m.status);

            return (
              <Card key={`${m.projectId}-${m.id}`} className={`shadow-card ${overdue ? "border-destructive/40" : upcoming ? "border-warning/40" : ""}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    m.status === "approved"
                      ? "bg-success/10"
                      : overdue
                      ? "bg-destructive/10"
                      : upcoming
                      ? "bg-warning/10"
                      : "bg-muted/50"
                  }`}>
                    {m.status === "approved" ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : overdue ? (
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    ) : (
                      <Clock className="w-5 h-5 text-warning" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.projectTitle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-foreground">{m.dueDate}</p>
                    <Badge
                      variant="outline"
                      className={
                        m.status === "approved"
                          ? "bg-success/10 text-success border-success/20"
                          : overdue
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-warning/10 text-warning border-warning/20"
                      }
                    >
                      {overdue ? "Overdue" : m.status}
                    </Badge>
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

export default AdvisorDeadlinesPage;
