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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest text-primary border-primary/20 bg-primary/5">
              Revision v{currentProposal.version}
            </Badge>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Submitted: {new Date(currentProposal.submittedAt).toLocaleDateString()}
            </span>
          </div>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="w-5 h-5 text-primary" />
            Review Project Proposals
          </DialogTitle>
          <DialogDescription className="text-xs">
            Review the 3 title + description pairs submitted by <span className="font-semibold text-foreground">{project.title}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Titles & Descriptions Selection */}
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between">
              Title & Description Options
              <span className="text-[10px] text-primary italic font-normal normal-case">Pick one to approve</span>
            </Label>
            <div className="grid gap-3">
              {currentProposal.titles.map((title, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedTitleIndex(idx)}
                  className={`relative w-full text-left p-4 rounded-xl border transition-all cursor-pointer group ${
                    selectedTitleIndex === idx 
                      ? "bg-primary/5 border-primary ring-1 ring-primary/20 shadow-sm" 
                      : "bg-muted/10 border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold shrink-0 shadow-sm ${
                      selectedTitleIndex === idx ? "bg-primary text-primary-foreground" : "bg-background border border-border"
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm font-bold leading-tight ${selectedTitleIndex === idx ? "text-primary" : "text-foreground"}`}>
                        {title}
                      </p>
                    </div>
                    {selectedTitleIndex === idx && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 animate-in zoom-in" />}
                  </div>
                  
                  {/* Option description */}
                  <div className={`mt-2 p-3 rounded-lg text-xs leading-relaxed border transition-colors ${
                    selectedTitleIndex === idx ? "bg-background border-primary/20 text-foreground" : "bg-muted/20 border-border/50 text-muted-foreground"
                  }`}>
                    {currentProposal.descriptions?.[idx] || "No specific description provided for this option."}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accompanying Document */}
          {currentProposal.documentUrl && (
            <div className="flex items-center justify-between p-4 bg-muted/20 border border-dashed border-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-background border flex items-center justify-center shadow-sm">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-wider">Detailed Proposal Document</p>
                  <p className="text-[10px] text-muted-foreground">PDF/DOCX Reference for all options</p>
                </div>
              </div>
              <Button size="sm" variant="secondary" className="text-[10px] uppercase font-bold h-8" asChild>
                <a 
                  href={import.meta.env.VITE_API_BASE_URL?.replace('/api', '') + currentProposal.documentUrl} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  Download File
                </a>
              </Button>
            </div>
          )}

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

        <DialogFooter className="gap-2 sm:gap-2">
          <Button 
            variant="outline" 
            className="flex-1 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive h-11"
            disabled={isSubmitting}
            onClick={() => handleReview("rejected")}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject Submission
          </Button>
          <Button 
            className="flex-1 gradient-primary text-primary-foreground h-11 font-bold shadow-lg shadow-primary/20"
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
