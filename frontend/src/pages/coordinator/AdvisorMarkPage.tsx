// ============================================================
// Coordinator: Enter advisor marks on behalf of advisor
// ============================================================

import { useState } from "react";
import { mockProjects, mockUsers } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, ChevronDown, ChevronRight, Send, UserCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const advisorCriteria = [
  { key: "understanding", label: "Project understanding", max: 10 },
  { key: "progress", label: "Progress and effort", max: 10 },
  { key: "documentation", label: "Documentation quality", max: 10 },
  { key: "communication", label: "Communication", max: 5 },
];

const maxTotal = advisorCriteria.reduce((sum, c) => sum + c.max, 0); // 35

const AdvisorMarkPage = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, Record<string, string>>>({});

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

  const handleSubmit = (projectId: string) => {
    const project = mockProjects.find((p) => p.id === projectId);
    if (!project) return;
    const members = project.groupMembers.map((id) => mockUsers.find((u) => u.id === id)).filter(Boolean);
    const summary = members.map((m) => `${m!.name}: ${getMemberTotal(m!.id)}/${maxTotal}`).join(", ");
    toast({ title: "Advisor Marks Submitted", description: summary });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Advisor Mark (On Behalf)</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter advisor evaluation marks on behalf of the advisor (out of {maxTotal})</p>
      </div>

      <div className="space-y-4">
        {mockProjects.map((project) => {
          const isSelected = selectedProject === project.id;
          const advisor = mockUsers.find((u) => u.id === project.advisorId);
          const members = project.groupMembers.map((id) => mockUsers.find((u) => u.id === id)).filter(Boolean);

          return (
            <Card key={project.id} className="shadow-card">
              <CardHeader
                className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg"
                onClick={() => setSelectedProject(isSelected ? null : project.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isSelected ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <UserCheck className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">{project.title}</CardTitle>
                      <CardDescription className="text-xs">Advisor: {advisor?.name}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize text-xs">{project.status}</Badge>
                </div>
              </CardHeader>

              {isSelected && (
                <CardContent className="space-y-3 pt-0">
                  {members.map((m) => {
                    const isMemberExpanded = expandedMember === m!.id;
                    const total = getMemberTotal(m!.id);

                    return (
                      <Card key={m!.id} className="border border-border">
                        <CardHeader
                          className="py-3 px-4 cursor-pointer hover:bg-muted/20 transition-colors"
                          onClick={() => setExpandedMember(isMemberExpanded ? null : m!.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isMemberExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground">{m!.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-primary">{total}/{maxTotal}</span>
                          </div>
                        </CardHeader>

                        {isMemberExpanded && (
                          <CardContent className="space-y-3 pt-0 px-4 pb-4">
                            {advisorCriteria.map((c, i) => (
                              <div key={c.key} className="flex items-start gap-4">
                                <Label className="flex-1 text-sm text-foreground pt-2">
                                  {i + 1}. {c.label} (/{c.max})
                                </Label>
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

                  <Button onClick={() => handleSubmit(project.id)} className="mt-2">
                    <Send className="w-4 h-4 mr-1.5" /> Submit Advisor Marks
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdvisorMarkPage;
