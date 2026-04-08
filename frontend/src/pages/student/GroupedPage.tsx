import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Filter, Loader2, Mail, GraduationCap } from "lucide-react";
import userService from "@/api/userService";
import { User } from "@/types";
import { toast } from "sonner";

const departments = ["IT", "CS", "SE", "SE-A", "SE-B"];

const GroupedPage = () => {
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedDept) {
      fetchGroupedStudents();
    }
  }, [selectedDept]);

  const fetchGroupedStudents = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getAll({
        role: "student",
        department: selectedDept,
        groupStatus: "grouped",
        limit: 1000
      });
      setStudents(res.data.users);
    } catch (error) {
      toast.error("Failed to fetch grouped students.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Student Groupings</h1>
          <p className="text-muted-foreground text-sm mt-1">View list of students joined in project groups by department</p>
        </div>
      </div>

      <Card className="shadow-card border-none bg-background/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Filter Results</span>
          </div>
          <CardTitle className="text-lg">Select Department</CardTitle>
          <CardDescription>Choose a department to see its grouped students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="h-12 bg-muted/30 border-border/50 focus:ring-primary/20 transition-all">
                <SelectValue placeholder="--- Subject Dept ---" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedDept && (
         <Card className="shadow-card border-none animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
          <CardHeader className="border-b bg-muted/10">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Grouped Students in {selectedDept}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary/40 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Fetching group data...</p>
              </div>
            ) : students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-muted/30 border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Student Name</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Department</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-muted/20 transition-colors">
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
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary/20" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No students found</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                  No grouped students were found for the {selectedDept} department.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GroupedPage;
