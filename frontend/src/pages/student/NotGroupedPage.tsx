import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserX, Search, Loader2, Mail, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import userService from "@/api/userService";
import { User } from "@/types";
import { toast } from "sonner";

const NotGroupedPage = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUngroupedStudents();
  }, []);

  const fetchUngroupedStudents = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getAll({
        role: "student",
        groupStatus: "ungrouped",
        limit: 1000
      });
      setStudents(res.data.users);
    } catch (error) {
      toast.error("Failed to fetch pending students.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Pending Students</h1>
          <p className="text-muted-foreground text-sm mt-1">List of students who haven't joined a project group yet</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search students..." 
            className="pl-10 h-11 bg-background shadow-sm border-border/50" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="shadow-card border-none bg-background/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-16">No</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Student Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Department</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading pending students...</p>
                    </td>
                  </tr>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-foreground">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-3.5 h-3.5" />
                          {student.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {student.department}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                          <UserX className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">No students found matching your criteria.</p>
                      </div>
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

export default NotGroupedPage;
