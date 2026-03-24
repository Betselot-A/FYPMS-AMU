// ============================================================
// Coordinator: Announcements with date management
// ============================================================

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Plus, Calendar, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  target: "all" | "students" | "staff";
}

const initialAnnouncements: Announcement[] = [
  { id: "a1", title: "Project Proposal Deadline Extended", content: "The deadline for project proposals has been extended to November 15, 2025.", date: "2025-10-20", target: "all" },
  { id: "a2", title: "Presentation Schedule Published", content: "Final presentation schedule is now available. Please check your assigned slots.", date: "2025-11-01", target: "students" },
];

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", date: "", target: "all" as Announcement["target"] });

  const handleCreate = () => {
    if (!form.title.trim() || !form.content.trim() || !form.date) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    const newAnnouncement: Announcement = {
      id: `a${Date.now()}`,
      ...form,
    };
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    setForm({ title: "", content: "", date: "", target: "all" });
    setShowForm(false);
    toast({ title: "Announcement Created", description: "Your announcement has been published." });
  };

  const handleDelete = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast({ title: "Deleted", description: "Announcement removed." });
  };

  const targetColors: Record<string, string> = {
    all: "bg-primary/10 text-primary border-primary/20",
    students: "bg-info/10 text-info border-info/20",
    staff: "bg-warning/10 text-warning border-warning/20",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Announcements</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage system announcements</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Announcement
        </Button>
      </div>

      {showForm && (
        <Card className="shadow-card mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Create Announcement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Title</Label>
              <Input
                placeholder="Announcement title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">Content</Label>
              <Textarea
                placeholder="Announcement content..."
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm">Target Audience</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.target}
                  onChange={(e) => setForm((f) => ({ ...f, target: e.target.value as Announcement["target"] }))}
                >
                  <option value="all">All Users</option>
                  <option value="students">Students Only</option>
                  <option value="staff">Staff Only</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Publish</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {announcements.map((a) => (
          <Card key={a.id} className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Megaphone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground">{a.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{a.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {a.date}
                      </span>
                      <Badge variant="outline" className={`text-xs ${targetColors[a.target]}`}>
                        {a.target === "all" ? "All Users" : a.target === "students" ? "Students" : "Staff"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive h-8 w-8 p-0"
                  onClick={() => handleDelete(a.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
