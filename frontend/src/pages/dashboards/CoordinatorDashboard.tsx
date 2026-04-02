import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import projectService from "@/api/projectService";
import userService from "@/api/userService";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Users, Clock, CheckCircle, ArrowRight, UserPlus, FileText, AlertCircle, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Project, User } from "@/types";
import ProposalReviewModal from "@/components/modals/ProposalReviewModal";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CoordinatorDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffAssignment, setStaffAssignment] = useState({ advisorId: "", examinerId: "" });
  const [isAssigningStaff, setIsAssigningStaff] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [projRes, studentRes, staffRes] = await Promise.all([
        projectService.getAll(),
        userService.getAll({ role: "student", limit: 1000 }),
        userService.getAll({ role: "staff", limit: 1000 }),
      ]);
      setProjects(projRes.data);
      setStudents(studentRes.data.users || []);
      setStaff(staffRes.data.users || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReview = (project: Project) => {
    setSelectedProject(project);
    setIsReviewModalOpen(true);
  };

  const handleReviewSuccess = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleOpenStaffAssignment = (project: Project) => {
    setSelectedProject(project);
    setStaffAssignment({
      advisorId: project.advisorId ? (typeof project.advisorId === "object" ? project.advisorId.id || (project.advisorId as any)._id : project.advisorId) : "",
      examinerId: project.examinerId ? (typeof project.examinerId === "object" ? project.examinerId.id || (project.examinerId as any)._id : project.examinerId) : ""
    });
    setIsStaffModalOpen(true);
  };

  const handleAssignStaff = async () => {
    if (!selectedProject || !staffAssignment.advisorId || !staffAssignment.examinerId) return;
    
    setIsAssigningStaff(true);
    try {
      const res = await projectService.assignStaff(
        selectedProject.id, 
        staffAssignment.advisorId, 
        staffAssignment.examinerId
      );
      setProjects(projects.map(p => p.id === res.data.id ? res.data : p));
      setIsStaffModalOpen(false);
      toast({ title: "Success", description: "Staff assigned successfully!" });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to assign staff.", 
        variant: "destructive" 
      });
    } finally {
      setIsAssigningStaff(false);
    }
  };

  // Derived metrics logic handling database schema
  const totalProjects = projects.length;
  const proposalsPending = projects.filter(p => p.proposalStatus === "pending").length;
  const proposalsRejected = projects.filter(p => p.proposalStatus === "rejected").length;
  const missingStaff = projects.filter(p => p.proposalStatus === "approved" && (!p.advisorId || !p.examinerId)).length;
  const activeProjectsCount = projects.filter(p => p.proposalStatus === "approved" && p.advisorId && p.examinerId && p.status !== "completed").length;
  const totalStudentsCount = students.length;

  const pendingProjectsList = projects.filter(p => p.proposalStatus === "pending");
  const missingStaffList = projects.filter(p => p.proposalStatus === "approved" && (!p.advisorId || !p.examinerId));
  const rejectedProjectsList = projects.filter(p => p.proposalStatus === "rejected");
  const activeProjectsList = projects.filter(p => p.proposalStatus === "approved" && p.advisorId && p.examinerId && p.status !== "completed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Coordinator Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Operational Overview and Status Hub</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
             <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
             Refresh
          </Button>
          <Button asChild className="gradient-primary text-primary-foreground gap-2">
            <Link to="/dashboard/coordinator/grouping">
              Grouping Engine
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-card border-none bg-background/50 backdrop-blur">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Groups</p>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
               <span className="text-3xl font-display font-bold text-foreground">{totalProjects}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-none bg-background/50 backdrop-blur relative overflow-hidden">
          {proposalsPending > 0 && <div className="absolute top-0 right-0 w-2 h-full bg-warning"></div>}
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-warning" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Review</p>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
               <span className="text-3xl font-display font-bold text-foreground">{proposalsPending}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-none bg-background/50 backdrop-blur relative overflow-hidden">
           {missingStaff > 0 && <div className="absolute top-0 right-0 w-2 h-full bg-destructive"></div>}
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-destructive" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Missing Staff</p>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
               <span className="text-3xl font-display font-bold text-foreground">{missingStaff}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-none bg-background/50 backdrop-blur">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-info" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Projects</p>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
               <span className="text-3xl font-display font-bold text-foreground">{activeProjectsCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-none bg-background/50 backdrop-blur">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-success" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Students</p>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
               <span className="text-3xl font-display font-bold text-foreground">{totalStudentsCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="actions" className="space-y-6">
        <TabsList className="bg-muted w-full justify-start border-b border-border rounded-none h-auto p-0 gap-6">
          <TabsTrigger value="actions" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 text-sm">
            Action Center 
            {proposalsPending + missingStaff > 0 && <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground leading-none">{proposalsPending + missingStaff}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-destructive data-[state=active]:text-destructive rounded-none px-2 py-3 text-sm">
            Rejected Proposals
            {proposalsRejected > 0 && <Badge variant="secondary" className="ml-2 bg-destructive/10 text-destructive border-transparent leading-none">{proposalsRejected}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-info data-[state=active]:text-info rounded-none px-2 py-3 text-sm">
            Active Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="outline-none animate-fade-in mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Action Items: Pending Proposals */}
            <Card className="shadow-card flex flex-col">
              <CardHeader className="pb-3 border-b border-border/50 bg-warning/5 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-warning" />
                    <CardTitle className="text-lg">Proposals to Review</CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">{proposalsPending}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 h-[400px]">
                <ScrollArea className="h-full">
                  {isLoading ? (
                    <div className="flex justify-center py-12 text-sm text-muted-foreground">Loading data...</div>
                  ) : proposalsPending === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center h-[350px]">
                      <CheckCircle className="w-12 h-12 text-success/20 mb-3" />
                      <p className="text-sm text-muted-foreground">No proposals pending review.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {pendingProjectsList.map(project => (
                        <div key={project.id} className="p-4 hover:bg-muted/20 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-sm">{project.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{project.proposals?.[project.proposals.length-1]?.titles[0] || "Awaiting submission"}</p>
                              <div className="flex -space-x-2 mt-3">
                                {(project.groupMembers as any[]).map((m: any, idx) => (
                                  <div key={idx} className="w-6 h-6 rounded-full bg-primary/20 border border-background flex items-center justify-center text-[8px] font-bold text-primary" title={m.name}>
                                    {m.name?.charAt(0) || "U"}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleOpenReview(project)}>
                              Review
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Action Items: Missing Staff Assignments */}
            <Card className="shadow-card flex flex-col">
              <CardHeader className="pb-3 border-b border-border/50 bg-destructive/5 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <CardTitle className="text-lg">Missing Staff Assignments</CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">{missingStaff}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 h-[400px]">
                <ScrollArea className="h-full">
                  {isLoading ? (
                    <div className="flex justify-center py-12 text-sm text-muted-foreground">Loading data...</div>
                  ) : missingStaff === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center h-[350px]">
                      <CheckCircle className="w-12 h-12 text-success/20 mb-3" />
                      <p className="text-sm text-muted-foreground">All approved projects have staff assigned.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {missingStaffList.map(project => (
                        <div key={project.id} className="p-4 hover:bg-muted/20 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-sm line-clamp-1">{project.finalTitle || project.title}</p>
                              <Badge className="mt-1.5 bg-success/10 text-success border-success/20 text-[10px]">Proposal Approved</Badge>
                              <p className="text-xs text-muted-foreground mt-2">Awaiting faculty assignment to proceed.</p>
                            </div>
                            <Button size="sm" variant="outline" className="border-destructive/20 text-destructive hover:bg-destructive/10 text-xs h-8 shrink-0 ml-2" onClick={() => handleOpenStaffAssignment(project)}>
                              Assign Staff
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Rejected Proposals (Awaiting Resubmission) */}
        <TabsContent value="rejected" className="outline-none animate-fade-in mt-6">
          <Card className="shadow-card border-destructive/20">
            <CardHeader className="pb-3 border-b border-border/50 bg-destructive/5 rounded-t-xl">
               <div className="flex items-center gap-2 text-destructive">
                 <XCircle className="w-5 h-5" />
                 <CardTitle className="text-lg text-foreground">Awaiting Student Resubmission</CardTitle>
               </div>
            </CardHeader>
             <CardContent className="p-0">
               <ScrollArea className="h-[400px]">
                  {isLoading ? (
                    <div className="flex justify-center py-12 text-sm text-muted-foreground">Loading data...</div>
                  ) : proposalsRejected === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <FolderOpen className="w-12 h-12 text-muted-foreground/20 mb-3" />
                      <p className="text-sm text-muted-foreground">No rejected proposals. No students are currently blocked.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {rejectedProjectsList.map(project => {
                        const lastProposal = project.proposals?.[project.proposals.length-1];
                        return (
                          <div key={project.id} className="p-4 hover:bg-muted/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-sm">{project.title}</p>
                              <div className="flex gap-2 items-center mt-1">
                                <Badge variant="outline" className="text-[10px] bg-background">Version {lastProposal?.version || 1}</Badge>
                                <span className="text-[10px] text-muted-foreground">Submitted: {lastProposal ? new Date(lastProposal.submittedAt).toLocaleDateString() : 'N/A'}</span>
                              </div>
                              <div className="mt-3 bg-muted/30 p-2 rounded text-xs text-muted-foreground border border-border italic">
                                "{lastProposal?.feedback || "No feedback provided."}"
                              </div>
                            </div>
                            <Button size="sm" variant="secondary" className="shrink-0 text-xs" onClick={() => handleOpenReview(project)}>
                              View History
                            </Button>
                          </div>
                      )})}
                    </div>
                  )}
               </ScrollArea>
             </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Active Projects */}
        <TabsContent value="active" className="outline-none animate-fade-in mt-6">
          <Card className="shadow-card border-info/20">
            <CardHeader className="pb-3 border-b border-border/50 bg-info/5 rounded-t-xl">
               <div className="flex items-center gap-2 text-info">
                 <Clock className="w-5 h-5" />
                 <CardTitle className="text-lg text-foreground">In-Progress Projects</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <ScrollArea className="h-[400px]">
                  {isLoading ? (
                    <div className="flex justify-center py-12 text-sm text-muted-foreground">Loading data...</div>
                  ) : activeProjectsList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <FolderOpen className="w-12 h-12 text-muted-foreground/20 mb-3" />
                      <p className="text-sm text-muted-foreground">No active tracking projects yet. Assign staff to approved proposals to start projects.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {activeProjectsList.map(project => {
                         const advisor = typeof project.advisorId === "object" ? project.advisorId.name : "Advisor";
                         const examiner = typeof project.examinerId === "object" ? project.examinerId.name : "Examiner";
                        return (
                        <div key={project.id} className="p-4 hover:bg-muted/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-sm line-clamp-1">{project.finalTitle}</p>
                            <div className="grid grid-cols-2 gap-4 mt-3">
                               <div className="flex items-center gap-2">
                                 <div className="w-1 flex-shrink-0 h-full bg-primary/20 rounded"></div>
                                 <div>
                                   <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Advisor</p>
                                   <p className="text-xs font-medium truncate">{advisor}</p>
                                 </div>
                               </div>
                               <div className="flex items-center gap-2">
                                 <div className="w-1 flex-shrink-0 h-full bg-info/20 rounded"></div>
                                 <div>
                                   <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Examiner</p>
                                   <p className="text-xs font-medium truncate">{examiner}</p>
                                 </div>
                               </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end shrink-0 gap-2">
                             <Badge variant="outline" className="bg-info/10 text-info border-info/20 tracking-widest uppercase text-[10px]">{project.status}</Badge>
                             <Button size="sm" variant="ghost" className="h-7 text-xs" asChild>
                               <Link to={`/dashboard/coordinator/project-management`}>Manage</Link>
                             </Button>
                          </div>
                        </div>
                      )})}
                    </div>
                  )}
               </ScrollArea>
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integrate correct Proposal Review Modal */}
      <ProposalReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        project={selectedProject}
        onSuccess={handleReviewSuccess}
      />

      {/* Assign Staff Dialog */}
      <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Faculty Staff</DialogTitle>
            <DialogDescription>
              Assign the project advisor and examiner for: <br/>
              <span className="font-semibold text-foreground">{selectedProject?.finalTitle || selectedProject?.title}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground mb-1">Main Advisor</Label>
                <Select 
                  value={staffAssignment.advisorId} 
                  onValueChange={(v) => setStaffAssignment({...staffAssignment, advisorId: v})}
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Select an Advisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.department})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground mb-1">Internal Examiner</Label>
                <Select 
                  value={staffAssignment.examinerId} 
                  onValueChange={(v) => setStaffAssignment({...staffAssignment, examinerId: v})}
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Select an Examiner" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.department})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStaffModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignStaff} disabled={!staffAssignment.advisorId || !staffAssignment.examinerId || isAssigningStaff} className="gradient-primary">
              {isAssigningStaff ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirm Assignments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoordinatorDashboard;
