// ============================================================
// Coordinator: Grouping Page
// Create student groups and review/approve their proposals
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, Users, ChevronDown, ChevronRight, RefreshCw, Plus, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import userService from "@/api/userService";
import projectService from "@/api/projectService";
import { User, Project } from "@/types";

const GroupingPage = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, projectsRes] = await Promise.all([
        userService.getAll({ role: "student" }),
        projectService.getAll(),
      ]);
      setStudents(usersRes.data.users);
      setProjects(projectsRes.data);
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
      toast.success("Group created! Students can now submit their project proposals.");
    } catch (error: any) {
      toast.error("Failed to create group", { description: error.response?.data?.message });
    } finally {
      setIsCreating(false);
    }
  };

  const handleApproveProposal = async (projectId: string, index: number, proposalTitle: string) => {
    setIsApproving(`${projectId}-${index}`);
    try {
      const res = await projectService.approveProposal(projectId, index);
      setProjects((prev) => prev.map((p) => (p.id === projectId ? res.data : p)));
      toast.success(`"${proposalTitle}" approved!`, {
        description: "The group has been notified. You can now assign staff.",
      });
    } catch (error: any) {
      toast.error("Failed to approve proposal", { description: error.response?.data?.message });
    } finally {
      setIsApproving(null);
    }
  };

  // Get students already grouped
  const assignedStudentIds = new Set(projects.flatMap((p) => p.groupMembers as string[]));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Student Grouping</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create groups, review project proposals, and approve one per group.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-1.5" /> Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Create Student Group</DialogTitle>
                <DialogDescription>
                  Select students to form a project group. Only un-grouped students are shown.
                </DialogDescription>
              </DialogHeader>
              <div className="py-3 max-h-72 overflow-y-auto space-y-2">
                {students.filter((s) => !assignedStudentIds.has(s.id)).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    All students have already been grouped.
                  </p>
                ) : (
                  students
                    .filter((s) => !assignedStudentIds.has(s.id))
                    .map((s) => {
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
                <p className="text-xs text-muted-foreground mr-auto">
                  {selectedStudents.length} student(s) selected
                </p>
                <Button onClick={handleCreateGroup} disabled={isCreating || selectedStudents.length === 0}>
                  {isCreating ? "Creating..." : "Create Group"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : projects.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center text-muted-foreground">
            No groups yet. Click "Create Group" to start assigning students.
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
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                        </Badge>
                      )}
                      <Badge variant="outline" className="capitalize text-xs">{project.status}</Badge>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4 pt-0">
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
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Proposals */}
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">
                        Project Proposals ({project.proposals?.length || 0}/3)
                      </p>
                      {!project.proposals || project.proposals.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">
                          No proposals submitted yet. Students need to log in and submit their ideas.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {project.proposals.map((proposal, idx) => {
                            const isApproved = project.proposalStatus === "approved" && project.approvedProposalIndex === idx;
                            return (
                              <div
                                key={proposal.id || idx}
                                className={`p-3 rounded-lg border ${
                                  isApproved
                                    ? "bg-green-500/5 border-green-500/30"
                                    : "bg-muted/20 border-border"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">
                                      {idx + 1}. {proposal.title}
                                    </p>
                                    {proposal.description && (
                                      <p className="text-xs text-muted-foreground mt-1">{proposal.description}</p>
                                    )}
                                  </div>
                                  {isApproved ? (
                                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 shrink-0">
                                      <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                                    </Badge>
                                  ) : project.proposalStatus !== "approved" ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="shrink-0 text-xs"
                                      disabled={isApproving === `${project.id}-${idx}`}
                                      onClick={() => handleApproveProposal(project.id, idx, proposal.title)}
                                    >
                                      <ThumbsUp className="w-3 h-3 mr-1" />
                                      {isApproving === `${project.id}-${idx}` ? "Approving..." : "Approve"}
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
    </div>
  );
};

export default GroupingPage;
