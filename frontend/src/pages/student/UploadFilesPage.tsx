import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileUp, 
  File as FileIcon, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  Archive, 
  CloudUpload,
  HardDrive,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import projectService, { Project } from "@/api/projectService";
import fileService, { ProjectFile } from "@/api/fileService";
import { cn } from "@/lib/utils";

const UploadFilesPage = () => {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const projRes = await projectService.getAll();
      const myProject = projRes.data.find(p => p.groupMembers.some(m => (typeof m === 'string' ? m : m.id) === user.id));
      
      if (myProject) {
        setProject(myProject);
        const fileRes = await fileService.getProjectFiles(myProject.id);
        setFiles(fileRes.data);
      }
    } catch (error) {
      toast.error("Failed to sync project documents.");
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
      toast.success("Document added to project repository.");
      fetchData(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Storage upload failed.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await fileService.deleteFile(id);
      setFiles(prev => prev.filter(f => f.id !== id));
      toast.success("Document removed from repository.");
    } catch (error) {
      toast.error("Failed to remove document.");
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
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-10 space-y-2">
        <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] font-black tracking-widest px-2 py-0.5">
           PROJECT VAULT
        </Badge>
        <h1 className="text-4xl font-display font-black text-foreground">Document Repository</h1>
        <p className="text-sm text-muted-foreground">Secure collective storage for project: <span className="text-foreground font-bold">{project.title}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card className="md:col-span-3 shadow-xl shadow-primary/5 border-none bg-muted/30 hover:bg-muted/40 transition-all group relative overflow-hidden">
          <CardContent className="p-0">
            <Label htmlFor="file-upload" className="flex flex-col items-center justify-center p-12 cursor-pointer h-full min-h-[160px]">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {isUploading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <CloudUpload className="w-6 h-6" />}
              </div>
              <span className="text-sm font-black text-foreground uppercase tracking-widest">
                {isUploading ? "Uploading to secure vault..." : "Upload Research Document"}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium mt-1">PDF, DOCX, ZIP OR IMAGES (MAX 10MB)</span>
            </Label>
            <Input id="file-upload" type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
          </CardContent>
        </Card>

        <div className="space-y-4">
           <Card className="shadow-card border-none bg-background p-6 flex flex-col justify-center items-center text-center">
              <p className="text-3xl font-black text-primary">{files.length}</p>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">TOTAL DOCUMENTS</p>
           </Card>
           <Card className="shadow-card border-none bg-background p-6 flex flex-col justify-center items-center text-center">
              <p className="text-sm font-black text-foreground">
                 {(files.reduce((s, f) => s + f.fileSize, 0) / (1024 * 1024)).toFixed(1)} MB
              </p>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">VAULT UTILIZATION</p>
           </Card>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
              <RefreshCw className="w-3 h-3" />
              COLLECTIVE ASSETS
           </h3>
           <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input 
                placeholder="Search vault..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-[10px] font-bold uppercase tracking-widest rounded-lg border-none bg-muted/50"
              />
           </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredFiles.length === 0 && (
             <div className="py-16 text-center border-2 border-dashed border-muted rounded-3xl">
                <FileIcon className="w-10 h-10 text-muted/20 mx-auto mb-3" />
                <p className="text-sm font-bold text-muted-foreground">The project vault is currently empty.</p>
             </div>
          )}
          
          {filteredFiles.map((file) => (
            <Card key={file.id} className="shadow-card border-none hover:ring-2 hover:ring-primary/20 transition-all group overflow-hidden">
               <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                     <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                           {getFileIcon(file.fileType)}
                        </div>
                        <div className="min-w-0">
                           <p className="text-sm font-bold text-foreground truncate">{file.originalName}</p>
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{formatFileSize(file.fileSize)}</span>
                              <span className="text-[10px] text-muted-foreground italic">By {file.uploadedBy.name}</span>
                              <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-black uppercase text-muted-foreground/60 border-muted-foreground/20">
                                 {file.fileType}
                              </Badge>
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-2">
                        <a 
                          href={import.meta.env.VITE_API_BASE_URL?.replace('/api', '') + file.filePath} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                           <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">
                              <Download className="w-4 h-4" />
                           </Button>
                        </a>
                        {(file.uploadedBy.id === user.id || user.role === 'coordinator') && (
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             onClick={() => handleRemove(file.id)}
                             className="w-9 h-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                           >
                              <Trash2 className="w-4 h-4" />
                           </Button>
                        )}
                     </div>
                  </div>
               </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="mt-12 p-6 bg-primary/5 rounded-3xl border border-primary/10 flex items-start gap-4">
         <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-primary" />
         </div>
         <div>
            <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Secure Storage Protocol</h4>
            <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
               All documents uploaded here are encrypted and accessible only to your project team members, designated advisor, and the department coordinator.
            </p>
         </div>
      </div>
    </div>
  );
};

export default UploadFilesPage;
