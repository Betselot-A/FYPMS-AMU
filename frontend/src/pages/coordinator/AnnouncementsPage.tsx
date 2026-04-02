import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { User } from "@/types";
import { notificationService, userService } from "@/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MultiUserSelect } from "@/components/MultiUserSelect";
import { Send, Loader2, MailPlus, User as UserIcon, Megaphone, Info, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type NotifType = "info" | "warning" | "success" | "deadline";

const typeConfig: Record<NotifType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  info: { label: "Info", icon: <Info className="w-3.5 h-3.5" />, color: "text-info", bg: "bg-info/10" },
  warning: { label: "Warning", icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "text-warning", bg: "bg-warning/10" },
  success: { label: "Success", icon: <CheckCircle className="w-3.5 h-3.5" />, color: "text-success", bg: "bg-success/10" },
  deadline: { label: "Deadline", icon: <Calendar className="w-3.5 h-3.5" />, color: "text-destructive", bg: "bg-destructive/10" },
};

const AnnouncementsPage = () => {
  const [searchParams] = useSearchParams();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isSendingCompose, setIsSendingCompose] = useState(false);
  const [composeForm, setComposeForm] = useState({
    target: "broadcast" as "specific" | "broadcast",
    userIds: [] as string[],
    subject: "",
    message: "",
    type: "info" as NotifType,
  });

  const fetchData = useCallback(async () => {
    try {
      const usersRes = await userService.getAll({ limit: 1000 });
      setAllUsers(usersRes.data.users);
    } catch {
      toast.error("Could not load users data");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle URL pre-selection
  useEffect(() => {
    const userId = searchParams.get("userId");
    if (userId && allUsers.length > 0) {
       const userExists = allUsers.some(u => u.id === userId);
       if (userExists) {
          setComposeForm(f => ({
             ...f,
             target: "specific",
             userIds: [userId]
          }));
       }
    }
  }, [searchParams, allUsers]);

  const handleComposeSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeForm.message.trim()) return;
    if (composeForm.target === "specific" && composeForm.userIds.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    setIsSendingCompose(true);
    try {
      const payload = composeForm.target === "broadcast"
        ? { subject: composeForm.subject, message: composeForm.message, type: composeForm.type }
        : { userIds: composeForm.userIds, subject: composeForm.subject, message: composeForm.message, type: composeForm.type };

      await notificationService.create(payload);
      toast.success("Broadcast delivered successfully");
      setComposeForm(prev => ({ ...prev, subject: "", message: "", userIds: [] }));
    } catch (err: any) {
      toast.error("Failed to deliver broadcast");
    } finally {
      setIsSendingCompose(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
             <Megaphone className="w-4 h-4 text-primary-foreground" />
          </div>
          Announcements
        </h1>
        <p className="text-sm text-muted-foreground">Broadcast official system messages and targeted announcements.</p>
      </div>

      <Card className="shadow-card border-none overflow-hidden">
         <CardHeader className="py-5 px-8 border-b border-border bg-muted/5">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
               <MailPlus className="w-6 h-6 text-primary" />
             </div>
             <div>
               <CardTitle className="text-xl font-bold">New Message</CardTitle>
               <CardDescription>Compose a targeted message or system-wide broadcast</CardDescription>
             </div>
           </div>
         </CardHeader>
         <CardContent className="p-8">
           <form onSubmit={handleComposeSend} className="space-y-6">
             <div className="space-y-3">
               <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">RECIPIENT TYPE</label>
               <div className="grid grid-cols-2 gap-4">
                  <button
                   type="button"
                   onClick={() => setComposeForm(f => ({ ...f, target: "specific" }))}
                   className={cn(
                     "flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all group",
                     composeForm.target === "specific" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
                   )}
                 >
                   <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", composeForm.target === "specific" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      <UserIcon className="w-5 h-5" />
                   </div>
                   <div>
                     <p className={cn("font-bold", composeForm.target === "specific" ? "text-primary" : "text-foreground")}>Targeted</p>
                     <p className="text-[10px] text-muted-foreground/80 mt-0.5">Send to specific user(s)</p>
                   </div>
                 </button>
                 <button
                   type="button"
                   onClick={() => setComposeForm(f => ({ ...f, target: "broadcast" }))}
                   className={cn(
                     "flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all group",
                     composeForm.target === "broadcast" ? "border-warning bg-warning/5" : "border-border hover:border-border/80"
                   )}
                 >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", composeForm.target === "broadcast" ? "bg-warning text-white" : "bg-muted text-muted-foreground")}>
                      <Megaphone className="w-5 h-5" />
                   </div>
                   <div>
                     <p className={cn("font-bold", composeForm.target === "broadcast" ? "text-warning" : "text-foreground")}>Broadcast</p>
                     <p className="text-[10px] text-muted-foreground/80 mt-0.5">Send to all members</p>
                   </div>
                 </button>
               </div>
             </div>

             {composeForm.target === "specific" && (
               <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">SELECT RECIPIENTS</label>
                  <MultiUserSelect 
                   users={allUsers}
                   selectedUserIds={composeForm.userIds}
                   onSelectionChange={(ids) => setComposeForm(f => ({ ...f, userIds: ids }))}
                  />
               </div>
             )}

             <Separator />

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3">
                 <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">ALERT LEVEL</label>
                 <Select value={composeForm.type} onValueChange={(v) => setComposeForm(f => ({ ...f, type: v as NotifType }))}>
                   <SelectTrigger className="h-12 rounded-xl border-none bg-muted/40 font-medium">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {(Object.keys(typeConfig) as NotifType[]).map((t) => (
                       <SelectItem key={t} value={t}>
                         <div className="flex items-center gap-2">
                           <span className={typeConfig[t].color}>{typeConfig[t].icon}</span>
                           <span className="font-semibold">{typeConfig[t].label}</span>
                         </div>
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">SUBJECT</label>
                  <Input 
                   placeholder="Importance message topic..."
                   value={composeForm.subject}
                   onChange={(e) => setComposeForm(f => ({ ...f, subject: e.target.value }))}
                   className="h-12 border-none bg-muted/40 rounded-xl"
                  />
               </div>
             </div>

             <div className="space-y-3">
               <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">MESSAGE CONTENT</label>
               <Textarea 
                 required
                 placeholder="Type your announcement details here..."
                 className="min-h-[160px] border-none bg-muted/40 rounded-2xl p-6 text-base resize-none"
                 value={composeForm.message}
                 onChange={(e) => setComposeForm(f => ({ ...f, message: e.target.value }))}
               />
             </div>

             <div className="pt-4">
               <Button 
                 type="submit" 
                 disabled={isSendingCompose || !composeForm.message.trim() || (composeForm.target === "specific" && composeForm.userIds.length === 0)}
                 className="w-full h-16 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold gradient-primary shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-95"
               >
                 {isSendingCompose ? <><Loader2 className="w-5 h-5 animate-spin" /> DELIVERING...</> : <><Send className="w-5 h-5" /> BROADCAST ANNOUNCEMENT</>}
               </Button>
             </div>
           </form>
         </CardContent>
      </Card>
    </div>
  );
};

export default AnnouncementsPage;
