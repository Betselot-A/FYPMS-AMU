import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Filter, Loader2, Mail, GraduationCap, Folder } from "lucide-react";
import projectService from "@/api/projectService";
import userService from "@/api/userService";
import { Project, User } from "@/types";
import { toast } from "sonner";

const GroupedPage = () => {
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDept) {
      fetchGroupedProjects();
    } else {
      setProjects([]);
    }
  }, [selectedDept]);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getDepartments();
      setDepartments(res.data);
    } catch (error) {
      toast.error("Failed to fetch department list.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroupedProjects = async () => {
    setIsDataLoading(true);
    try {
      const res = await projectService.getAll({
        department: selectedDept,
      });
      setProjects(res.data);
    } catch (error) {
      toast.error("Failed to fetch groupings.");
    } finally {
      setIsDataLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-medium text-foreground tracking-tight">Student Groupings</h1>
          <p className="text-muted-foreground text-sm mt-1">Official list of project teams and their registered members</p>
        </div>
      </div>

      <Card className="shadow-card border-none bg-background/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Filter className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Academic Filter</span>
          </div>
          <CardTitle className="text-lg font-semibold tracking-tight">Department Lookup</CardTitle>
          <CardDescription>Select a department to retrieve live grouping records from the database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            {isLoading ? (
               <div className="h-12 w-full bg-muted/20 animate-pulse rounded-md flex items-center px-4">
                  <Loader2 className="w-4 h-4 animate-spin text-primary/40 mr-2" />
                  <span className="text-sm text-muted-foreground font-medium italic">Loading departments...</span>
               </div>
            ) : (
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all shadow-sm">
                  <SelectValue placeholder="--- Select Subject Dept ---" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground italic">No departments found in records</div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedDept && (
         <Card className="shadow-card border-none animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden bg-background/60 backdrop-blur-sm">
          <CardHeader className="border-b border-border/40 bg-muted/20 py-4 px-8">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground/80">
              <Users className="w-4 h-4 text-primary" />
              Verified Project Groups: <span className="text-primary">{selectedDept}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isDataLoading ? (
              <div className="py-24 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary/20 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground font-medium italic">Synchronizing with registry...</p>
              </div>
            ) : projects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/40">
                      <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 w-56">Group Identifier</th>
                      <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">Team Membership</th>
                      <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 text-center w-40">Group Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-muted/40 transition-all duration-200">
                        <td className="px-8 py-8 align-top">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Folder className="w-4 h-4" />
                              </div>
                              <span className="text-base font-bold text-foreground tracking-tight">{project.title}</span>
                            </div>
                            <div className="pl-10">
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-primary/10">Official Group</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                           <div className="grid grid-cols-1 gap-6">
                            {(project.groupMembers as User[]).map((member) => (
                               <div key={member.id} className="flex items-center gap-4 animate-in fade-in duration-300">
                                <div className="w-10 h-10 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-primary text-xs font-bold ring-2 ring-primary/5">
                                  {member.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-foreground/90">{member.name}</span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] font-bold text-primary px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10 tracking-tight">
                                      {member.studentId || "NO_ID"}
                                    </span>
                                    <span className="text-xs text-muted-foreground/60 flex items-center gap-1.5 ml-2">
                                      <Mail className="w-3 h-3" />
                                      {member.email}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                           </div>
                        </td>
                        <td className="px-8 py-8 align-top">
                           <div className="flex justify-center">
                              <div className={`px-3 py-1.5 rounded-md border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                                project.status === 'completed' 
                                  ? 'bg-success/10 text-success border-success/20' 
                                  : 'bg-primary/5 text-primary border-primary/20'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${project.status === 'completed' ? 'bg-success animate-pulse' : 'bg-primary'}`} />
                                {project.status.replace('-', ' ')}
                              </div>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4 border border-primary/5">
                  <Users className="w-10 h-10 text-primary/20" />
                </div>
                <h3 className="text-xl font-bold text-foreground tracking-tight">No project groups found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2 italic">
                  Academic records for <span className="font-bold text-primary not-italic">{selectedDept}</span> show no official project groups formed yet.
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
