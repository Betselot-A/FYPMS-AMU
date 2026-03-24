// ============================================================
// Student: Edit Profile Page
// ============================================================

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EditProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [department, setDepartment] = useState(user?.department || "");

  if (!user) return null;

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Profile updated", description: "Your profile changes have been saved." });
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-1">Edit Profile</h1>
      <p className="text-muted-foreground text-sm mb-6">Update your personal information.</p>

      <Card className="shadow-card max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <CardDescription className="capitalize">{user.role} · {user.department}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" value={email} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Email cannot be changed. Contact admin.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-dept">Department</Label>
              <Input id="profile-dept" value={department} onChange={(e) => setDepartment(e.target.value)} required />
            </div>
            <Button type="submit" className="gradient-primary text-primary-foreground">
              <UserPen className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfilePage;
