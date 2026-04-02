// ============================================================
// Admin: System Settings (Professional)
// Tabbed enterprise configuration panel with general, academic,
// deadlines, and email service management.
// ============================================================

import { useState, useEffect } from "react";
import { settingsService } from "@/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Save, Settings, GraduationCap, Bell, Loader2, Calendar,
  Mail, Server, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import type { SystemSettings } from "@/api/settingsService";

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await settingsService.get();
      setSettings(response.data);
    } catch (error) {
      toast.error("Config Sync Error", { 
        description: "Failed to load system settings from the secure server." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setIsSaving(true);
      await settingsService.update(settings);
      toast.success("Settings Saved", {
        description: "All system configurations have been updated successfully.",
      });
    } catch (error) {
      toast.error("Update Failed", { 
        description: "Could not persist system configuration changes to the database." 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => prev ? { ...prev, [field]: value } : null);
  };

  const isSmtpConfigured = settings?.smtpHost && settings?.smtpUser && settings?.smtpPassword;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">System Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure global preferences for your ProjectHub platform
          </p>
        </div>
        <Button onClick={handleSave} disabled={isLoading || isSaving} className="gradient-primary">
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-1.5" />
          )}
          Save All Changes
        </Button>
      </div>

      {isLoading || !settings ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading system configuration...</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full max-w-2xl grid grid-cols-4 h-10 bg-muted p-1">
            <TabsTrigger value="general" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Settings className="w-3.5 h-3.5" /> General
            </TabsTrigger>
            <TabsTrigger value="academic" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <GraduationCap className="w-3.5 h-3.5" /> Academic
            </TabsTrigger>
            <TabsTrigger value="deadlines" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Calendar className="w-3.5 h-3.5" /> Deadlines
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Mail className="w-3.5 h-3.5" /> Email
              {isSmtpConfigured ? (
                <span className="w-2 h-2 rounded-full bg-success shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: General Settings */}
          <TabsContent value="general" className="space-y-6 animate-fade-in outline-none">
            <Card className="shadow-card">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Platform Identity</CardTitle>
                    <CardDescription>How this system presents itself to users</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <Label className="text-sm font-medium">System Display Name</Label>
                  <Input
                    value={settings.systemName}
                    onChange={(e) => updateField("systemName", e.target.value)}
                    placeholder="e.g. ProjectHub"
                    className="mt-1.5"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5 flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                    This name appears in the sidebar header, emails, and system reports.
                  </p>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Default New User Password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      type={showSmtpPassword ? "text" : "password"}
                      value={settings.defaultPassword}
                      onChange={(e) => updateField("defaultPassword", e.target.value)}
                      placeholder="Welcome@123"
                      className="font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 flex items-start gap-1">
                    <ShieldCheck className="w-3 h-3 shrink-0 mt-0.5" />
                    Applies to bulk CSV imports and all admin-triggered password resets. Users are forced to change on first login.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Academic Period */}
          <TabsContent value="academic" className="space-y-6 animate-fade-in outline-none">
            <Card className="shadow-card">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Academic Period</CardTitle>
                    <CardDescription>Active semester and submission policies</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <p className="text-sm font-medium text-foreground mb-4">
                    Please select the academic year and semester for which this system is currently active.
                  </p>
                  <div className="flex items-end gap-4 p-4 border border-border rounded-lg bg-background">
                    {/* Academic Year Column */}
                    <div className="min-w-[160px]">
                      <Label className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide block mb-2">
                        Academic Year
                      </Label>
                      <Select
                        value={String(settings.academicYear)}
                        onValueChange={(val) => updateField("academicYear", parseInt(val))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 2 + i).map((yr) => (
                            <SelectItem key={yr} value={String(yr)}>
                              {yr}/{String(yr + 1).slice(-2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Separator */}
                    <div className="h-10 w-px bg-border self-end" />

                    {/* Semester Column */}
                    <div className="min-w-[140px]">
                      <Label className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide block mb-2">
                        Semester
                      </Label>
                      <Select
                        value={settings.academicSemester}
                        onValueChange={(val) => updateField("academicSemester", val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="I">Semester I</SelectItem>
                          <SelectItem value="II">Semester II</SelectItem>
                          <SelectItem value="III">Semester III</SelectItem>
                          <SelectItem value="IV">Semester IV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action Preview */}
                    <div className="flex items-center h-10 px-4 rounded-md bg-primary/10 border border-primary/20 text-primary text-sm font-semibold shrink-0">
                      {settings.academicYear}/{String(settings.academicYear + 1).slice(-2)} — Sem. {settings.academicSemester}
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Used to categorize and label new projects and submissions by cohort.
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      Allow New Project Proposals
                      {settings.allowProposals ? (
                        <Badge className="bg-success/10 text-success border-success/20 text-[10px] font-normal">Active</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px] font-normal">Locked</Badge>
                      )}
                    </Label>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      When disabled, students will not be able to submit any new project proposals, even if their group is formed.
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowProposals}
                    onCheckedChange={(checked) => updateField("allowProposals", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Deadlines */}
          <TabsContent value="deadlines" className="space-y-6 animate-fade-in outline-none">
            <Card className="shadow-card">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Academic Calendar & Cutoffs</CardTitle>
                    <CardDescription>System-wide date boundaries for the active semester</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <Label className="text-sm font-medium">Proposal Submission Deadline</Label>
                  <Input
                    type="date"
                    value={settings.registrationDeadline ? new Date(settings.registrationDeadline).toISOString().split("T")[0] : ""}
                    onChange={(e) => updateField("registrationDeadline", e.target.value)}
                    className="mt-1.5 max-w-xs"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Students will be prevented from submitting proposals after this date.
                    Works in conjunction with the "Allow Proposals" toggle.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/20 border border-dashed border-border text-center text-muted-foreground text-sm">
                  <Calendar className="w-6 h-6 mx-auto mb-2 opacity-30" />
                  More deadline fields (Midterm Review, Final Submission) can be added here as the system grows.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Email Services */}
          <TabsContent value="email" className="space-y-6 animate-fade-in outline-none">
            <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/20">
              {isSmtpConfigured ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Email Service Active</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Your SMTP credentials are configured. The system can send automated emails for password resets, notifications, and alerts.</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Email Service Not Configured</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Configure your SMTP server below to enable automated email notifications across the platform.</p>
                  </div>
                </>
              )}
            </div>

            <Card className="shadow-card">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center">
                    <Server className="w-4 h-4 text-info" />
                  </div>
                  <div>
                    <CardTitle className="text-base">SMTP Server Configuration</CardTitle>
                    <CardDescription>Outgoing mail server for all platform notifications</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">SMTP Host</Label>
                    <Input
                      value={settings.smtpHost}
                      onChange={(e) => updateField("smtpHost", e.target.value)}
                      placeholder="e.g. smtp.gmail.com"
                      className="mt-1.5 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">SMTP Port</Label>
                    <Input
                      type="number"
                      value={settings.smtpPort}
                      onChange={(e) => updateField("smtpPort", parseInt(e.target.value) || 587)}
                      placeholder="587"
                      className="mt-1.5 font-mono text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">TLS: 587 · SSL: 465 · Neither: 25</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">SMTP Username</Label>
                    <Input
                      value={settings.smtpUser}
                      onChange={(e) => updateField("smtpUser", e.target.value)}
                      placeholder="your@email.com"
                      className="mt-1.5"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">SMTP Password</Label>
                    <div className="relative mt-1.5">
                      <Input
                        type={showSmtpPassword ? "text" : "password"}
                        value={settings.smtpPassword}
                        onChange={(e) => updateField("smtpPassword", e.target.value)}
                        placeholder="App password or API key"
                        className="font-mono pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">From Address</Label>
                  <Input
                    value={settings.emailFrom}
                    onChange={(e) => updateField("emailFrom", e.target.value)}
                    placeholder="noreply@projecthub.edu"
                    className="mt-1.5 max-w-xs"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    All automated system emails will be sent <em>from</em> this address.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-dashed bg-muted/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-sm text-muted-foreground">When Will Emails Be Sent?</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {[
                    "Admin resets a user's password → Temporary credential email sent",
                    "Coordinator approves a group proposal → Students notified",
                    "New submission deadline is approaching → Reminder sent to groups",
                    "Bulk CSV users imported → Welcome email with login credentials",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminSettingsPage;
