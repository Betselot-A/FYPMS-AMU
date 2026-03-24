// ============================================================
// Coordinator: View all students
// ============================================================

import { mockUsers, mockProjects } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Users, Search } from "lucide-react";
import { useState } from "react";

const students = mockUsers.filter((u) => u.role === "student");

const AllStudentsPage = () => {
  const [search, setSearch] = useState("");

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

  const getStudentProject = (studentId: string) =>
    mockProjects.find((p) => p.groupMembers.includes(studentId));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">All Students</h1>
        <p className="text-sm text-muted-foreground mt-1">View all registered students and their project assignments</p>
      </div>

      <div className="mb-4 relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Student</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Department</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Project</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const project = getStudentProject(s.id);
                  const initials = s.name.split(" ").map((n) => n[0]).join("");
                  return (
                    <tr key={s.id} className="border-b border-border/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">{initials}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{s.email}</td>
                      <td className="py-3 px-4 text-muted-foreground">{s.department}</td>
                      <td className="py-3 px-4 text-foreground">{project?.title || "—"}</td>
                      <td className="py-3 px-4">
                        {project ? (
                          <Badge variant="outline" className="capitalize text-xs">{project.status}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">Unassigned</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No students found.
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

export default AllStudentsPage;
