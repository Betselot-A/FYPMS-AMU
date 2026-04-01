// ============================================================
// Coordinator: Grouping Page
// Manage manual and automatic student groups and review proposals
// ============================================================

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Users, ChevronDown, ChevronRight, RefreshCw, Plus, ThumbsUp, Shuffle, Save, Loader2, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import userService from "@/api/userService";
import projectService from "@/api/projectService";
import { User, Project } from "@/types";
import ProposalReviewModal from "@/components/modals/ProposalReviewModal";

const MAX_GROUP_SIZE = 4;

const calculateAutoGroups = (students: User[]) => {
  const byDept: Record<string, User[]> = {};
  students.forEach((s) => {
    if (!byDept[s.department]) byDept[s.department] = [];
    byDept[s.department].push(s);
  });

  const groups: { department: string; members: User[] }[] = [];

  Object.entries(byDept).forEach(([dept, deptStudents]) => {
    const sorted = [...deptStudents].sort((a, b) => (b.cgpa ?? 0) - (a.cgpa ?? 0));
    for (let i = 0; i < sorted.length; i += MAX_GROUP_SIZE) {
      groups.push({
        department: dept,
        members: sorted.slice(i, i + MAX_GROUP_SIZE),
      });
    }
  });

  return groups;
};

const GroupingPage = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Manual Grouping State
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  // Auto Grouping State
  const [autoGroups, setAutoGroups] = useState<{ department: string; members: User[] }[]>([]);
  const [isSavingAuto, setIsSavingAuto] = useState(false);

  // Proposal Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingProject, setReviewingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Computed data
  const assignedStudentIds = useMemo(() => new Set(projects.flatMap((p) => p.groupMembers as string[])), [projects]);
  const ungroupedStudents = useMemo(() => students.filter((s) => !assignedStudentIds.has(s.id)), [students, assignedStudentIds]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, projectsRes] = await Promise.all([
        userService.getAll({ role: "student", limit: 1000 }),
        projectService.getAll(),
      ]);
      setStudents(usersRes.data.users);
      setProjects(projectsRes.data);

      const currentAssigned = new Set(projectsRes.data.flatMap((p) => p.groupMembers as string[]));
      const currentUngrouped = usersRes.data.users.filter((s) => !currentAssigned.has(s.id));
      setAutoGroups(calculateAutoGroups(currentUngrouped));
    } catch {
      toast.error("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student.");
      return;
    }
    setIsCreating(true);
    try {
      const res = await projectService.createGroup({ groupMembers: selectedStudents });
      setProjects((prev) => [res.data, ...prev]);
      setIsDialogOpen(false);
      setSelectedStudents([]);

      const updatedAssigned = new Set([...assignedStudentIds, ...selectedStudents]);
      const updatedUngrouped = students.filter(s => !updatedAssigned.has(s.id));
      setAutoGroups(calculateAutoGroups(updatedUngrouped));

      toast.success("Group created! Students can now submit their project proposals.");
    } catch (error: any) {
      toast.error("Failed to create group", { description: error.response?.data?.message });
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenReview = (project: Project) => {
    setReviewingProject(project);
    setIsReviewModalOpen(true);
  };

  const handleReviewSuccess = (updatedProject: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); // Don't toggle accordion
    if (!window.confirm("Are you sure you want to delete this group? \n\nThis will unassign all group members and they will appear in the 'Ungrouped Students' list again.")) return;

    setIsDeleting(projectId);
    try {
      await projectService.delete(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success("Group deleted successfully.");
    } catch (error: any) {
      toast.error("Failed to delete group", { description: error.response?.data?.message });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRegenerateAutoGroups = () => {
    setAutoGroups(calculateAutoGroups(ungroupedStudents));
    toast.success("Groups mathematically regenerated by department and highest CGPA.");
  };

  const handleSaveAutoGroups = async () => {
    if (autoGroups.length === 0) return;
    try {
      setIsSavingAuto(true);
      const groupData = autoGroups.map((g, idx) => ({
        title: `Group ${g.department} - ${idx + 1}`,
        groupMembers: g.members.map((m) => m.id),
      }));

      const res = await projectService.bulkCreate(groupData);
      toast.success(`${autoGroups.length} groups have been saved to the database.`);

      setProjects((prev) => [...res.data.projects, ...prev]);
      setAutoGroups([]);
    } catch (error) {
      toast.error("Failed to save automatic groups");
    } finally {
      setIsSavingAuto(false);
    }
  };

  const departments = useMemo(() => {
    const activeDepts = ungroupedStudents.map((s) => s.department);
    return [...new Set(activeDepts)];
  }, [ungroupedStudents]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Student Grouping</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create groups manually or auto-generate them based on CGPA rankings.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="bg-muted w-full max-w-sm grid grid-cols-2">
          <TabsTrigger value="manual" className="data-[state=active]:bg-background">Manual & Proposals</TabsTrigger>
          <TabsTrigger value="auto" className="data-[state=active]:bg-background">Auto Generation</TabsTrigger>
        </TabsList>

        {/* Tab 1: Manual Grouping and Proposals */}
        <TabsContent value="manual" className="space-y-4 outline-none animate-fade-in">
          <div className="flex justify-between items-center bg-muted/20 p-4 border border-border rounded-xl">
             <div>
                <h3 className="font-semibold text-sm">Active Groups</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Review current groups and natively approve submitted project proposals.</p>
             </div>
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-primary text-primary-foreground shadow-sm">
                  <Plus className="w-4 h-4 mr-1.5" /> Create Group Manually
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Create Student Group</DialogTitle>
                  <DialogDescription>
                    Select students to form a project group. Only ungrouped students are shown.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-3 max-h-72 overflow-y-auto space-y-2">
                  {ungroupedStudents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      All students have already been assigned to groups.
                    </p>
                  ) : (
                    ungroupedStudents.map((s) => {
                      const initials = s.name.split(" ").map((n) => n[0]).join("");
                      const selected = selectedStudents.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => handleToggleStudent(s.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                            selected
                              ? "bg-primary/10 border-primary"
                              : "bg-muted/30 border-border hover:bg-muted/50"
                          }`}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.email} · {s.department}</p>
                          </div>
                          {selected && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
                        </button>
                      );
                    })
                  )}
                </div>
                <DialogFooter>
                  <p className="text-xs text-muted-foreground mr-auto mt-2">
                    {selectedStudents.length} student(s) selected
                  </p>
                  <Button onClick={handleCreateGroup} disabled={isCreating || selectedStudents.length === 0}>
                    {isCreating ? "Creating..." : "Create Group"}
                  </Button>
                </DialogFooter>
              </DialogContent>
             </Dialog>
           </div>
           
           {/* Rendering Existing Groups */}
           {isLoading ? (
            <div className="py-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading groups...
            </div>
          ) : projects.length === 0 ? (
            <Card className="shadow-card border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>No groups created yet. Group students manually to begin.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => {
                const isExpanded = expandedGroup === project.id;
                const memberCount = project.groupMembers.length;

                return (
                  <Card key={project.id} className="shadow-card">
                    <CardHeader
                      className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg"
                      onClick={() => setExpandedGroup(isExpanded ? null : project.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                          <Users className="w-5 h-5 text-primary" />
                          <div>
                            <CardTitle className="text-base">{project.title}</CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                              {memberCount} member{memberCount !== 1 ? "s" : ""} ·{" "}
                              {project.proposals?.length || 0} proposal{project.proposals?.length !== 1 ? "s" : ""} submitted
                            </CardDescription>
                          </div>
                        </div>
                         <div className="flex items-center gap-2">
                          {project.proposalStatus === "approved" && (
                            <Badge className="bg-success/10 text-success border-success/20 text-xs shadow-sm">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                            </Badge>
                          )}
                          <Badge variant="outline" className="capitalize text-xs">{project.status}</Badge>
                          
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            disabled={isDeleting === project.id}
                            onClick={(e) => handleDeleteProject(e, project.id)}
                          >
                            {isDeleting === project.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="space-y-4 pt-0 animate-fade-in">
                        {/* Members */}
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Group Members</p>
                          <div className="space-y-2">
                            {(project.groupMembers as any[]).map((m) => {
                              const member = typeof m === "object" ? m : students.find((s) => s.id === m);
                              if (!member) return null;
                              return (
                                <div key={member.id || member._id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 border border-border">
                                  <Avatar className="w-7 h-7">
                                    <AvatarFallback className="text-xs">{member.name?.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{member.email}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Proposals */}
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                            Project Proposals 
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">({project.proposals?.length || 0}/3)</Badge>
                          </p>
                          {!project.proposals || project.proposals.length === 0 ? (
                            <div className="bg-muted/20 border border-dashed border-border rounded-lg p-4 text-center">
                              <p className="text-xs text-muted-foreground italic">
                                No proposals submitted yet. Group members need to log in and submit their ideas.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {project.proposals.map((proposal, idx) => {
                                const isApproved = project.proposalStatus === "approved" && project.approvedProposalIndex === idx;
                                return (
                                  <div
                                    key={proposal.id || idx}
                                    className={`p-3 rounded-lg border ${
                                      isApproved
                                        ? "bg-success/5 border-success/30 ring-1 ring-success/20"
                                        : proposal.status === "rejected"
                                        ? "bg-destructive/5 border-destructive/20"
                                        : "bg-muted/20 border-border"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-background border text-[10px] shrink-0 font-bold">v{proposal.version}</span>
                                          {isApproved ? project.finalTitle : proposal.titles[0]} {proposal.titles.length > 1 && `(+${proposal.titles.length - 1} more)`}
                                        </p>
                                        {isApproved ? (
                                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed bg-background/50 p-2 rounded border border-border/50 line-clamp-2 italic">
                                            "{project.description}"
                                          </p>
                                        ) : proposal.descriptions?.[0] && (
                                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed bg-background/50 p-2 rounded border border-border/50 line-clamp-2 italic">
                                            "{proposal.descriptions[0]}..."
                                          </p>
                                        )}
                                      </div>
                                      {isApproved ? (
                                        <Badge className="bg-success/10 text-success border-success/20 shrink-0">
                                          <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                                        </Badge>
                                      ) : project.proposalStatus === "pending" || project.proposalStatus === "rejected" ? (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className={`shrink-0 text-xs ${project.proposalStatus === "rejected" ? 'border-destructive/20 text-destructive' : ''}`}
                                          onClick={() => handleOpenReview(project)}
                                        >
                                          {project.proposalStatus === "rejected" ? "Follow Up (Rejected)" : "Review Submission"}
                                        </Button>
                                      ) : null}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Auto-Generation */}
        <TabsContent value="auto" className="space-y-6 outline-none animate-fade-in">
          <div className="flex justify-between items-center bg-muted/20 p-4 border border-border rounded-xl">
            <div>
              <h3 className="font-semibold text-sm">Automated Grouping Engine</h3>
              <p className="text-xs text-muted-foreground max-w-lg mt-0.5">
                Automatically divides all ungrouped students in your department into fair squads of max {MAX_GROUP_SIZE}, strategically sorted by CGPA (merit rank) so top performers are grouped systematically.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={handleRegenerateAutoGroups} disabled={isLoading || isSavingAuto || ungroupedStudents.length === 0}>
                <Shuffle className="w-4 h-4 mr-1.5" /> Re-roll
              </Button>
              <Button size="sm" onClick={handleSaveAutoGroups} disabled={isLoading || isSavingAuto || autoGroups.length === 0} className="gradient-primary">
                {isSavingAuto ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-1.5" />
                )}
                Commit Auto-Groups
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="shadow-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">{ungroupedStudents.length}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Ungrouped Students</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 border-t border-border pt-0.5">Ready for sorting</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <span className="font-bold text-accent">{autoGroups.length}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Proposed Formations</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 border-t border-border pt-0.5">Max {MAX_GROUP_SIZE}/group</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <span className="font-bold text-success">{assignedStudentIds.size}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Already Grouped</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 border-t border-border pt-0.5">Ignored by engine</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground animate-pulse">Calculating optimal formations...</p>
            </div>
          ) : autoGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 border">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-lg font-medium text-foreground">Zero ungrouped students</h3>
              <p className="text-sm text-muted-foreground max-w-sm text-center mt-1">
                Your department's roster is fully assigned. Excellent work!
              </p>
            </div>
          ) : (
            <div>
              {departments.map((dept) => {
                const deptGroups = autoGroups.filter((g) => g.department === dept);
                if (deptGroups.length === 0) return null;

                return (
                  <div key={dept} className="mb-6">
                    <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 rounded-sm">
                        {dept}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider border-l border-border pl-2">
                        {deptGroups.length} suggested
                      </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {deptGroups.map((group, idx) => (
                        <Card key={idx} className="shadow-card border-dashed">
                          <CardHeader className="pb-2 bg-muted/20 rounded-t-xl border-b border-border/50">
                            <CardTitle className="text-sm flex items-center justify-between">
                              <span className="flex items-center gap-2"><Play className="w-3 h-3 text-primary" /> Squad {idx + 1}</span>
                              <Badge variant="outline" className="text-[10px] bg-background">
                                {group.members.length}/{MAX_GROUP_SIZE} Filled
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-0.5 p-2">
                            {group.members.map((m, mIdx) => {
                              const initials = m.name.split(" ").map((n) => n[0]).join("");
                              return (
                                <div
                                  key={m.id}
                                  className={`flex items-center justify-between px-3 py-2 rounded border border-transparent hover:border-border hover:bg-muted/10 transition-colors`}
                                >
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-6 h-6 border">
                                      <AvatarFallback className="text-[10px] bg-background text-foreground">
                                        {initials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium text-foreground leading-none">{m.name}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <Badge
                                      variant="outline"
                                      className={
                                        mIdx === 0
                                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] px-1.5 py-0 shadow-sm"
                                          : "text-[10px] px-1.5 py-0 bg-muted/50 text-muted-foreground"
                                      }
                                    >
                                      CGPA: {m.cgpa?.toFixed(2) ?? "—"}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ProposalReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        project={reviewingProject}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
};

export default GroupingPage;
