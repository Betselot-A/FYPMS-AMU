// ============================================================
// Project Grades Page (Examiner context)
// Per-member evaluation criteria for presentation grading
// ============================================================

import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState } from "react";
import { mockProjects, mockUsers } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const evaluationCriteria = [
  { key: "pace", label: "Pace of presentation (Pace and Protocol)", max: 3 },
  { key: "confidence", label: "Confidence and manner (Polite and well-mannered attitude and behavior)", max: 3 },
  { key: "clarity", label: "Clarity of presentation and eye contact with audience", max: 3 },
  { key: "bodyLanguage", label: "Use of body language like facial and gesture", max: 3 },
  { key: "generalKnowledge", label: "General knowledge of the project", max: 2 },
  { key: "answeringQuestions", label: "Ability of answering questions", max: 3 },
  { key: "languageUse", label: "Language use (is fluent and correct)", max: 3 },
];

const maxTotal = evaluationCriteria.reduce((sum, c) => sum + c.max, 0);

const ProjectGradesPage = () => {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "examiner";
  const project = mockProjects.find((p) => p.id === projectId);
  // scores[memberId][criteriaKey] = string value
  const [scores, setScores] = useState<Record<string, Record<string, string>>>({});
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  if (!project) return <p className="text-muted-foreground">Project not found.</p>;

  const members = project.groupMembers.map((id) => mockUsers.find((u) => u.id === id)).filter(Boolean);

  const getMemberTotal = (memberId: string) => {
    const memberScores = scores[memberId] || {};
    return Object.values(memberScores).reduce((sum, v) => sum + (parseInt(v) || 0), 0);
  };

  const handleScoreChange = (memberId: string, criteriaKey: string, value: string) => {
    setScores((prev) => ({
      ...prev,
      [memberId]: {
        ...(prev[memberId] || {}),
        [criteriaKey]: value,
      },
    }));
  };

  const handleSubmit = () => {
    const summary = members
      .map((m) => `${m!.name}: ${getMemberTotal(m!.id)}/${maxTotal}`)
      .join(", ");
    toast({ title: "Grades Submitted", description: summary });
  };

  return (
    <div>
      <Link
        to={`/dashboard/staff/project/${projectId}?role=${role}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Project
      </Link>
      <h1 className="text-xl font-display font-bold text-foreground mb-1">Submit Grades</h1>
      <p className="text-sm text-muted-foreground mb-6">{project.title}</p>

      <div className="space-y-4">
        {members.map((m) => {
          const isExpanded = expandedMember === m!.id;
          const total = getMemberTotal(m!.id);

          return (
            <Card key={m!.id} className="shadow-card">
              <CardHeader
                className="pb-3 cursor-pointer"
                onClick={() => setExpandedMember(isExpanded ? null : m!.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-base">{m!.name}</CardTitle>
                  </div>
                  <span className="text-sm font-semibold text-primary">{total}/{maxTotal}</span>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-3 pt-0">
                  {evaluationCriteria.map((c) => (
                    <div key={c.key} className="flex items-start gap-4">
                      <Label className="flex-1 text-sm text-foreground pt-2">{c.label} (/{c.max})</Label>
                      <Input
                        type="number"
                        min={0}
                        max={c.max}
                        placeholder="0"
                        value={scores[m!.id]?.[c.key] || ""}
                        onChange={(e) => handleScoreChange(m!.id, c.key, e.target.value)}
                        className="w-20"
                      />
                    </div>
                  ))}
                  <div className="border-t border-border pt-3 flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-lg font-bold text-primary">{total}/{maxTotal}</span>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Button onClick={handleSubmit} className="mt-6">
        <Send className="w-4 h-4 mr-1.5" /> Submit Final Grades
      </Button>
    </div>
  );
};

export default ProjectGradesPage;
