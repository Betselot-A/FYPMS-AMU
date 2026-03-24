import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { projectService, notificationService } from "@/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Award, Bell, Users, ChevronRight, LayoutDashboard } from "lucide-react";

const statusColors: Record<string, string> = {
  "pending": "bg-warning/10 text-warning border-warning/20",
  "approved": "bg-success/10 text-success border-success/20",
  "in-progress": "bg-info/10 text-info border-info/20",
  "submitted": "bg-primary/10 text-primary border-primary/20",
  "reviewed": "bg-accent/10 text-accent border-accent/20",
  "under-review": "bg-accent/10 text-accent border-accent/20",
  "completed": "bg-success/10 text-success border-success/20",
};

const StaffDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [projRes, notifRes] = await Promise.all([
        projectService.getAll(),
        notificationService.getAll(),
      ]);
      setProjects(projRes.data);
      setNotifications(notifRes.data);
    } catch (error) {
      console.error("Failed to fetch staff data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const isAdvisor = user.staffAssignment?.isAdvisor ?? false;
  const isExaminer = user.staffAssignment?.isExaminer ?? false;

  const advisorProjects = projects.filter((p) => p.advisorId?.id === user.id);
  const examinerProjects = projects.filter((p) => p.examinerId?.id === user.id);
  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Welcome, {user.name.split(" ")[0]}!</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Staff Dashboard
          {isAdvisor && isExaminer && " — Advisor & Examiner"}
          {isAdvisor && !isExaminer && " — Advisor"}
          {!isAdvisor && isExaminer && " — Examiner"}
          {!isAdvisor && !isExaminer && " — No assignments yet"}
        </p>
      </div>

      {/* No assignment message */}
      {!isAdvisor && !isExaminer && (
        <Card className="shadow-card mb-6 border-warning/30 bg-warning/5">
          <CardContent className="p-12 text-center">
            <LayoutDashboard className="w-12 h-12 text-warning mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-bold text-foreground mb-2">No Active Assignments</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              You haven't been assigned to any project groups yet. As soon as the coordinator assigns you as an advisor or examiner, projects will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{advisorProjects.length}</p>
              <p className="text-xs text-muted-foreground">Advising</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{examinerProjects.length}</p>
              <p className="text-xs text-muted-foreground">Examining</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{unreadNotifications.length}</p>
              <p className="text-xs text-muted-foreground">Recent Alerts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects to Advise */}
        <Card className="shadow-card">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Projects to Advise</CardTitle>
                <CardDescription>Manage your student groups</CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{advisorProjects.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-2 pt-4">
            <div className="space-y-2">
              {advisorProjects.map((p) => (
                <Link
                  key={p.id}
                  to={`/dashboard/staff/project/${p.id}?role=advisor`}
                  className="block p-4 rounded-xl border border-border bg-background hover:bg-muted/50 hover:border-primary/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground text-sm truncate">{p.title}</h3>
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold ${statusColors[p.status]}`}>{p.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{p.description || "No description provided"}</p>
                      <div className="flex items-center gap-3 mt-3">
                         <div className="flex -space-x-2">
                            {p.groupMembers?.map((m: any) => (
                              <div key={m.id} className="w-5 h-5 rounded-full border border-background bg-muted flex items-center justify-center text-[8px] font-bold">
                                {m.name.charAt(0)}
                              </div>
                            ))}
                         </div>
                         <p className="text-[10px] text-muted-foreground font-medium">
                           Team: {p.groupMembers?.map((m: any) => m.name.split(" ")[0]).join(", ")}
                         </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 ml-3 transition-colors" />
                  </div>
                </Link>
              ))}
              {advisorProjects.length === 0 && !isLoading && (
                <div className="py-12 text-center text-muted-foreground text-sm italic">
                  No projects assigned for advising.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Projects to Examine */}
        <Card className="shadow-card">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Projects to Examine</CardTitle>
                <CardDescription>Evaluations and grading</CardDescription>
              </div>
              <Badge variant="outline" className="bg-warning/5 text-warning border-warning/20">{examinerProjects.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-2 pt-4">
            <div className="space-y-2">
              {examinerProjects.map((p) => (
                <Link
                  key={p.id}
                  to={`/dashboard/staff/project/${p.id}?role=examiner`}
                  className="block p-4 rounded-xl border border-border bg-background hover:bg-muted/50 hover:border-warning/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground text-sm truncate">{p.title}</h3>
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold ${statusColors[p.status]}`}>{p.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{p.description || "No description provided"}</p>
                      <p className="text-[10px] text-muted-foreground mt-3 font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {p.groupMembers?.length} Student Group
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-warning shrink-0 ml-3 transition-colors" />
                  </div>
                </Link>
              ))}
              {examinerProjects.length === 0 && !isLoading && (
                <div className="py-12 text-center text-muted-foreground text-sm italic">
                  No projects assigned for examination.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffDashboard;
