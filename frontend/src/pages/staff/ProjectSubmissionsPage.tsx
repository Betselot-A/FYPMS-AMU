import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Clock, 
  User, 
  FolderOpen,
  ExternalLink,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { projectService, fileService } from "@/api";
import { Project } from "@/api/projectService";
import { ProjectFile } from "@/api/fileService";
import { cn } from "@/lib/utils";

const ProjectSubmissionsPage = () => {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "advisor";
  
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      const [projRes, fileRes] = await Promise.all([
        projectService.getById(projectId),
        fileService.getProjectFiles(projectId)
      ]);
      setProject(projRes.data);
      setFiles(fileRes.data);
    } catch (error) {
      toast.error("Could not load project submissions.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
           <Skeleton className="h-32 w-full" />
           <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!project) return <div className="p-20 text-center text-muted-foreground">Project records not found.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <Link to={`/dashboard/staff/project/${projectId}?role=${role}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary mb-6 transition-all group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        BACK TO PROJECT OVERVIEW
      </Link>

      <div className="mb-10">
         <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-primary border-primary/20 uppercase text-[10px] font-black tracking-widest px-2 py-0.5">
               Project Vault
            </Badge>
            <Badge variant="secondary" className="bg-muted text-muted-foreground border-none font-bold uppercase text-[9px] px-2 h-5">
               {files.length} Documents
            </Badge>
         </div>
         <h1 className="text-3xl font-display font-black text-foreground">Submissions & Deliverables</h1>
         <p className="text-sm text-muted-foreground mt-1">Review the research documents and technical artifacts uploaded by the group.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {files.length === 0 ? (
          <Card className="border-none bg-muted/20 shadow-none border-dashed border-2 border-border/50">
            <CardContent className="p-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-background border flex items-center justify-center mb-6 shadow-sm">
                <FolderOpen className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No Submissions Found</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-2">
                The students have not uploaded any files to the project vault yet. You will be notified as soon as a document is available for review.
              </p>
            </CardContent>
          </Card>
        ) : (
          files.map((file) => (
            <Card key={file.id} className="shadow-card border-none hover:ring-1 hover:ring-primary/20 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center shadow-inner group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{file.originalName}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                         <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(file.uploadedAt).toLocaleDateString()}
                         </div>
                         <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            <span className="w-1 h-1 rounded-full bg-border" />
                            {formatFileSize(file.fileSize)}
                         </div>
                         <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-primary tracking-widest">
                            <span className="w-1 h-1 rounded-full bg-primary/40" />
                            {file.fileCategory || "General"}
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <a 
                      href={`http://localhost:5000${file.filePath}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full md:w-auto"
                    >
                      <Button variant="outline" size="sm" className="w-full h-10 px-6 rounded-xl border-border/50 hover:bg-muted font-bold uppercase text-[10px] tracking-widest gap-2">
                        <ExternalLink className="w-3.5 h-3.5" /> Preview
                      </Button>
                    </a>
                    <a 
                      href={`http://localhost:5000${file.filePath}`} 
                      download={file.originalName}
                      className="w-full md:w-auto"
                    >
                      <Button size="sm" className="w-full h-10 px-6 rounded-xl gradient-primary text-primary-foreground font-bold uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-primary/10">
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                    </a>
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

export default ProjectSubmissionsPage;
