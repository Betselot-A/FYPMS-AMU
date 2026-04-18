import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { User } from "@/types";
import { notificationService, userService } from "@/api";
import { SentNotification } from "@/api/notificationService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiUserSelect } from "@/components/MultiUserSelect";
import { Send, Loader2, Megaphone, Info, AlertTriangle, CheckCircle, Calendar, Plus, History, Users, Eye } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

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
  const [history, setHistory] = useState<SentNotification[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [isSendingCompose, setIsSendingCompose] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const [composeForm, setComposeForm] = useState({
    target: "broadcast" as "specific" | "broadcast" | "students" | "staff",
    userIds: [] as string[],
    subject: "",
    message: "",
    type: "info" as NotifType,
    date: format(new Date(), "yyyy-MM-dd"),
  });

  const fetchData = useCallback(async () => {
    try {
      const usersRes = await userService.getAll({ limit: 1000 });
      setAllUsers(usersRes.data.users);
    } catch {
      toast.error("Roster Sync Error", { 
        description: "Failed to connect to the central user directory." 
      });
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await notificationService.getSent();
      setHistory(res.data);
    } catch {
      toast.error("History Error", { 
        description: "Could not retrieve your broadcast records." 
      });
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchHistory();
  }, [fetchData, fetchHistory]);

  const hasPreselected = useRef(false);

  // Handle URL pre-selection
  useEffect(() => {
    const userId = searchParams.get("userId");
    if (userId && allUsers.length > 0 && !hasPreselected.current) {
       const userExists = allUsers.some(u => u.id === userId);
       if (userExists) {
          setComposeForm(f => ({
             ...f,
             target: "specific",
             userIds: [userId]
          }));
          hasPreselected.current = true;
          setIsComposing(true); // Open form if preselected
       }
    }
  }, [searchParams, allUsers]);

  // Group notifications by broadcast context
  const groupedAnnouncements = useMemo(() => {
    const groups: Record<string, { data: SentNotification; count: number; recipients: string[] }> = {};
    
    history.forEach(notif => {
      const key = `${notif.subject}-${notif.message}-${notif.type}-${notif.createdAt}`;
      if (!groups[key]) {
        groups[key] = { data: notif, count: 0, recipients: [] };
      }
      groups[key].count++;
      if (notif.userId?.name) {
        groups[key].recipients.push(notif.userId.name);
      }
    });

    return Object.values(groups).sort((a, b) => 
      new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime()
    );
  }, [history]);

  const handleComposeSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeForm.message.trim()) return;
    
    let targetUserIds: string[] | undefined = undefined;
    
    if (composeForm.target === "specific") {
      if (composeForm.userIds.length === 0) {
        toast.error("Please select at least one recipient");
        return;
      }
      targetUserIds = composeForm.userIds;
    } else if (composeForm.target === "students") {
      targetUserIds = allUsers.filter(u => u.role === "student").map(u => u.id);
    } else if (composeForm.target === "staff") {
      targetUserIds = allUsers.filter(u => u.role === "staff").map(u => u.id);
    }

    setIsSendingCompose(true);
    try {
      const payload: any = { 
        subject: composeForm.subject, 
        message: composeForm.message, 
        type: composeForm.type,
        date: composeForm.date,
        isAnnouncement: true
      };

      if (targetUserIds) {
        payload.userIds = targetUserIds;
      }

      await notificationService.create(payload);
      toast.success("Announcement Published", { 
        description: "Official announcement delivered successfully to recipients." 
      });
      setComposeForm(prev => ({ ...prev, subject: "", message: "", userIds: [] }));
      setIsComposing(false);
      fetchHistory(); // Refresh history
    } catch (err: any) {
      toast.error("Broadcast Failed", { 
        description: "Communication server rejected the delivery." 
      });
    } finally {
      setIsSendingCompose(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 mb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Announcements</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage system announcements</p>
        </div>
        {!isComposing && (
          <Button 
            onClick={() => setIsComposing(true)}
            className="gradient-primary text-white font-bold px-6 h-11 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> New Announcement
          </Button>
        )}
      </div>

      {/* Creation Form */}
      {isComposing && (
        <Card className="shadow-2xl border-none overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <CardHeader className="py-6 px-8 border-b border-border bg-muted/5">
            <CardTitle className="text-lg font-bold text-foreground font-display">Create Announcement</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleComposeSend} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">SUBJECT TITLE</label>
                <Input 
                  placeholder="Announcement title"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm(f => ({ ...f, subject: e.target.value }))}
                  className="h-12 border-border/50 bg-muted/20 rounded-xl focus-visible:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">MESSAGE CONTENT</label>
                <Textarea 
                  required
                  placeholder="Announcement content..."
                  className="min-h-[140px] border-border/50 bg-muted/20 rounded-xl p-4 text-base resize-none focus-visible:ring-primary/20"
                  value={composeForm.message}
                  onChange={(e) => setComposeForm(f => ({ ...f, message: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">DISPLAY DATE</label>
                  <Input 
                    type="date"
                    value={composeForm.date}
                    onChange={(e) => setComposeForm(f => ({ ...f, date: e.target.value }))}
                    className="h-12 border-border/50 bg-muted/20 rounded-xl focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">TARGET AUDIENCE</label>
                  <Select 
                    value={composeForm.target} 
                    onValueChange={(v) => setComposeForm(f => ({ ...f, target: v as any }))}
                  >
                    <SelectTrigger className="h-12 border-border/50 bg-muted/20 rounded-xl focus-visible:ring-primary/20 font-medium">
                      <SelectValue placeholder="Select Audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="broadcast">All Users</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="staff">Staff Only</SelectItem>
                      <SelectItem value="specific">Specific Recipients</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">ALERT LEVEL</label>
                  <Select value={composeForm.type} onValueChange={(v) => setComposeForm(f => ({ ...f, type: v as NotifType }))}>
                    <SelectTrigger className="h-12 border-border/50 bg-muted/20 rounded-xl focus-visible:ring-primary/20 font-medium">
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
              </div>

              {composeForm.target === "specific" && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                   <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">SELECT RECIPIENTS</label>
                   <MultiUserSelect 
                    users={allUsers}
                    selectedUserIds={composeForm.userIds}
                    onSelectionChange={(ids) => setComposeForm(f => ({ ...f, userIds: ids }))}
                   />
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSendingCompose || !composeForm.message.trim() || (composeForm.target === "specific" && composeForm.userIds.length === 0)}
                  className="h-12 px-10 rounded-xl flex items-center justify-center gap-2 font-bold gradient-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {isSendingCompose ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Publish
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setIsComposing(false)}
                  className="h-12 px-10 rounded-xl font-bold border-border bg-white hover:bg-muted transition-all"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Broadcast History Table */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border/60 pb-3">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <History className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground font-display">Broadcast History</h2>
            <p className="text-xs text-muted-foreground">Previous system-wide and targeted messages</p>
          </div>
        </div>

        {groupedAnnouncements.length === 0 && !isLoadingHistory ? (
          <div className="text-center py-12 px-10 rounded-3xl bg-muted/20 border-2 border-dashed border-border/50">
             <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center mx-auto mb-4">
                <Megaphone className="w-8 h-8 text-muted-foreground/40" />
             </div>
             <p className="text-muted-foreground font-medium">No announcments found</p>
             <p className="text-xs text-muted-foreground/60 mt-1">Sent broadcasts will appear here in chronological order.</p>
          </div>
        ) : (
          <Card className="border-none shadow-card overflow-hidden">
             <Table>
                <TableHeader className="bg-muted/30 text-nowrap">
                   <TableRow>
                      <TableHead className="py-4 pl-8 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Subject Title</TableHead>
                      <TableHead className="py-4 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Message</TableHead>
                      <TableHead className="py-4 text-[10px] text-muted-foreground font-bold uppercase tracking-wider text-center">Users</TableHead>
                      <TableHead className="py-4 text-[10px] text-muted-foreground font-bold uppercase tracking-wider text-center">Alert</TableHead>
                      <TableHead className="py-4 text-[10px] text-muted-foreground font-bold uppercase tracking-wider text-right pr-8">Date with Time</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {groupedAnnouncements.map((ann, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/10 transition-colors group">
                         <TableCell className="py-6 pl-8 align-top">
                            <p className="font-bold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">{ann.data.subject || "No Title"}</p>
                         </TableCell>
                         <TableCell className="py-6 align-top">
                            <p className="text-xs text-muted-foreground/80 leading-relaxed italic line-clamp-2 max-w-[300px]">{ann.data.message}</p>
                         </TableCell>
                         <TableCell className="py-6 align-top">
                            <div className="flex flex-col items-center">
                               <div className="flex items-center gap-1.5 text-foreground font-bold text-[10px]">
                                  <Users className="w-3 h-3 opacity-60" />
                                  <span>{ann.count}</span>
                               </div>
                            </div>
                         </TableCell>
                         <TableCell className="py-6 align-top">
                            <div className="flex justify-center">
                               <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
                                  <span className="opacity-60">{typeConfig[ann.data.type as NotifType]?.icon}</span>
                                  {typeConfig[ann.data.type as NotifType]?.label}
                               </div>
                            </div>
                         </TableCell>
                         <TableCell className="py-6 pr-8 text-right align-top">
                            <p className="text-xs font-semibold text-foreground/80">{format(parseISO(ann.data.createdAt), "MMM d, yyyy")}</p>
                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">{format(parseISO(ann.data.createdAt), "HH:mm:ss")}</p>
                         </TableCell>
                      </TableRow>
                   ))}
                </TableBody>
             </Table>
          </Card>
        )}
        
        {isLoadingHistory && (
          <div className="flex justify-center py-10">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
