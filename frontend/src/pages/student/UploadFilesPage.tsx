// ============================================================
// Student: Upload Files Page
// ============================================================

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, File, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UploadFilesPage = () => {
  const [files, setFiles] = useState<{ name: string; date: string }[]>([
    { name: "proposal_v1.pdf", date: "2025-10-28" },
    { name: "lit_review_v1.pdf", date: "2025-12-10" },
  ]);
  const { toast } = useToast();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;
    const newFiles = Array.from(selected).map((f) => ({
      name: f.name,
      date: new Date().toISOString().split("T")[0],
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    toast({ title: "Files uploaded", description: `${newFiles.length} file(s) added successfully.` });
    e.target.value = "";
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-1">Upload Files</h1>
      <p className="text-muted-foreground text-sm mb-6">Upload your project documents and resources.</p>

      <Card className="shadow-card mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Upload New File</CardTitle>
          <CardDescription>Supported formats: PDF, DOCX, ZIP, images</CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="file-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-10 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
            <FileUp className="w-10 h-10 text-muted-foreground mb-3" />
            <span className="text-sm font-medium text-foreground">Click to browse files</span>
            <span className="text-xs text-muted-foreground mt-1">or drag and drop here</span>
          </Label>
          <Input id="file-upload" type="file" multiple className="hidden" onChange={handleUpload} />
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Uploaded Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {files.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No files uploaded yet.</p>}
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
              <div className="flex items-center gap-3">
                <File className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.date}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleRemove(i)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadFilesPage;
