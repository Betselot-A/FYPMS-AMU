// ============================================================
// Admin: Password Management
// Default password settings, reset user passwords
// ============================================================

import { useState } from "react";
import { mockUsers } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Key, RefreshCw, Shield, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PasswordManagementPage = () => {
  const [defaultPassword, setDefaultPassword] = useState("Welcome@123");
  const [resetUserId, setResetUserId] = useState<string | null>(null);

  const handleSaveDefault = () => {
    if (!defaultPassword.trim()) {
      toast({ title: "Error", description: "Default password cannot be empty.", variant: "destructive" });
      return;
    }
    toast({ title: "Saved", description: "Default password updated." });
  };

  const handleResetPassword = (userId: string, userName: string) => {
    toast({
      title: "Password Reset",
      description: `${userName}'s password has been reset to the default. They will be asked to change it on next login.`,
    });
    setResetUserId(null);
  };

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
              <Label className="text-sm">Default Password</Label>
              <Input
                type="text"
                value={defaultPassword}
                onChange={(e) => setDefaultPassword(e.target.value)}
                placeholder="Enter default password"
              />
            </div>
            <Button onClick={handleSaveDefault}>
              <Save className="w-4 h-4 mr-1.5" /> Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset individual users */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Reset User Passwords</CardTitle>
          </div>
          <CardDescription>Reset a user's password to the default value</CardDescription>
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
                {mockUsers.map((u) => {
                  const initials = u.name.split(" ").map((n) => n[0]).join("");
                  return (
                    <tr key={u.id} className="border-b border-border/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">{initials}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize text-xs">{u.role}</Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetPassword(u.id, u.name)}
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordManagementPage;
