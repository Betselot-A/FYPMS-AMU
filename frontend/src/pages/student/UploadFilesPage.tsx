import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileIcon, 
  Trash2, 
  FileText, 
  ImageIcon, 
  Archive, 
  CloudUpload,
  HardDrive,
  Download,
  Search,
  CheckCircle2,
  RefreshCw,
  Send,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import projectService, { Project } from "@/api/projectService";
import fileService, { ProjectFile } from "@/api/fileService";
import submissionService from "@/api/submissionService";
import { Submission } from "@/types";
import { cn } from "@/lib/utils";

const UploadFilesPage = () => {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Submission Form State
  const [submissionTitle, setSubmissionTitle] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const projRes = await projectService.getAll();
      const myProject = projRes.data.find(p => p.groupMembers.some(m => (typeof m === 'string' ? m : m.id) === user.id));
      
      if (myProject) {
        setProject(myProject);
        const [fileRes, subRes] = await Promise.all([
          fileService.getProjectFiles(myProject.id),
          submissionService.getByProject(myProject.id)
        ]);
        setFiles(fileRes.data);
        setSubmissions(subRes.data);
      }
    } catch (error) {
      toast.error("Sync Error", { 
        description: "Failed to connect to the project's repository." 
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected || !project) return;
    
    try {
      setIsUploading(true);
      await fileService.uploadFile(project.id, selected);
      toast.success("Document Added", { 
        description: "Your file has been successfully uploaded to the project vault." 
      });
      fetchData(); // Refresh list
    } catch (error: any) {
      toast.error("Upload Failed", { 
        description: error.response?.data?.message || "Internal storage error." 
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleCreateSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !submissionTitle || !submissionFile) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("projectId", project.id);
      formData.append("title", submissionTitle);
      formData.append("files", submissionFile);

      await submissionService.create(formData);
      toast.success("Submission Successful", {
        description: "Your document has been sent to your advisor for review."
      });
      
      // Reset form
      setSubmissionTitle("");
      setSubmissionFile(null);
      
      // Refresh list
      fetchData();
    } catch (error: any) {
      toast.error("Submission Failed", {
        description: error.response?.data?.message || "Failed to submit document for review."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await fileService.deleteFile(id);
      setFiles(prev => prev.filter(f => f.id !== id));
      toast.success("File Removed", { 
        description: "The document has been securely deleted." 
      });
    } catch (error) {
      toast.error("Delete Failed", { 
        description: "Could not remove the document." 
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(t)) return <ImageIcon className="w-5 h-5 text-indigo-500" />;
    if (['pdf'].includes(t)) return <FileText className="w-5 h-5 text-rose-500" />;
    if (['zip', 'rar', '7z'].includes(t)) return <Archive className="w-5 h-5 text-amber-500" />;
    return <FileIcon className="w-5 h-5 text-blue-500" />;
  };

  const filteredFiles = files.filter(f => 
    f.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-warning/10 text-warning border-warning/20";
      case "reviewed": return "bg-info/10 text-info border-info/20";
      case "graded": return "bg-success/10 text-success border-success/20";
      default: return "bg-muted text-muted-foreground border-muted";
    }
  };

  if (isLoading) {
    return (
       <div className="space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
       </div>
    )
  }

  if (!project) {
    return (
       <div className="max-w-2xl mx-auto py-20 text-center">
          <HardDrive className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
          <h2 className="text-xl font-bold text-foreground">Project Context Required</h2>
          <p className="text-muted-foreground mt-2">You must be assigned to a project group to access the repository.</p>
       </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8 space-y-1">
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 uppercase text-[10px] font-bold tracking-widest px-2 py-0.5">
           Review Hub
        </Badge>
        <h1 className="text-3xl font-display font-bold text-foreground">Project Workspace</h1>
        <p className="text-sm text-muted-foreground mt-1">Submit deliverables for advisor review and manage your project vault.</p>
      </div>

      {/* Submission Module */}
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 mt-8 flex items-center gap-2">
         <Send className="w-4 h-4" />
         Formal Submissions
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Create Submission Form */}
        <Card className="col-span-1 shadow-card border-border/50 bg-background h-fit">
          <div className="p-6">
             <h3 className="font-bold text-foreground mb-1">New Submission</h3>
             <p className="text-xs text-muted-foreground mb-6">Submit a formal document for advisor feedback.</p>
             
             <form onSubmit={handleCreateSubmission} className="space-y-4">
                <div className="space-y-1.5">
                   <Label className="text-xs font-semibold uppercase text-muted-foreground">Deliverable Title</Label>
                   <Input 
                     placeholder="e.g. Chapter 1: Introduction" 
                     value={submissionTitle}
                     onChange={(e) => setSubmissionTitle(e.target.value)}
                     className="bg-muted/30"
                     required
                   />
                </div>
                
                <div className="space-y-1.5">
                   <Label className="text-xs font-semibold uppercase text-muted-foreground">Document</Label>
                   <Input 
                     type="file" 
                     onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                     className="bg-muted/30 text-xs py-2 file:text-xs file:font-semibold"
                     required
                   />
                </div>

                <Button 
                   type="submit" 
                   disabled={isSubmitting || !submissionTitle || !submissionFile}
                   className="w-full gradient-primary font-bold shadow-lg shadow-primary/20 mt-2"
                >
                   {isSubmitting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                   Submit to Advisor
                </Button>
             </form>
          </div>
        </Card>

        {/* List of Previous Submissions */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          {submissions.length === 0 ? (
             <div className="h-full min-h-[250px] flex flex-col items-center justify-center p-10 border-2 border-dashed border-border/50 rounded-2xl bg-muted/10">
                <FileText className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-bold text-foreground">No Submissions Yet</p>
                <p className="text-xs text-muted-foreground text-center mt-1 max-w-xs">Create your first formal submission on the left to request review from your advisor.</p>
             </div>
          ) : (
            submissions.map((sub) => (
              <Card key={sub.id} className="shadow-sm border-border/50 overflow-hidden">
                 <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                       <div>
                          <Badge variant="outline" className={cn("px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider mb-2", getStatusColor(sub.status))}>
                             {sub.status}
                          </Badge>
                          <h4 className="font-bold text-foreground text-lg">{sub.title}</h4>
                          <p className="text-[11px] text-muted-foreground font-medium mt-1">Submitted on {new Date(sub.submissionDate).toLocaleDateString()}</p>
                       </div>
                       
                       {/* Attached Files */}
                       <div className="flex flex-col gap-2">
                          {sub.files && sub.files.map((fileId, idx) => (
                               <a 
                                 key={idx}
                                 href={fileService.getDownloadUrl(fileId)} 
                                 target="_blank" 
                                 rel="noreferrer"
                               >
                                 <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg text-[10px] font-bold gap-2 hover:bg-primary/5 hover:text-primary border-border/50">
                                   <Download className="w-3.5 h-3.5" />
                                   Download
                                 </Button>
                               </a>
                            )
                          )}
                       </div>
                    </div>
                    
                    {/* Feedback Area */}
                    {sub.feedback && sub.feedback.length > 0 && (
                       <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                          <h5 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                            <MessageSquare className="w-3 h-3" /> Advisor Feedback
                          </h5>
                          {sub.feedback.map((fb, idx) => (
                             <div key={idx} className="bg-muted/40 p-3 rounded-xl border border-border/50 relative">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-xs font-bold text-foreground">{fb.fromUserName}</span>
                                  <span className="text-[9px] text-muted-foreground">{new Date(fb.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-muted-foreground/90 whitespace-pre-line leading-relaxed">{fb.message}</p>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <hr className="border-border/50 my-10" />

      {/* General Vault Module */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <HardDrive className="w-4 h-4" />
          Project Repository Vault
        </h3>
        <div className="flex items-center gap-3">
          <div className="relative group/search">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search repository..."
              className="pl-9 pr-4 py-1.5 text-xs bg-muted/20 border-border/50 rounded-full w-48 focus:w-64 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            className="h-8 rounded-full gradient-primary text-[10px] font-bold gap-2 px-4 shadow-md shadow-primary/10"
            onClick={() => document.getElementById("general-upload")?.click()}
            disabled={isUploading}
          >
            {isUploading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5" />}
            Upload New Document
            <input 
              id="general-upload" 
              type="file" 
              className="hidden" 
              onChange={handleUpload} 
            />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-border/30 rounded-3xl bg-muted/5">
             <div className="w-16 h-16 rounded-2xl bg-background border flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CloudUpload className="w-8 h-8 text-muted-foreground/30" />
             </div>
             <p className="text-sm font-semibold text-foreground">Repository is empty</p>
             <p className="text-xs text-muted-foreground mt-1">Upload reference materials, research papers, or drafts here.</p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <Card key={file.id} className="shadow-sm border-none hover:ring-1 hover:ring-primary/20 transition-all group overflow-hidden bg-background">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                    {getFileIcon(file.fileType)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{file.originalName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase">{file.fileType}</span>
                      <span className="text-[10px] text-muted-foreground/50 text-[8px]">•</span>
                      <span className="text-[10px] text-muted-foreground">{formatFileSize(file.fileSize)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={fileService.getDownloadUrl(file.fileId)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemove(file.id)}
                      className="w-8 h-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

    </div>
  );
};

export default UploadFilesPage;
