// ============================================================
// Staff: Notifications
// ============================================================

import { useAuth } from "@/contexts/AuthContext";
import { mockNotifications } from "@/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Info, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  info: <Info className="w-4 h-4 text-info" />,
  warning: <AlertTriangle className="w-4 h-4 text-warning" />,
  success: <CheckCircle className="w-4 h-4 text-success" />,
  deadline: <Clock className="w-4 h-4 text-destructive" />,
};

const StaffNotificationsPage = () => {
  const { user } = useAuth();
  if (!user) return null;

  const notifications = mockNotifications
    .filter((n) => n.userId === user.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Stay updated on project activities</p>
      </div>

      {notifications.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No notifications.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={`shadow-card ${!n.read ? "border-primary/30" : ""}`}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                  {iconMap[n.type] || <Bell className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{n.date}</p>
                </div>
                {!n.read && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs shrink-0">
                    New
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffNotificationsPage;
