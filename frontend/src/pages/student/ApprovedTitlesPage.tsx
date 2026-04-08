import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Search, Loader2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import projectService from "@/api/projectService";
import { Project, User } from "@/types";
import { toast } from "sonner";

interface FlattenedTitle {
  sNo: number;
  submittedBy: string; // This will hold student IDs
  projectTitle: string;
  status: "approved" | "rejected" | "pending";
  comments: string;
}

const ApprovedTitlesPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");

  useEffect(() => {
    fetchTitles();
  }, []);

  const fetchTitles = async () => {
    setIsLoading(true);
    try {
      const res = await projectService.getAll();
      setProjects(res.data.filter(p => p.proposalStatus !== "not-submitted"));
    } catch (error) {
      toast.error("Failed to fetch title records.");
    } finally {
      setIsLoading(false);
    }
  };

  const flattenedData: FlattenedTitle[] = [];
  let counter = 1;

  projects.forEach((project) => {
    let groupIdentifiers = "";
    if (Array.isArray(project.groupMembers) && project.groupMembers.length > 0) {
      groupIdentifiers = (project.groupMembers as User[])
        .map(u => u.studentId)
        .filter(id => !!id)
        .join(", ");
    }
    
    // Fallback to project title if no valid student IDs found
    const displaySubmittedBy = groupIdentifiers || project.title || "Unknown Group";
    
    if (project.proposalStatus === "approved") {
      flattenedData.push({
        sNo: counter++,
        submittedBy: displaySubmittedBy,
        projectTitle: project.finalTitle || project.title,
        status: "approved",
        comments: project.description || "Include project evaluation, scoring, and collaboration features",
      });
    } else if (project.proposalStatus === "rejected") {
      const lastProposal = project.proposals?.[project.proposals.length - 1];
      if (lastProposal) {
        lastProposal.titles.forEach((title, idx) => {
          flattenedData.push({
            sNo: counter++,
            submittedBy: displaySubmittedBy,
            projectTitle: `Title ${idx + 1}: "${title}"`,
            status: "rejected",
            comments: lastProposal.feedback || "All titles rejected because of novelty, repetition and minimal scope",
          });
        });
      }
    }
  });

  const filteredData = flattenedData.filter(item => 
    item.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(0, parseInt(entriesPerPage));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-3xl font-display font-medium text-foreground tracking-tight">Approved List of Titles</h1>
        <p className="text-muted-foreground text-sm">Status overview of all project title submissions and reviews</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-between items-end md:items-center pt-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Show</span>
          <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
            <SelectTrigger className="w-[80px] h-10 bg-background/50 border-border/60 hover:border-primary/30 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm font-medium text-muted-foreground">entries</span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-sm font-medium text-muted-foreground shrink-0">Search:</span>
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input 
              className="pr-10 h-10 bg-background/50 border-border/60 focus-visible:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-background/40 backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20">
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80 w-24">S.No</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80 w-64">Submitted by</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">Project Title</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80 text-center w-36">Approval Status</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">Comments/Recommendations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-primary/30" />
                      <p className="text-sm font-medium text-muted-foreground/60">Retrieving academic records...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={`${item.submittedBy}-${item.sNo}`} className="group hover:bg-muted/30 transition-all duration-200">
                    <td className="px-8 py-6 text-sm font-medium text-muted-foreground/70">{item.sNo}</td>
                    <td className="px-8 py-6">
                      <span className="text-[14px] font-bold text-foreground/90 tracking-tight">{item.submittedBy}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[14px] font-medium text-muted-foreground/80 leading-relaxed italic max-w-2xl">
                        {item.projectTitle}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        {item.status === "approved" ? (
                          <div className="w-7 h-7 rounded-md bg-success/10 border border-success/20 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-md bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-destructive" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[13px] font-normal text-muted-foreground/70 leading-normal max-w-md">
                        {item.comments}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center">
                        <Search className="w-7 h-7 text-muted-foreground/40" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-foreground/70">No results found</p>
                        <p className="text-sm text-muted-foreground/60 max-w-[240px] mx-auto">
                          We couldn't find any matches for "{searchTerm}". Please try a different search.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {!isLoading && filteredData.length > 0 && (
          <div className="px-8 py-5 border-t border-border/40 bg-muted/10">
            <p className="text-[12px] font-medium text-muted-foreground/70 italic">
              Showing 1 to {Math.min(paginatedData.length, parseInt(entriesPerPage))} of {filteredData.length} entries
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovedTitlesPage;
