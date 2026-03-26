// ============================================================
// Admin: Password Management
// Default password settings, reset user passwords
// ============================================================

import { useState, useEffect } from "react";
import { userService, settingsService } from "@/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Key, RefreshCw, Shield, Save, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import type { User as UserType } from "@/types";

const PasswordManagementPage = () => {
  const [defaultPassword, setDefaultPassword] = useState("Welcome@123");
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDefault, setIsSavingDefault] = useState(false);
  const [resettingId, setResettingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [settingsRes, usersRes] = await Promise.all([
        settingsService.get(),
        userService.getAll({ limit: 1000 }), // Get all users for administration
      ]);
      setDefaultPassword(settingsRes.data.defaultPassword);
      setUsers(usersRes.data.users);
    } catch (error) {
      toast.error("Failed to load security settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDefault = async () => {
    if (!defaultPassword.trim()) {
      toast.error("Default password cannot be empty.");
      return;
    }
    try {
      setIsSavingDefault(true);
      await settingsService.update({ defaultPassword });
      toast.success("System default password updated successfully.");
    } catch (error) {
      toast.error("Failed to update default password");
    } finally {
      setIsSavingDefault(false);
    }
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    try {
      setResettingId(userId);
      await userService.resetPassword(userId);
      toast.success(`${userName}'s password has been reset to the default. They must change it on next login.`);
    } catch (error) {
      toast.error(`Failed to reset password for ${userName}`);
    } finally {
      setResettingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Password Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Set default password and reset user credentials</p>
      </div>

      {/* Default password setting */}
      <Card className="shadow-card mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Default Password</CardTitle>
          </div>
          <CardDescription>New users and password resets will use this default. Users will be prompted to change on first login.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label className="text-sm">System-wide Default</Label>
              <Input
                type="text"
                value={defaultPassword}
                onChange={(e) => setDefaultPassword(e.target.value)}
                placeholder="Enter default password"
                disabled={isLoading || isSavingDefault}
              />
            </div>
            <Button onClick={handleSaveDefault} disabled={isLoading || isSavingDefault}>
              {isSavingDefault ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1.5" />
              )}
              Save Config
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset individual users */}
      <Card className="shadow-card">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-base font-bold">Reset User Passwords</CardTitle>
                <CardDescription>Reset a user's password to the default value</CardDescription>
              </div>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Filter by name or email..." 
                className="pl-9 h-9 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">User</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const initials = u.name.split(" ").map((n) => n[0]).join("");
                  const isResetting = resettingId === u.id;
                  return (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className="text-[10px] bg-sidebar-accent text-sidebar-foreground">{initials}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`capitalize text-[10px] px-2 py-0 h-5 font-normal ${
                          u.role === 'admin' ? 'border-primary/30 text-primary bg-primary/5' : ''
                        }`}>{u.role}</Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{u.email}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary hover:text-primary hover:bg-primary/10 h-8 gap-1.5"
                          onClick={() => handleResetPassword(u.id, u.name)}
                          disabled={isResetting || isLoading}
                        >
                          {isResetting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                          Reset
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted-foreground italic">
                      No users found matching your search.
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordManagementPage;
