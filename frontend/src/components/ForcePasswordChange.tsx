// ============================================================
// Force Password Change Component
// Intercepts first-time logins built by the Admin
// ============================================================

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import authService from "@/api/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";

const ForcePasswordChange = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      // Re-fetch user profile from backend — mustChangePassword is now false
      await refreshUser();
      toast.success("Password changed! Welcome to the system.");
      // Navigate to dashboard — DashboardPage will now render the role dashboard
      // since mustChangePassword is false
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      toast.error("Failed to change password", {
        description: error.response?.data?.message || "Invalid current password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl gradient-primary mb-4 p-3 shadow-lg">
          <ShieldAlert className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold font-display">Action Required</h1>
        <p className="text-muted-foreground mt-2">
          Hello {user?.name.split(" ")[0]}! Your account was created by an administrator.
          Please secure your account with a permanent password before continuing.
        </p>
      </div>

      <Card className="shadow-elevated border-border">
        <CardHeader>
          <CardTitle>Set Permanent Password</CardTitle>
          <CardDescription>Choose a strong password for future logins.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Temporary Password</Label>
              <Input
                id="currentPassword"
                type="password"
                required
                placeholder="Enter the password you just logged in with"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                placeholder="Type your new password again"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "Change Password & Go to Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForcePasswordChange;
