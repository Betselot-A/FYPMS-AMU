// ============================================================
// Student: Notifications Page (Deadlines & Alerts)
// ============================================================

import { useAuth } from "@/contexts/AuthContext";
import { mockNotifications, mockProjects } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Info, AlertTriangle, CheckCircle } from "lucide-react";

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  info: { icon: <Info className="w-4 h-4" />, color: "bg-info/10 text-info" },
  deadline: { icon: <Calendar className="w-4 h-4" />, color: "bg-warning/10 text-warning" },
  warning: { icon: <AlertTriangle className="w-4 h-4" />, color: "bg-destructive/10 text-destructive" },
  success: { icon: <CheckCircle className="w-4 h-4" />, color: "bg-success/10 text-success" },
};

const NotificationsPage = () => {
  const { user } = useAuth();
  if (!user) return null;

  const notifications = mockNotifications.filter((n) => n.userId === user.id);
  const myProjects = mockProjects.filter((p) => p.groupMembers.includes(user.id));
  const upcomingDeadlines = myProjects
    .flatMap((p) => p.milestones.filter((m) => m.status === "pending"))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-1">Notifications</h1>
      <p className="text-muted-foreground text-sm mb-6">Stay updated with alerts and upcoming deadlines.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Bell className="w-5 h-5 text-primary" /> Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifications.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No notifications.</p>}
            {notifications.map((n) => {
              const cfg = typeConfig[n.type] || typeConfig.info;
              return (
                <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg ${cfg.color}`}>
                  <div className="mt-0.5">{cfg.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.message}</p>
                    <p className="text-xs opacity-70 mt-1">{n.date}</p>
                  </div>
                  {!n.read && <Badge className="bg-primary text-primary-foreground text-[10px]">New</Badge>}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Upcoming deadlines */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Calendar className="w-5 h-5 text-warning" /> Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingDeadlines.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines.</p>}
            {upcomingDeadlines.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                <div>
                  <p className="text-sm font-medium text-foreground">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                </div>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">{m.dueDate}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage;
