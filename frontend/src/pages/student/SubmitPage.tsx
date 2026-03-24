// ============================================================
// Student: Submit Proposal Page
// Students submit project title proposals for their group
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, CheckCircle2, ClipboardList, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import projectService from "@/api/projectService";
import { Project } from "@/types";

const SubmitPage = () => {
  const [myProject, setMyProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProject = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await projectService.getAll();
      // Student sees their own group's project (first one returned)
      setMyProject(res.data[0] || null);
    } catch {
      toast.error("Could not load your project group.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myProject) return;
    setIsSubmitting(true);
    try {
      const res = await projectService.submitProposal(myProject.id, title, description);
      setMyProject(res.data);
      setTitle("");
      setDescription("");
      toast.success("Proposal submitted!", {
        description: "The coordinator will review and approve one of your proposals.",
      });
    } catch (error: any) {
      toast.error("Failed to submit proposal", {
        description: error.response?.data?.message || "An error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading your group information...</p>;
  }

  if (!myProject) {
    return (
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Project Proposals</h1>
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

  const proposalCount = myProject.proposals?.length || 0;
  const maxProposals = 3;
  const canSubmitMore = proposalCount < maxProposals && myProject.proposalStatus !== "approved";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Project Proposals</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Submit up to 3 project title ideas. The coordinator will approve one.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchProject} disabled={isLoading}>
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Current Status */}
      <Card className="shadow-card mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Your Group Status</CardTitle>
            <Badge
              className={`capitalize text-xs ${
                myProject.proposalStatus === "approved"
                  ? "bg-green-500/10 text-green-600 border-green-500/20"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              }`}
            >
              {myProject.proposalStatus === "approved" ? (
                <><CheckCircle2 className="w-3 h-3 mr-1" /> Proposal Approved</>
              ) : (
                `${proposalCount}/${maxProposals} Proposals Submitted`
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {myProject.proposals && myProject.proposals.length > 0 ? (
            <div className="space-y-2">
              {myProject.proposals.map((proposal, idx) => {
                const isApproved =
                  myProject.proposalStatus === "approved" && myProject.approvedProposalIndex === idx;
                return (
                  <div
                    key={proposal.id || idx}
                    className={`p-3 rounded-lg border ${
                      isApproved
                        ? "bg-green-500/5 border-green-500/30"
                        : "bg-muted/20 border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {idx + 1}. {proposal.title}
                        </p>
                        {proposal.description && (
                          <p className="text-xs text-muted-foreground mt-1">{proposal.description}</p>
                        )}
                      </div>
                      {isApproved && (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 shrink-0">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Approved!
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No proposals submitted yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Submit New Proposal */}
      {canSubmitMore ? (
        <Card className="shadow-card max-w-xl">
          <CardHeader>
            <CardTitle className="text-lg">Submit Proposal #{proposalCount + 1}</CardTitle>
            <CardDescription>
              You can submit up to {maxProposals - proposalCount} more proposal(s).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitProposal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proposal-title">Project Title</Label>
                <Input
                  id="proposal-title"
                  placeholder="e.g. AI-Powered Student Attendance System"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proposal-desc">Brief Description</Label>
                <Textarea
                  id="proposal-desc"
                  placeholder="What problem does this project solve? What technology will you use?"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button type="submit" className="gradient-primary text-primary-foreground" disabled={isSubmitting}>
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit Proposal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : myProject.proposalStatus === "approved" ? (
        <Card className="shadow-card">
          <CardContent className="py-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="font-medium text-foreground">Your project title has been approved!</p>
            <p className="text-sm text-muted-foreground mt-1">
              The coordinator will now assign an advisor and examiner to your group.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card">
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>You have submitted all 3 proposals. Waiting for the coordinator to approve one.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubmitPage;
