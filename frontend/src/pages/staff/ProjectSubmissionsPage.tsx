import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
   ArrowLeft,
   FileText,
   Download,
   Clock,
   FolderOpen,
   Send,
   MessageSquare,
   CheckCircle2,
   FileIcon,
   RefreshCw,
   ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { projectService, fileService } from "@/api";
import submissionService from "@/api/submissionService";
import { Project, Submission } from "@/types";
import { ProjectFile } from "@/api/fileService";
import { cn } from "@/lib/utils";

const ProjectSubmissionsPage = () => {
   const { projectId } = useParams();
   const [searchParams] = useSearchParams();
   const role = searchParams.get("role") || "advisor";
   const { user } = useAuth();

   const [project, setProject] = useState<Project | null>(null);
   const [submissions, setSubmissions] = useState<Submission[]>([]);
   const [vaultFiles, setVaultFiles] = useState<ProjectFile[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   // Feedback State
   const [feedbackText, setFeedbackText] = useState<{ [key: string]: string }>({});
   const [isSubmitting, setIsSubmitting] = useState<{ [key: string]: boolean }>({});

   const fetchData = useCallback(async () => {
      if (!projectId) return;
      try {
         setIsLoading(true);
         const [projRes, subRes, fileRes] = await Promise.all([
            projectService.getById(projectId),
            submissionService.getByProject(projectId),
            fileService.getProjectFiles(projectId)
         ]);
         setProject(projRes.data);
         setSubmissions(subRes.data);
         setVaultFiles(fileRes.data);
      } catch (error) {
         toast.error("Data Sync Error", { description: "Could not load submissions and deliverables." });
      } finally {
         setIsLoading(false);
      }
   }, [projectId]);

   useEffect(() => {
      fetchData();
   }, [fetchData]);

   const handleSendFeedback = async (subId: string) => {
      const text = feedbackText[subId];
      if (!text || !text.trim()) return;

      try {
         setIsSubmitting(prev => ({ ...prev, [subId]: true }));
         await submissionService.addFeedback(subId, text);
         toast.success("Feedback Sent", { description: "Your comments have been shared with the students." });
         setFeedbackText(prev => ({ ...prev, [subId]: "" }));
         fetchData(); // Refresh submissions
      } catch (error) {
         toast.error("Feedback Failed", { description: "Could not send the feedback to the students." });
      } finally {
         setIsSubmitting(prev => ({ ...prev, [subId]: false }));
      }
   };

   const getStatusColor = (status: string) => {
      switch (status) {
         case "submitted": return "bg-warning/10 text-warning border-warning/20";
         case "reviewed": return "bg-info/10 text-info border-info/20";
         case "graded": return "bg-success/10 text-success border-success/20";
         default: return "bg-muted text-muted-foreground border-muted";
      }
   };

   const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
   };

   if (isLoading) {
      return (
         <div className="max-w-5xl mx-auto space-y-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-64" />
            <div className="space-y-4">
               <Skeleton className="h-48 w-full" />
               <Skeleton className="h-48 w-full" />
            </div>
         </div>
      );
   }

   if (!project) return <div className="p-20 text-center text-muted-foreground">Project records not found.</div>;

   return (
      <div className="max-w-5xl mx-auto pb-20">
         <Link to={`/dashboard/staff/project/${projectId}?role=${role}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary mb-6 transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Project Overview
         </Link>

         <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
               <Badge variant="outline" className="text-muted-foreground border-border uppercase text-[10px] font-bold tracking-wider px-2 py-0.5">
                  Review Hub
               </Badge>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">Formal Submissions</h1>
            <p className="text-sm text-muted-foreground mt-1">Review academic deliverables submitted by the group, provide structured feedback, and track revisions.</p>
         </div>

         {/* Formal Submissions Section */}
         <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Send className="w-4 h-4" />
            Deliverables Awaiting Review
         </h3>

         <div className="space-y-6 mb-16">
            {submissions.length === 0 ? (
               <Card className="border-none bg-muted/20 shadow-none border-dashed border-2 border-border/50">
                  <CardContent className="p-20 text-center flex flex-col items-center">
                     <div className="w-16 h-16 rounded-2xl bg-background border flex items-center justify-center mb-6 shadow-sm">
                        <CheckCircle2 className="w-8 h-8 text-muted-foreground/30" />
                     </div>
                     <h3 className="text-lg font-semibold text-foreground">No Submissions Found</h3>
                     <p className="text-muted-foreground text-sm max-w-sm mt-2">
                        The students have not formally submitted any deliverables for review yet.
                     </p>
                  </CardContent>
               </Card>
            ) : (
               submissions.map((sub) => (
                  <Card key={sub.id} className="shadow-card border-border/50 overflow-hidden">
                     <div className="p-6">
                        {/* Submission Header */}
                        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                           <div>
                              <div className="flex items-center gap-3 mb-2">
                                 <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", getStatusColor(sub.status))}>
                                    {sub.status === "submitted" ? "Pending Review" : sub.status}
                                 </Badge>
                                 <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    {new Date(sub.submissionDate).toLocaleString()}
                                 </span>
                              </div>
                              <h3 className="font-bold text-foreground text-xl">{sub.title}</h3>
                           </div>

                           {/* Attached Files */}
                           <div className="flex flex-wrap gap-2 w-full md:w-auto">
                              {sub.files && sub.files.map((fileUrl, idx) => {
                                 const filename = fileUrl.split("/").pop() || "Document";
                                 return (
                                    <a
                                       key={idx}
                                       href={import.meta.env.VITE_API_BASE_URL?.replace('/api', '') + fileUrl}
                                       target="_blank"
                                       rel="noreferrer"
                                    >
                                       <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl text-xs font-bold gap-2 hover:bg-primary/5 hover:text-primary border-border">
                                          <FileText className="w-4 h-4 text-primary" />
                                          Review Document
                                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                       </Button>
                                    </a>
                                 )
                              })}
                           </div>
                        </div>

                        {/* Feedback History */}
                        {sub.feedback && sub.feedback.length > 0 && (
                           <div className="mt-8 pt-6 border-t border-border/50">
                              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                 <MessageSquare className="w-4 h-4" /> Previous Feedback History
                              </h4>
                              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                 {sub.feedback.map((fb, idx) => (
                                    <div key={idx} className={cn("p-4 rounded-2xl w-full", fb.fromUserId === user?.id ? "bg-primary/5 border border-primary/10 ml-auto" : "bg-muted/30 border border-border/50")}>
                                       <div className="flex items-center gap-2 mb-2">
                                          <span className={cn("text-xs font-bold", fb.fromUserId === user?.id ? "text-primary" : "text-foreground")}>
                                             {fb.fromUserId === user?.id ? "You" : fb.fromUserName}
                                          </span>
                                          <span className="text-[10px] text-muted-foreground">{new Date(fb.date).toLocaleString()}</span>
                                       </div>
                                       <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">{fb.message}</p>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}

                        {/* Feedback Form */}
                        <div className="mt-6 pt-6 border-t border-border/50">
                           <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-3">Provide New Feedback</h4>
                           <div className="flex flex-col gap-3">
                              <Textarea
                                 placeholder="E.g., What is good, what remains, what should be changed or removed..."
                                 className="min-h-[100px] bg-background border-border/50 resize-none text-sm p-4 hidden-scrollbar"
                                 value={feedbackText[sub.id] || ""}
                                 onChange={(e) => setFeedbackText(prev => ({ ...prev, [sub.id]: e.target.value }))}
                              />
                              <div className="flex justify-end">
                                 <Button
                                    onClick={() => handleSendFeedback(sub.id)}
                                    disabled={!feedbackText[sub.id]?.trim() || isSubmitting[sub.id]}
                                    className="gradient-primary h-10 px-6 shadow-lg shadow-primary/20 gap-2 font-semibold"
                                 >
                                    {isSubmitting[sub.id] ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Submit Review
                                 </Button>
                              </div>
                           </div>
                        </div>
                     </div>
                  </Card>
               ))
            )}
         </div>

         <hr className="border-border/50 my-10" />

         {/* General Vault View */}
         {/* <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            General Project Vault
         </h3>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vaultFiles.length === 0 ? (
               <div className="col-span-full py-10 text-center border border-dashed border-border/50 rounded-2xl bg-muted/10">
                  <p className="text-sm font-semibold text-muted-foreground">Vault is empty.</p>
               </div>
            ) : (
               vaultFiles.map(file => (
                  <Card key={file.id} className="shadow-sm border-none hover:ring-1 hover:ring-primary/20 transition-all group overflow-hidden bg-background">
                     <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                              <FileIcon className="w-5 h-5 text-muted-foreground" />
                           </div>
                           <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-foreground truncate">{file.originalName}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                 <span className="text-[10px] text-muted-foreground">{formatFileSize(file.fileSize)}</span>
                              </div>
                           </div>
                           <a
                              href={import.meta.env.VITE_API_BASE_URL?.replace('/api', '') + file.filePath}
                              target="_blank"
                              rel="noreferrer"
                           >
                              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                                 <Download className="w-4 h-4" />
                              </Button>
                           </a>
                        </div>
                     </CardContent>
                  </Card>
               ))
            )}
         </div> */}

      </div>
   );
};

export default ProjectSubmissionsPage;
