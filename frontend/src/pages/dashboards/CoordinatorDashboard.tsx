import { useState, useEffect } from "react";
import { projectService, userService } from "@/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Users, Clock, CheckCircle, Plus, Search, UserPlus, MoreVertical, CheckCircle2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CoordinatorDashboard = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [assignment, setAssignment] = useState({ advisorId: "", examinerId: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [projRes, studentRes, staffRes] = await Promise.all([
        projectService.getAll(),
        userService.getAll(),
        userService.getAll({ role: "staff" }),
      ]);
      setProjects(projRes.data);
      setStudents(studentRes.data.users ? studentRes.data.users.filter((u: any) => u.role === "student") : []);
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

  const handleCreateGroup = async () => {
    if (selectedStudents.length === 0) return;
    try {
      const res = await projectService.createGroup({
        groupMembers: selectedStudents,
      });
      toast({
        title: "Success",
        description: "Project group created successfully.",
      });
      setIsCreateDialogOpen(false);
      setSelectedStudents([]);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create group.",
        variant: "destructive",
      });
    }
  };

  const handleApproveProposal = async (index: number) => {
    if (!selectedProject) return;
    try {
      const res = await projectService.approveProposal(selectedProject.id, index);
      const updated = res.data;
      setProjects(projects.map(p => p.id === updated.id ? updated : p));
      setSelectedProject(updated);
      toast({ title: "Success", description: "Proposal approved successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve proposal.", variant: "destructive" });
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedProject || !assignment.advisorId || !assignment.examinerId) return;
    try {
      const res = await projectService.assignStaff(selectedProject.id, assignment.advisorId, assignment.examinerId);
      const updated = res.data;
      setProjects(projects.map(p => p.id === updated.id ? updated : p));
      setSelectedProject(updated);
      setIsManageDialogOpen(false);
      toast({ title: "Success", description: "Staff assigned and project started!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to assign staff.", variant: "destructive" });
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalProjects = projects.length;
  const inProgress = projects.filter((p) => p.status === "in-progress").length;
  const advisors = staff.filter((u) => u.staffAssignment?.isAdvisor).length;
  const totalStudentsCount = students.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Coordinator Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor all projects and manage assignments</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground gap-2">
              <Plus className="w-4 h-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Project Group</DialogTitle>
              <DialogDescription>
                Select students to form a new project group. They will be notified to submit their proposals.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                <div className="space-y-2">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors">
                      <Checkbox 
                        id={student.id} 
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStudents([...selectedStudents, student.id]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                          }
                        }}
                      />
                      <label htmlFor={student.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1">
                        <div className="font-semibold">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.email}</div>
                      </label>
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">No students found</div>
                  ) }
                </div>
              </ScrollArea>
              <div className="text-xs text-muted-foreground">
                {selectedStudents.length} students selected
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateGroup} disabled={selectedStudents.length === 0}>Create Group</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalProjects}</p>
              <p className="text-xs text-muted-foreground">Total Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{inProgress}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{advisors}</p>
              <p className="text-xs text-muted-foreground">Advisors</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalStudentsCount}</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All projects table */}
      <Card className="shadow-card">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-lg">Project Groups</CardTitle>
          <CardDescription>Manage group assignments, proposals, and staff</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium w-[30%]">Project / Group</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Students</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Staff (Adv/Exam)</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {projects.map((project) => {
                  return (
                    <tr key={project.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-foreground">{project.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{project.description || "No description yet"}</div>
                      </td>
                      <td className="py-4 px-4 overflow-hidden">
                        <div className="flex -space-x-2">
                          {project.groupMembers.map((member: any) => (
                            <div key={member.id} className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold" title={member.name}>
                              {member.name.charAt(0)}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="text-muted-foreground mr-1">Adv:</span>
                            <span className="font-medium">{project.advisorId?.name || "Unassigned"}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground mr-1">Exam:</span>
                            <span className="font-medium">{project.examinerId?.name || "Unassigned"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${
                          project.status === 'in-progress' ? 'bg-success/10 text-success border-success/20' : 
                          project.status === 'pending' ? 'bg-warning/10 text-warning border-warning/20' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {project.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs font-semibold hover:text-primary"
                          onClick={() => {
                            setSelectedProject(project);
                            setAssignment({ 
                              advisorId: project.advisorId?.id || "", 
                              examinerId: project.examinerId?.id || "" 
                            });
                            setIsManageDialogOpen(true);
                          }}
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {projects.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      No project groups found. Create one to get started.
                    </td>
                  </tr>
                )}
                {isLoading && (
                   <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      Loading data...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Manage Project Dialog */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Project: {selectedProject?.title}</DialogTitle>
            <DialogDescription>
              Review proposals and assign faculty staff to this project group.
            </DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <Tabs defaultValue="proposals" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="proposals">Proposals ({selectedProject.proposals?.length || 0})</TabsTrigger>
                <TabsTrigger value="staff">Staff Assignment</TabsTrigger>
              </TabsList>

              <TabsContent value="proposals" className="space-y-4 py-4">
                <div className="space-y-4">
                  {selectedProject.proposals?.map((proposal: any, idx: number) => (
                    <div key={idx} className={`p-4 rounded-lg border outline-none transition-all ${
                      selectedProject.approvedProposalIndex === idx 
                        ? "border-success bg-success/5 ring-1 ring-success" 
                        : "border-border bg-background"
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm mb-1">{proposal.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{proposal.description}</p>
                        </div>
                        {selectedProject.proposalStatus === "approved" ? (
                          selectedProject.approvedProposalIndex === idx && (
                            <Badge className="bg-success text-success-foreground pointer-events-none">Approved</Badge>
                          )
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-[10px] font-bold"
                            onClick={() => handleApproveProposal(idx)}
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!selectedProject.proposals || selectedProject.proposals.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center gap-2">
                      <Clock className="w-8 h-8 opacity-20" />
                      Waiting for students to submit proposals...
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="staff" className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Project Advisor</Label>
                    <Select 
                      value={assignment.advisorId} 
                      onValueChange={(v) => setAssignment({...assignment, advisorId: v})}
                      disabled={selectedProject.proposalStatus !== "approved"}
                    >
                      <SelectTrigger>
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
                    <Label>External Examiner</Label>
                    <Select 
                      value={assignment.examinerId} 
                      onValueChange={(v) => setAssignment({...assignment, examinerId: v})}
                      disabled={selectedProject.proposalStatus !== "approved"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an Examiner" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name} ({s.department})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedProject.proposalStatus !== "approved" && (
                    <div className="p-3 rounded-lg bg-warning/10 text-warning text-xs flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      You must approve a proposal before assigning staff.
                    </div>
                  )}
                </div>
                <DialogFooter className="mt-6">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsManageDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAssignStaff} 
                    disabled={selectedProject.proposalStatus !== "approved" || !assignment.advisorId || !assignment.examinerId}
                  >
                    Confirm Assignment & Start
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoordinatorDashboard;
