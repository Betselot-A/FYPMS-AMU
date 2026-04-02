// ============================================================
// Student: Submit Proposal Page
// Students submit exactly 3 project title + description pairs
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, CheckCircle2, ClipboardList, RefreshCw, FileText, XCircle, AlertCircle, Upload, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import projectService from "@/api/projectService";
import { Project, Proposal } from "@/types";

const SubmitPage = () => {
  const navigate = useNavigate();
  const [myProject, setMyProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [titles, setTitles] = useState(["", "", ""]);
  const [descriptions, setDescriptions] = useState(["", "", ""]);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProject = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await projectService.getAll();
      const project = res.data[0] || null;
      setMyProject(project);
      
      // If there's an existing pending or rejected proposal, pre-fill the form
      if (project && project.proposals && project.proposals.length > 0) {
        const lastProposal = project.proposals[project.proposals.length - 1];
        if (lastProposal.status !== "approved") {
          // Robust mapping for legacy single-title data or arrays of different lengths
          const mappedTitles = Array.isArray(lastProposal.titles) 
            ? [...lastProposal.titles] 
            : [typeof lastProposal.titles === 'string' ? lastProposal.titles : "", "", ""];
          
          while (mappedTitles.length < 3) mappedTitles.push("");
          setTitles(mappedTitles.slice(0, 3));

          const mappedDescs = Array.isArray(lastProposal.descriptions) 
            ? [...lastProposal.descriptions] 
            : [typeof lastProposal.descriptions === 'string' ? lastProposal.descriptions : "", "", ""];
            
          while (mappedDescs.length < 3) mappedDescs.push("");
          setDescriptions(mappedDescs.slice(0, 3));
        }
      }
    } catch {
      toast.error("Could not load your project group.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleTitleChange = (index: number, value: string) => {
    const newTitles = [...titles];
    newTitles[index] = value;
    setTitles(newTitles);
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const newDescs = [...descriptions];
    newDescs[index] = value;
    setDescriptions(newDescs);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedExtensions = [".pdf", ".doc", ".docx"];
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();
      
      if (!allowedExtensions.includes(`.${ext}`)) {
        toast.error("Invalid file type. Please upload PDF or Word document.");
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myProject) return;

    // Validation
    if (titles.some(t => !t.trim())) {
      toast.error("Please provide all 3 project title options.");
      return;
    }
    if (descriptions.some(d => !d.trim())) {
      toast.error("Please provide descriptions for all 3 options.");
      return;
    }
    if (!file && (!myProject.proposals || myProject.proposals.length === 0)) {
      toast.error("Please upload a proposal document.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("titles", JSON.stringify(titles));
      formData.append("descriptions", JSON.stringify(descriptions));
      if (file) {
        formData.append("document", file);
      }

      await projectService.submitProposal(myProject.id, formData);
      toast.success("Proposal Submitted", { 
        description: "Your academic project ideas have been delivered to the coordinator." 
      });
      navigate("/dashboard/student/status");
    } catch (err: any) {
      toast.error("Submission Failed", { 
        description: err.response?.data?.message || "Internal server error during proposal transmission." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading your group information...</span>
      </div>
    );
  }

  if (!myProject) {
    return (
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Project Proposal</h1>
        <Card className="shadow-card mt-6">
          <CardContent className="py-12 text-center text-muted-foreground">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">You haven't been assigned to a group yet.</p>
            <p className="text-sm mt-1">Contact your coordinator to be added to a project group.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lastProposal = myProject.proposals?.[myProject.proposals.length - 1];
  const hasSubmittedProposal = myProject.proposals && myProject.proposals.length > 0;

  // "not-submitted" (new default) OR legacy "pending" with no proposals = student hasn't submitted yet
  const isNotSubmitted =
    myProject.proposalStatus === "not-submitted" ||
    (myProject.proposalStatus === "pending" && !hasSubmittedProposal);

  const isApproved = myProject.proposalStatus === "approved";

  // Only truly "pending" when a proposal has actually been submitted
  const isPending =
    myProject.proposalStatus === "pending" && hasSubmittedProposal;

  const isRejected = myProject.proposalStatus === "rejected";

  // Student can submit when: not approved AND not currently awaiting review
  const canSubmit = !isApproved && !isPending;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Project Initiation</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Propose 3 options (Title + Description) and a single PDF/DOCX for review.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchProject} disabled={isLoading} className="rounded-full">
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Status Banners */}
      {isApproved && (
        <Card className="bg-success/5 border-success/20 mb-6 overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="font-bold text-success">Proposal Approved</h3>
              <p className="text-sm text-success/80">
                Final Title: <span className="font-semibold underline">"{myProject.finalTitle}"</span>. 
              </p>
              <p className="text-xs text-success/70 mt-1 line-clamp-2 italic">
                "{myProject.description}"
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isPending && (
        <Card className="bg-info/5 border-info/20 mb-6">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-info" />
            </div>
            <div>
              <h3 className="font-bold text-info">Under Review (v{lastProposal?.version})</h3>
              <p className="text-sm text-info/80">
                Your proposal has been submitted. Waiting for coordinator feedback.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isRejected && (
        <Card className="bg-destructive/5 border-destructive/20 mb-6">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-destructive">Resubmission Required</h3>
              <p className="text-sm text-destructive font-medium mt-1 uppercase text-[10px] tracking-wider">Coordinator Feedback:</p>
              <p className="text-sm bg-background/50 p-2 rounded mt-1 border border-destructive/10 italic">
                "{lastProposal?.feedback || "No feedback provided."}"
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmitProposal} className="space-y-6">
        <div className="grid gap-6">
          {[0, 1, 2].map((idx) => (
            <Card key={idx} className={`shadow-card ${isApproved ? 'opacity-60 pointer-events-none' : ''}`}>
              <CardHeader className="pb-3 border-b bg-muted/10">
                <div className="flex items-center gap-3">
                   <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm">
                    {idx + 1}
                  </span>
                  <div>
                    <CardTitle className="text-base font-bold">Project Option {idx + 1}</CardTitle>
                    <CardDescription className="text-xs">Provide a unique title and clear description for this option.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`title-${idx}`} className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Project Title
                  </Label>
                  <Input
                    id={`title-${idx}`}
                    placeholder={`Enter option ${idx + 1} title...`}
                    value={titles[idx]}
                    onChange={(e) => handleTitleChange(idx, e.target.value)}
                    disabled={isPending || isApproved}
                    className="bg-muted/30 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`desc-${idx}`} className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Description & Problems Solved
                  </Label>
                  <Textarea
                    id={`desc-${idx}`}
                    placeholder="Briefly explain the problem, proposed solution, and key technologies for this specific title..."
                    rows={4}
                    value={descriptions[idx]}
                    onChange={(e) => handleDescriptionChange(idx, e.target.value)}
                    disabled={isPending || isApproved}
                    className="bg-muted/30 focus:bg-background resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Global Document Upload */}
        <Card className={`shadow-card ${isApproved ? 'opacity-60 pointer-events-none' : ''}`}>
          <CardHeader>
            <CardTitle className="text-lg">Accompanying Proposal Document</CardTitle>
            <CardDescription>Upload a single PDF or DOCX file covering more details for all proposed ideas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-32 border-dashed border-2 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all relative group"
                onClick={() => document.getElementById("file-upload")?.click()}
                disabled={isPending || isApproved}
              >
                {file ? (
                  <>
                    <FileCheck className="w-8 h-8 text-success animate-in zoom-in" />
                    <span className="text-sm font-semibold text-foreground">{file.name}</span>
                    <span className="text-[10px] text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium">Upload File (PDF/DOCX)</span>
                    <span className="text-[10px] text-muted-foreground">Max size: 10MB</span>
                  </>
                )}
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </Button>
              
              {lastProposal?.documentUrl && (
                <div className="w-48 text-center p-4 border rounded-xl bg-muted/20 flex flex-col items-center justify-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Current/Previous File</p>
                  <a 
                    href={import.meta.env.VITE_API_BASE_URL?.replace('/api', '') + lastProposal.documentUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex flex-col items-center gap-1 group"
                  >
                    <FileText className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] text-primary underline truncate max-w-full block">View Attachment</span>
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {canSubmit && (
          <Button type="submit" className="w-full gradient-primary text-primary-foreground h-12 text-base font-bold shadow-lg shadow-primary/20" disabled={isSubmitting}>
            <Send className="w-5 h-5 mr-2" />
            {isSubmitting ? "Submitting Proposal..." : isRejected ? "Submit Revised Proposal (v2+)" : "Submit Full Proposal for Review"}
          </Button>
        )}
        
        {isPending && (
          <div className="bg-info/10 text-info border border-info/20 p-4 rounded-xl text-center font-medium italic">
            Proposal is currently frozen for review. You will be notified of the decision.
          </div>
        )}
      </form>
      
      {/* Version Info */}
      {lastProposal && (
        <p className="text-center text-[10px] text-muted-foreground mt-8 uppercase tracking-[0.3em] opacity-40">
          Proposal Engine v2.0 · Revision {lastProposal.version} · {new Date(lastProposal.submittedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

const FileCheck = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="m9 15 2 2 4-4" />
  </svg>
);

export default SubmitPage;
