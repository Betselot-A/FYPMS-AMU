import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { projectService, notificationService } from "@/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FolderOpen, Bell, CheckCircle, Clock, Plus, Send, Users, 
  XCircle, FileText, Edit2, Check, X, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

const statusColors: Record<string, string> = {
  "pending": "bg-warning/10 text-warning border-warning/20",
  "approved": "bg-success/10 text-success border-success/20",
  "rejected": "bg-destructive/10 text-destructive border-destructive/20",
  "in-progress": "bg-info/10 text-info border-info/20",
  "submitted": "bg-primary/10 text-primary border-primary/20",
  "reviewed": "bg-accent/10 text-accent border-accent/20",
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

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
      console.error("Failed to fetch student data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (currentName: string) => {
    setEditedName(currentName);
    setIsEditingName(true);
  };

  const handleSaveName = async (projectId: string) => {
    if (!editedName.trim()) {
      toast({ title: "Error", description: "Group name cannot be empty", variant: "destructive" });
      return;
    }

    setIsSavingName(true);
    try {
      await projectService.update(projectId, { title: editedName.trim() });
      toast({ title: "Success", description: "Group name updated successfully" });
      setIsEditingName(false);
      fetchData(); // Refresh to see the new title
    } catch (error) {
      toast({ title: "Error", description: "Failed to update group name", variant: "destructive" });
    } finally {
      setIsSavingName(false);
    }
  };

  if (!user) return null;

  const currentProject = projects[0]; // Assuming one project group per student for now
  const unreadNotifications = notifications.filter(n => !n.read);

  // Calculate overall progress from milestones
  const allMilestones = projects.flatMap((p) => p.milestones || []);
  const approvedCount = allMilestones.filter((m: any) => m.status === "approved").length;
  const progressPercent = allMilestones.length > 0 ? Math.round((approvedCount / allMilestones.length) * 100) : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Welcome back, {user.name.split(" ")[0]}!</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's an overview of your project progress</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{projects.length}</p>
              <p className="text-xs text-muted-foreground">My Groups</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{currentProject?.proposals?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Proposals ({currentProject?.proposals?.length || 0}/3)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{progressPercent}%</p>
              <p className="text-xs text-muted-foreground">Overall Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{unreadNotifications.length}</p>
              <p className="text-xs text-muted-foreground">Direct Alerts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project/Group Details */}
        <div className="lg:col-span-2 space-y-6">
          {currentProject ? (
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 max-w-md">
                      <Input 
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="h-9 font-bold text-lg"
                        placeholder="Enter new group name..."
                        autoFocus
                      />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 text-success hover:bg-success/10"
                        onClick={() => handleSaveName(currentProject.id)}
                        disabled={isSavingName}
                      >
                        {isSavingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 text-destructive hover:bg-destructive/10"
                        onClick={() => setIsEditingName(false)}
                        disabled={isSavingName}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group/title">
                      <CardTitle className="text-lg">Project Group: {currentProject.title}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 opacity-0 group-hover/title:opacity-100 transition-opacity"
                        onClick={() => handleStartEdit(currentProject.title)}
                      >
                        <Edit2 className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </div>
                  )}
                  <CardDescription>Status: <span className="capitalize font-medium text-foreground">{currentProject.status}</span></CardDescription>
                </div>
                {!isEditingName && currentProject.proposalStatus !== "approved" && (
                  <Button
                    size="sm"
                    className="gradient-primary text-primary-foreground gap-2"
                    onClick={() => navigate("/dashboard/project/submit")}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {currentProject.proposalStatus === "rejected" ? "Revise Proposal" : "Submit Proposal"}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Proposals Tracking */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Submitted Proposals
                    </h3>
                    <div className="grid gap-3">
                      {currentProject.proposals?.map((proposal: any, idx: number) => (
                        <div key={idx} className={`p-4 rounded-xl border ${
                          proposal.status === 'approved' ? 'bg-success/5 border-success/30' 
                          : proposal.status === 'rejected' ? 'bg-destructive/5 border-destructive/20'
                          : 'bg-muted/30 border-border/50'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-background border text-[10px] font-bold">v{proposal.version}</span>
                              <h4 className="text-sm font-bold">
                                {Array.isArray(proposal.titles) ? proposal.titles[0] : proposal.title}
                                {Array.isArray(proposal.titles) && proposal.titles.length > 1 && (
                                  <span className="text-xs font-normal text-muted-foreground ml-1">(+{proposal.titles.length - 1} more)</span>
                                )}
                              </h4>
                            </div>
                            <Badge className={`text-[10px] uppercase ${
                              proposal.status === 'approved' ? 'bg-success text-success-foreground' 
                              : proposal.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20'
                              : 'bg-warning/10 text-warning border-warning/20'
                            }`}>{proposal.status}</Badge>
                          </div>
                          {proposal.status === 'rejected' && proposal.feedback && (
                            <p className="text-xs text-destructive mt-2 bg-destructive/5 p-2 rounded border border-destructive/10 italic">Feedback: "{proposal.feedback}"</p>
                          )}
                        </div>
                      ))}
                      {(!currentProject.proposals || currentProject.proposals.length === 0) && (
                        <div className="text-center py-6 border-2 border-dashed rounded-xl border-border/50 text-muted-foreground text-sm">
                          No proposals submitted yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Group Members */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      Team Members
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentProject.groupMembers?.map((member: any) => (
                        <Badge key={member.id} variant="secondary" className="px-3 py-1 bg-muted/50 border-none font-medium">
                          {member.name} {member.id === user.id && "(You)"}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Staff Info */}
                  {currentProject.status === "in-progress" && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Advisor</p>
                        <p className="text-sm font-medium">{currentProject.advisorId?.name || "Unassigned"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">External Examiner</p>
                        <p className="text-sm font-medium">{currentProject.examinerId?.name || "Unassigned"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-card border-dashed">
              <CardContent className="py-12 text-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">No Project Group Assigned</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Your coordinator hasn't assigned you to a project group yet. Please check back later or contact your department.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Notifications Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Recent Alerts
            </h2>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notif) => (
              <div key={notif.id} className={`p-4 rounded-xl border transition-all ${notif.read ? 'bg-background border-border/30 opacity-60' : 'bg-primary/5 border-primary/10 shadow-sm'}`}>
                <p className="text-xs font-medium text-foreground">{notif.message}</p>
                <p className="text-[10px] text-muted-foreground mt-2">{new Date(notif.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
            {notifications.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground text-xs italic">
                No notifications yet.
              </div>
            )}
            {isLoading && <div className="text-center py-4 text-xs">Loading updates...</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
