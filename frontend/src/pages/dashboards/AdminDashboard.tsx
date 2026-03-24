// ============================================================
// Admin Dashboard - Professional User Management
// Fetches live users from the backend, shows temp passwords in table
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, FolderOpen, Shield, Settings, Trash2, Eye, EyeOff, RefreshCw, Copy, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import userService from "@/api/userService";
import { UserRole, User } from "@/types";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Map of userId -> tempPassword, only stored in memory (never saved to DB)
  const [tempPasswords, setTempPasswords] = useState<Record<string, string>>({});
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student" as UserRole,
    department: "",
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userService.getAll();
      setUsers(res.data.users);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) {
        toast.error("Session expired. Please log in again.");
      } else if (status === 403) {
        toast.error("You don't have permission to view users.");
      } else {
        toast.error("Could not load users from server.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await userService.create(formData);
      const { user, tempPassword } = response.data;
      // store temp password in state so it shows in table
      setTempPasswords((prev) => ({ ...prev, [user.id]: tempPassword }));
      setVisiblePasswords((prev) => ({ ...prev, [user.id]: true }));
      setUsers((prev) => [user, ...prev]);
      setIsDialogOpen(false);
      setFormData({ name: "", email: "", role: "student" as UserRole, department: "" });
      toast.success(`Account created for ${user.name}`, {
        description: "Share the temporary password shown in the table with them.",
      });
    } catch (error: any) {
      toast.error("Failed to create user", {
        description: error.response?.data?.message || "An error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await userService.delete(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User deleted successfully.");
    } catch {
      toast.error("Failed to delete user.");
    }
  };

  const handleCopyPassword = (userId: string) => {
    navigator.clipboard.writeText(tempPasswords[userId]);
    toast.info("Password copied to clipboard!");
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const roleBreakdown = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">System administration and user management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{users.length}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{roleBreakdown["student"] || 0}</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{(roleBreakdown["staff"] || 0) + (roleBreakdown["coordinator"] || 0)}</p>
              <p className="text-xs text-muted-foreground">Staff</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">Active</p>
              <p className="text-xs text-muted-foreground">System Status</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">User Management</CardTitle>
              <CardDescription>Manage all system users. Temporary passwords are shown once and cleared after first login.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={fetchUsers} disabled={isLoading}>
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gradient-primary text-primary-foreground text-xs">+ Add User</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleCreateUser}>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>
                        Create a new account. A temporary password will appear in the table — share it with the user, and it disappears after they log in and change it.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="coordinator">Coordinator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" required placeholder="e.g. Computer Science" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create User"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">User</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Email</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Role</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Department</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Temp Password</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Loading users...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No users found. Add your first user above.</td></tr>
                ) : (
                  users.map((u) => {
                    const initials = u.name.split(" ").map((n) => n[0]).join("");
                    const tempPw = tempPasswords[u.id];
                    const isVisible = visiblePasswords[u.id];
                    return (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7">
                              <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">{initials}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">{u.email}</td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="capitalize text-xs">{u.role}</Badge>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">{u.department}</td>
                        <td className="py-3 px-2">
                          {/* Show temp password if available and still pending (new user just created) */}
                          {(tempPw && u.mustChangePassword) ? (
                            <div className="flex items-center gap-1.5">
                              <code className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-mono border border-amber-500/20">
                                {isVisible ? tempPw : "••••••••••••"}
                              </code>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground" onClick={() => togglePasswordVisibility(u.id)}>
                                {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground" onClick={() => handleCopyPassword(u.id)}>
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : u.mustChangePassword ? (
                            /* User still hasn't logged in and changed their password */
                            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Pending login
                            </span>
                          ) : (
                            /* User has successfully changed their password */
                            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Password set
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteUser(u.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
