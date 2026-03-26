// ============================================================
// Admin: Group Analysis
// Read-only overarching system view of all departments and groups.
// ============================================================

import { useState, useMemo, useEffect } from "react";
import { projectService } from "@/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, LayoutDashboard, Loader2, Target, ShieldCheck, Download } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types";

const AdminGroupAnalysisPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await projectService.getAll();
      setProjects(res.data);
    } catch (error) {
      toast.error("Failed to load group analysis data");
    } finally {
      setIsLoading(false);
    }
  };

  const departments = useMemo(() => {
    const depts = projects.map(p => p.department).filter(Boolean);
    return [...new Set(depts)] as string[];
  }, [projects]);

  const totalAssignedStudents = projects.reduce((acc, p) => acc + p.groupMembers.length, 0);

  const handleDownloadCSV = (projectsToDownload: Project[], filename: string) => {
    if (projectsToDownload.length === 0) {
      toast.info("No groups to export.");
      return;
    }

    const headers = ["Group Title", "Department", "Status", "Proposal Status", "Members", "Advisor", "Examiner"];
    
    const rows = projectsToDownload.map(p => {
      const members = p.groupMembers.map((m: any) => typeof m === "object" ? m.name : "Unknown").join(" | ");
      const advisor = p.advisorId ? (typeof p.advisorId === "object" ? (p.advisorId as any).name : "Assigned") : "Pending";
      const examiner = p.examinerId ? (typeof p.examinerId === "object" ? (p.examinerId as any).name : "Assigned") : "Pending";
      
      return [
        `"${p.title}"`,
        `"${p.department || 'N/A'}"`,
        `"${p.status}"`,
        `"${p.proposalStatus}"`,
        `"${members}"`,
        `"${advisor}"`,
        `"${examiner}"`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Group Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            System-wide read-only overview of all organized project groups.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => handleDownloadCSV(projects, "All_Groups_Export")}
          disabled={isLoading || projects.length === 0}
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export All Groups
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? "..." : projects.length}
              </p>
              <p className="text-xs text-muted-foreground">Total Active Groups</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? "..." : totalAssignedStudents}
              </p>
              <p className="text-xs text-muted-foreground">Students Assigned</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? "..." : departments.length}
              </p>
              <p className="text-xs text-muted-foreground">Active Departments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading analysis data...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No groups formed yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs text-center mt-1">
            Coordinators have not yet organized any student project groups.
          </p>
        </div>
      ) : null}

      {/* Groups by department */}
      {departments.map((dept) => {
        const deptGroups = projects.filter((g) => g.department === dept);
        if (deptGroups.length === 0) return null;
        
        return (
          <div key={dept} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {dept}
                </Badge>
                <span className="text-sm text-muted-foreground font-normal">
                  {deptGroups.length} Active Group{deptGroups.length !== 1 ? "s" : ""}
                </span>
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => handleDownloadCSV(deptGroups, `${dept}_Groups_Export`)}
              >
                <Download className="w-4 h-4 mr-1.5" />
                Export {dept}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {deptGroups.map((project, idx) => {
                const isApproved = project.proposalStatus === "approved";
                return (
                  <Card key={project.id} className="shadow-card flex flex-col h-full group">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-sm line-clamp-1 flex items-center gap-2">
                            {project.title}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDownloadCSV([project], `Group_${project.title}_Export`)}
                              title="Download Group Document"
                            >
                              <Download className="w-3 h-3 text-muted-foreground" />
                            </Button>
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            Status: <span className="capitalize text-foreground font-medium">{project.status}</span>
                          </CardDescription>
                        </div>
                        {isApproved && (
                          <Badge className="bg-success/10 text-success border-success/20 shrink-0 text-[10px]">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Approved
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 flex-1">
                      {/* Members list */}
                      <div className="flex-1 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Members ({project.groupMembers.length})</p>
                        {project.groupMembers.map((m: any) => {
                          const member = typeof m === "object" ? m : { _id: m, name: "Unknown", email: "N/A" };
                          const initials = member.name ? member.name.split(" ").map((n: string) => n[0]).join("") : "?";
                          return (
                            <div key={member._id || member.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/40 border border-border/50">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground">{initials}</AvatarFallback>
                              </Avatar>
                              <div className="overflow-hidden">
                                <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Staff Assignment */}
                      <div className="bg-muted/30 rounded-lg p-3 border border-border mt-auto">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Staff Assigned</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Advisor</span>
                            <span className="font-medium text-foreground truncate block">
                              {project.advisorId ? (typeof project.advisorId === "object" ? (project.advisorId as any).name : "Assigned") : "Pending"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Examiner</span>
                            <span className="font-medium text-foreground truncate block">
                              {project.examinerId ? (typeof project.examinerId === "object" ? (project.examinerId as any).name : "Assigned") : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminGroupAnalysisPage;
