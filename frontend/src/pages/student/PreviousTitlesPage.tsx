import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import projectService from "@/api/projectService";
import { Project } from "@/types";
import { toast } from "sonner";

const PreviousTitlesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPreviousTitles();
  }, []);

  const fetchPreviousTitles = async () => {
    setIsLoading(true);
    try {
      // Fetch all projects that are either completed or have an approved proposal
      // In this context, "Previous Titles" repository includes all successfully proposed titles.
      const res = await projectService.getAll({
        proposalStatus: "approved",
      });
      setProjects(res.data);
    } catch (error) {
      toast.error("Failed to fetch previous project titles.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.finalTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedProjects = filteredProjects.slice(0, parseInt(entriesPerPage));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Previous Batch Titles</h1>
        <p className="text-muted-foreground text-sm mt-1">Explore titles from previous years to find inspiration and avoid duplication</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
            <SelectTrigger className="w-20 h-9 bg-background border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">entries</span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search titles..." 
            className="pl-10 h-10 bg-background shadow-sm border-border/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="shadow-card border-none bg-background overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-16">No</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-32">Department</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Fetching titles repository...</p>
                    </td>
                  </tr>
                ) : paginatedProjects.length > 0 ? (
                    paginatedProjects.map((project, idx) => (
                    <tr key={project.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{idx + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{project.finalTitle}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded w-fit capitalize">
                          <GraduationCap className="w-3 h-3" />
                          {project.department || "N/A"}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-20 text-center text-muted-foreground text-sm italic">
                      No titles found match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {!isLoading && projects.length > 0 && (
            <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing 1 to {Math.min(paginatedProjects.length, parseInt(entriesPerPage))} of {filteredProjects.length} entries
              </p>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded bg-muted/50 border border-border/50 hover:bg-muted transition-colors disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded bg-primary text-primary-foreground text-xs font-bold">1</button>
                <button className="p-1.5 rounded bg-muted/50 border border-border/50 hover:bg-muted transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PreviousTitlesPage;
