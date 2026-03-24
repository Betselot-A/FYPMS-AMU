// ============================================================
// Admin: Student Grouping
// Auto-group students by department, sorted by CGPA (highest first)
// Max 4 students per group
// ============================================================

import { useState, useMemo } from "react";
import { mockUsers } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Shuffle, Save, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { User as UserType } from "@/types";

const MAX_GROUP_SIZE = 4;

const autoGroup = (students: UserType[]) => {
  // Group by department
  const byDept: Record<string, UserType[]> = {};
  students.forEach((s) => {
    if (!byDept[s.department]) byDept[s.department] = [];
    byDept[s.department].push(s);
  });

  const groups: { department: string; members: UserType[] }[] = [];

  Object.entries(byDept).forEach(([dept, deptStudents]) => {
    // Sort by CGPA descending (highest first)
    const sorted = [...deptStudents].sort((a, b) => (b.cgpa ?? 0) - (a.cgpa ?? 0));

    // Chunk into groups of max 4
    for (let i = 0; i < sorted.length; i += MAX_GROUP_SIZE) {
      groups.push({
        department: dept,
        members: sorted.slice(i, i + MAX_GROUP_SIZE),
      });
    }
  });

  return groups;
};

const StudentGroupingPage = () => {
  const students = mockUsers.filter((u) => u.role === "student");
  const [groups, setGroups] = useState(() => autoGroup(students));

  const handleRegenerate = () => {
    setGroups(autoGroup(students));
    toast({ title: "Groups Regenerated", description: "Students re-grouped by department and CGPA." });
  };

  const handleSave = () => {
    toast({ title: "Groups Saved", description: `${groups.length} groups have been saved.` });
  };

  const departments = [...new Set(students.map((s) => s.department))];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Student Grouping</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Auto-grouped by department, sorted by CGPA (highest first), max {MAX_GROUP_SIZE} per group
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRegenerate}>
            <Shuffle className="w-4 h-4 mr-1.5" /> Regenerate
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-1.5" /> Save Groups
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{students.length}</p>
              <p className="text-xs text-muted-foreground">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{groups.length}</p>
              <p className="text-xs text-muted-foreground">Groups Formed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{departments.length}</p>
              <p className="text-xs text-muted-foreground">Departments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups by department */}
      {departments.map((dept) => {
        const deptGroups = groups.filter((g) => g.department === dept);
        return (
          <div key={dept} className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {dept}
              </Badge>
              <span className="text-sm text-muted-foreground font-normal">
                {deptGroups.length} group{deptGroups.length !== 1 ? "s" : ""}
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deptGroups.map((group, idx) => (
                <Card key={idx} className="shadow-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Group {idx + 1}</span>
                      <Badge variant="outline" className="text-xs">
                        {group.members.length}/{MAX_GROUP_SIZE}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {group.members.map((m, mIdx) => {
                      const initials = m.name.split(" ").map((n) => n[0]).join("");
                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 border border-border"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground">{m.name}</p>
                              <p className="text-[10px] text-muted-foreground">{m.email}</p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              mIdx === 0
                                ? "bg-success/10 text-success border-success/20 text-xs"
                                : "text-xs"
                            }
                          >
                            {m.cgpa?.toFixed(2) ?? "—"}
                          </Badge>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StudentGroupingPage;
