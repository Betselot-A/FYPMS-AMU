// ============================================================
// Admin: System Settings
// System name, academic year, evaluation weights, notifications
// ============================================================

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, Settings, GraduationCap, BarChart3, Bell } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminSettingsPage = () => {
  const [systemName, setSystemName] = useState("ProjectHub");
  const [academicYear, setAcademicYear] = useState("2025/2026");
  const [semester, setSemester] = useState("2");

  const [weights, setWeights] = useState({
    advisor: 35,
    coordinator: 15,
    examiner: 20,
    documentation: 30,
  });

  const [notifications, setNotifications] = useState({
    emailOnSubmission: true,
    emailOnGrade: true,
    emailOnAnnouncement: true,
    emailOnDeadline: false,
  });

  const totalWeight = Object.values(weights).reduce((sum, v) => sum + v, 0);

  const handleSave = () => {
    if (totalWeight !== 100) {
      toast({ title: "Error", description: "Evaluation weights must total 100%.", variant: "destructive" });
      return;
    }
    toast({ title: "Settings Saved", description: "System settings have been updated." });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">System Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure system-wide preferences</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-1.5" /> Save All
        </Button>
      </div>

      <div className="space-y-6">
        {/* System Info */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">General</CardTitle>
            </div>
            <CardDescription>System name and branding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-sm">
              <Label className="text-sm">System Name</Label>
              <Input
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                placeholder="e.g. ProjectHub"
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Year */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Academic Period</CardTitle>
            </div>
            <CardDescription>Current academic year and semester</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
              <div>
                <Label className="text-sm">Academic Year</Label>
                <Input
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2025/2026"
                />
              </div>
              <div>
                <Label className="text-sm">Semester</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="summer">Summer</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Weights */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Evaluation Weights</CardTitle>
              </div>
              <Badge
                variant="outline"
                className={
                  totalWeight === 100
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                }
              >
                Total: {totalWeight}%{totalWeight !== 100 && " (must be 100%)"}
              </Badge>
            </div>
            <CardDescription>Percentage weight for each evaluation component</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              {(Object.keys(weights) as Array<keyof typeof weights>).map((key) => (
                <div key={key} className="flex items-center gap-3">
                  <Label className="text-sm capitalize flex-1">{key}</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={weights[key]}
                      onChange={(e) =>
                        setWeights((prev) => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))
                      }
                      className="w-20 text-center"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Notification Preferences</CardTitle>
            </div>
            <CardDescription>Control system-wide email notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-md">
              {[
                { key: "emailOnSubmission" as const, label: "Email on new submission" },
                { key: "emailOnGrade" as const, label: "Email when grades are posted" },
                { key: "emailOnAnnouncement" as const, label: "Email on new announcement" },
                { key: "emailOnDeadline" as const, label: "Email deadline reminders" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <Label className="text-sm">{item.label}</Label>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
