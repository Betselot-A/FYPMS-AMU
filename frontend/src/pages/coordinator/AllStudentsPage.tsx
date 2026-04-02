import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  Loader2,
  MoreVertical,
  LayoutGrid,
  Trash2,
  Mail,
  X,
  UserX,
  GraduationCap,
  BookOpen,
  User as UserIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { projectService, userService } from "@/api";
import { User, Project } from "@/types";

const AllStudentsPage = () => {
  const navigate = useNavigate();

  // ── Data ──────────────────────────────────────────────────
  const [students, setStudents] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Filters ───────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  // ── View Group sheet ──────────────────────────────────────
  const [groupSheetOpen, setGroupSheetOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Project | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(false);

  // ── Delete dialog ─────────────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, projectRes] = await Promise.all([
        userService.getAll({ role: "student", limit: 1000 }),
        projectService.getAll(),
      ]);
      setStudents(userRes.data.users);
      setProjects(projectRes.data);
    } catch {
      toast.error("Failed to load student records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Helpers ───────────────────────────────────────────────
  const getStudentProject = (studentId: string) =>
    projects.find((p) =>
      p.groupMembers.some(
        (m) => (typeof m === "string" ? m : m.id) === studentId
      )
    );

  const departments = Array.from(
    new Set(students.map((s) => s.department))
  ).filter(Boolean);

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept =
      deptFilter === "all" || s.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // ── View Group ────────────────────────────────────────────
  const handleViewGroup = async (studentId: string) => {
    const project = getStudentProject(studentId);
    if (!project) {
      toast.error("This student is not assigned to any group.");
      return;
    }
    setGroupSheetOpen(true);
    setSelectedGroup(null);
    setLoadingGroup(true);
    try {
      const res = await projectService.getById(project.id);
      setSelectedGroup(res.data);
    } catch {
      toast.error("Failed to load group details.");
      setGroupSheetOpen(false);
    } finally {
      setLoadingGroup(false);
    }
  };

  // ── Delete Student ────────────────────────────────────────
  const openDeleteDialog = (student: User) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    setDeleting(true);
    try {
      // Step 1: Remove from group if assigned
      const project = getStudentProject(studentToDelete.id);
      if (project) {
        const remainingMembers = project.groupMembers
          .map((m) => (typeof m === "string" ? m : m.id))
          .filter((id) => id !== studentToDelete.id);
        await projectService.update(project.id, {
          groupMembers: remainingMembers,
        });
      }

      // Step 2: Delete user from system
      await userService.delete(studentToDelete.id);

      toast.success(`${studentToDelete.name} has been removed from the system.`);
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      fetchData(); // Refresh list
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to delete student. Check permissions."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">All Students</h1>
          <p className="text-sm text-muted-foreground">
            {students.length} students registered across all departments
          </p>
        </div>

        {/* Table Card */}
        <Card className="border shadow-sm">
          {/* Filters */}
          <CardHeader className="p-4 border-b bg-muted/20">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background text-sm px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">All Departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                <p className="text-sm">Loading students...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/10 text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                      <th className="text-left py-3 px-6">Student</th>
                      <th className="text-left py-3 px-6">Email</th>
                      <th className="text-left py-3 px-6">Department</th>
                      <th className="text-left py-3 px-6">Group Assigned</th>
                      <th className="text-right py-3 px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-20 text-center text-muted-foreground"
                        >
                          <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No students found.</p>
                        </td>
                      </tr>
                    )}
                    {filtered.map((s) => {
                      const project = getStudentProject(s.id);
                      return (
                        <tr
                          key={s.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          {/* Student */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 rounded-lg">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold rounded-lg">
                                  {getInitials(s.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-foreground">
                                {s.name}
                              </span>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-4 px-6 text-muted-foreground">
                            {s.email}
                          </td>

                          {/* Department */}
                          <td className="py-4 px-6">
                            {s.department ? (
                              <Badge variant="secondary" className="font-normal">
                                {s.department}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground/60 italic text-xs">
                                Not set
                              </span>
                            )}
                          </td>

                          {/* Group Assigned */}
                          <td className="py-4 px-6">
                            {project ? (
                              <span className="text-foreground font-medium truncate max-w-[180px] block">
                                {project.title}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/60 italic text-xs">
                                Not assigned
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8 rounded-lg"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 rounded-xl shadow-lg"
                              >
                                {/* Send Message */}
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(
                                      `/dashboard/coordinator/announcements?userId=${s.id}`
                                    )
                                  }
                                  className="gap-2 cursor-pointer"
                                >
                                  <Mail className="w-4 h-4 text-primary" />
                                  <span>Send Message</span>
                                </DropdownMenuItem>

                                {/* View Group */}
                                <DropdownMenuItem
                                  onClick={() => handleViewGroup(s.id)}
                                  disabled={!project}
                                  className="gap-2 cursor-pointer"
                                >
                                  <LayoutGrid className="w-4 h-4 text-primary" />
                                  <span>View Group</span>
                                  {!project && (
                                    <span className="ml-auto text-[10px] text-muted-foreground italic">
                                      None
                                    </span>
                                  )}
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* Delete */}
                                <DropdownMenuItem
                                  onClick={() => openDeleteDialog(s)}
                                  className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete Student</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── View Group Sheet ──────────────────────────────────── */}
      <Sheet open={groupSheetOpen} onOpenChange={setGroupSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-lg font-bold">Group Details</SheetTitle>
            <SheetDescription>
              Group assignment and setup for this student.
            </SheetDescription>
          </SheetHeader>

          {loadingGroup ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-7 h-7 animate-spin mb-3" />
              <p className="text-sm">Loading group data...</p>
            </div>
          ) : selectedGroup ? (
            <div className="space-y-6">
              {/* Group Title */}
              <div className="rounded-xl border bg-muted/20 p-4 space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">
                  Group / Project Title
                </p>
                <p className="text-base font-semibold text-foreground">
                  {selectedGroup.finalTitle || selectedGroup.title || "Untitled Group"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedGroup.status || "pending"}
                  </Badge>
                  {selectedGroup.proposalStatus && (
                    <Badge variant="secondary" className="text-xs">
                      Proposal: {selectedGroup.proposalStatus}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Group Members */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">
                    Group Members ({selectedGroup.groupMembers?.length || 0})
                  </p>
                </div>
                {selectedGroup.groupMembers?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedGroup.groupMembers.map((m: any) => {
                      const member = typeof m === "string" ? { id: m, name: m, email: "" } : m;
                      return (
                        <div
                          key={member.id || member._id}
                          className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2"
                        >
                          <Avatar className="w-7 h-7 rounded-md">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs rounded-md">
                              {getInitials(member.name || "?")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {member.name}
                            </p>
                            {member.email && (
                              <p className="text-xs text-muted-foreground truncate">
                                {member.email}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No members found.</p>
                )}
              </div>

              <Separator />

              {/* Advisor */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Advisor</p>
                </div>
                {selectedGroup.advisorId ? (
                  <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
                    <Avatar className="w-7 h-7 rounded-md">
                      <AvatarFallback className="bg-blue-500/10 text-blue-500 text-xs rounded-md">
                        {getInitials(
                          (typeof selectedGroup.advisorId === "string"
                            ? "Advisor"
                            : (selectedGroup.advisorId as any).name) || "A"
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {typeof selectedGroup.advisorId === "string"
                          ? "Advisor Assigned"
                          : (selectedGroup.advisorId as any).name}
                      </p>
                      {typeof selectedGroup.advisorId !== "string" &&
                        (selectedGroup.advisorId as any).email && (
                          <p className="text-xs text-muted-foreground">
                            {(selectedGroup.advisorId as any).email}
                          </p>
                        )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No advisor assigned yet.
                  </p>
                )}
              </div>

              {/* Examiner */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Examiner</p>
                </div>
                {selectedGroup.examinerId ? (
                  <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
                    <Avatar className="w-7 h-7 rounded-md">
                      <AvatarFallback className="bg-violet-500/10 text-violet-500 text-xs rounded-md">
                        {getInitials(
                          (typeof selectedGroup.examinerId === "string"
                            ? "Examiner"
                            : (selectedGroup.examinerId as any).name) || "E"
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {typeof selectedGroup.examinerId === "string"
                          ? "Examiner Assigned"
                          : (selectedGroup.examinerId as any).name}
                      </p>
                      {typeof selectedGroup.examinerId !== "string" &&
                        (selectedGroup.examinerId as any).email && (
                          <p className="text-xs text-muted-foreground">
                            {(selectedGroup.examinerId as any).email}
                          </p>
                        )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No examiner assigned yet.
                  </p>
                )}
              </div>

              <Separator />

              {/* Go to Group Management */}
              <Button
                className="w-full"
                onClick={() => {
                  setGroupSheetOpen(false);
                  navigate("/dashboard/coordinator/grouping");
                }}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Manage Group in Grouping Page
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <UserX className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No group data available.</p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Delete Confirmation Dialog ────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Delete Student
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">
                Are you sure you want to permanently delete{" "}
                <strong className="text-foreground">
                  {studentToDelete?.name}
                </strong>
                ?
              </span>
              <span className="block text-sm bg-destructive/10 text-destructive rounded-lg px-3 py-2">
                ⚠ This will remove the student from the system{" "}
                {getStudentProject(studentToDelete?.id || "")
                  ? "and from their assigned group"
                  : ""}
                . This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Yes, Delete Student
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AllStudentsPage;
