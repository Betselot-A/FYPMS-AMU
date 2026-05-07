import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, FileText, Download, UserPlus, Info, AlertCircle, RefreshCw } from "lucide-react";
import { Project, User } from "@/types";
import { toast } from "sonner";
import projectService from "@/api/projectService";
import userService from "@/api/userService";
import fileService from "@/api/fileService";
import { MultiUserSelect } from "@/components/MultiUserSelect";

interface ProposalReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSuccess: (updatedProject: Project) => void;
}

const ProposalReviewModal = ({ isOpen, onClose, project, onSuccess }: ProposalReviewModalProps) => {
  const [selectedTitleIndex, setSelectedTitleIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [advisorId, setAdvisorId] = useState("");
  const [examinerId, setExaminerId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [staff, setStaff] = useState<User[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchStaff();
      // Reset state
      setSelectedTitleIndex(null);
      setFeedback("");
      setAdvisorId("");
      setExaminerId("");
    }
  }, [isOpen]);

  const fetchStaff = async () => {
    try {
      const res = await userService.getAll({ role: "staff" });
      setStaff(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch staff", err);
    }
  };

  if (!project || !project.proposals || project.proposals.length === 0) return null;

  const currentProposal = project.proposals[project.proposals.length - 1];

  const handleReview = async (status: "approved" | "rejected") => {
    if (status === "approved") {
      if (selectedTitleIndex === null) {
        toast.error("Please select a title option to approve.");
        return;
      }
    } else {
      if (!feedback.trim()) {
        toast.error("Please provide feedback for rejection.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await projectService.reviewProposal(project.id, {
        status,
        feedback: status === "rejected" ? feedback : undefined,
        selectedTitleIndex: status === "approved" ? selectedTitleIndex : undefined,
        advisorId: status === "approved" ? advisorId : undefined,
        examinerId: status === "approved" ? examinerId : undefined,
      });

      toast.success(status === "approved" ? "Proposal approved!" : "Proposal rejected.");
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      toast.error("Failed to process review", { description: err.response?.data?.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide p-4 sm:p-6">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <Badge variant="outline" className="text-[9px] sm:text-[10px] uppercase tracking-widest text-primary border-primary/20 bg-primary/5 w-fit">
              Revision v{currentProposal.version}
            </Badge>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest">
              Submitted: {new Date(currentProposal.submittedAt).toLocaleDateString()}
            </span>
          </div>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
            <FileText className="w-5 h-5 text-primary" />
            Review Project Proposals
          </DialogTitle>
          <DialogDescription className="text-[11px] sm:text-xs">
            Review the options submitted by <span className="font-semibold text-foreground">{project.title}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Titles & Descriptions Selection */}
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between">
              Title & Description Options
              <span className="text-[10px] text-primary italic font-normal normal-case">Pick one to approve</span>
            </Label>
            <div className="grid gap-2 sm:gap-3">
              {currentProposal.titles.map((title, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedTitleIndex(idx)}
                  className={`relative w-full text-left p-3 sm:p-4 rounded-xl border transition-all cursor-pointer group ${
                    selectedTitleIndex === idx 
                      ? "bg-primary/5 border-primary ring-1 ring-primary/20 shadow-sm" 
                      : "bg-muted/10 border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3 mb-2">
                    <span className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[9px] sm:text-[10px] font-bold shrink-0 shadow-sm ${
                      selectedTitleIndex === idx ? "bg-primary text-primary-foreground" : "bg-background border border-border"
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] sm:text-sm font-bold leading-tight ${selectedTitleIndex === idx ? "text-primary" : "text-foreground"} line-clamp-2`}>
                        {title}
                      </p>
                    </div>
                    {selectedTitleIndex === idx && <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0 animate-in zoom-in" />}
                  </div>
                  
                  {/* Option file download */}
                  <div className={`mt-2 p-2 sm:p-3 rounded-lg border transition-colors flex items-center justify-between gap-3 ${
                    selectedTitleIndex === idx ? "bg-background border-primary/20" : "bg-muted/20 border-border/50"
                  }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className={`w-4 h-4 shrink-0 ${selectedTitleIndex === idx ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="text-[11px] sm:text-xs font-medium truncate uppercase tracking-wider">
                        Proposal Option {idx + 1}
                      </p>
                    </div>
                    
                    {currentProposal.documentIds?.[idx] ? (
                      <Button 
                        size="sm" 
                        variant={selectedTitleIndex === idx ? "default" : "secondary"} 
                        className="h-7 px-2 text-[9px] uppercase font-bold" 
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a 
                          href={fileService.getDownloadUrl(currentProposal.documentIds[idx])} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </a>
                      </Button>
                    ) : (
                      <span className="text-[9px] text-muted-foreground italic">No file provided</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Decision Area: Staff Assignment (Only if approving) */}
          {selectedTitleIndex !== null && (
            <div className="space-y-4 pt-4 border-t animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 mb-2 p-2 bg-primary/5 rounded border border-primary/10">
                <AlertCircle className="w-4 h-4 text-primary" />
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary">Pre-Approval: Assign Project Staff</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Main Advisor</Label>
                  <select 
                    className="w-full h-10 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary transition-all outline-none"
                    value={advisorId}
                    onChange={(e) => setAdvisorId(e.target.value)}
                  >
                    <option value="">Select Advisor...</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.department})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Internal Examiner</Label>
                  <select 
                    className="w-full h-10 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary transition-all outline-none"
                    value={examinerId}
                    onChange={(e) => setExaminerId(e.target.value)}
                  >
                    <option value="">Select Examiner...</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.department})</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Decision Area: Rejection Feedback (Always visible) */}
          <div className="space-y-2 pt-4 border-t">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground italic">Rejection Feedback (Required if not satisfied with any option)</Label>
            <Textarea 
              placeholder="e.g. Please clarify technology stacks or provide more feasible title options..."
              className="bg-muted/10 focus:bg-background border-border"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="w-full sm:flex-1 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive h-10 sm:h-11 text-xs sm:text-sm"
            disabled={isSubmitting}
            onClick={() => handleReview("rejected")}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject Submission
          </Button>
          <Button 
            className="w-full sm:flex-1 gradient-primary text-primary-foreground h-10 sm:h-11 font-bold shadow-lg shadow-primary/20 text-xs sm:text-sm"
            disabled={isSubmitting || selectedTitleIndex === null}
            onClick={() => handleReview("approved")}
          >
            {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            {isSubmitting ? "Processing..." : "Approve Option"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalReviewModal;
