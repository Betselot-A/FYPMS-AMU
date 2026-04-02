import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Trash2, 
  Save, 
  Trophy, 
  RefreshCw,
  Palette,
  ShieldCheck,
  CheckCircle2,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { gradeService } from "@/api";
import { GradeBand } from "@/api/gradeService";
import { cn } from "@/lib/utils";

const COLOR_OPTIONS = [
  { class: "bg-success/10 text-success border-success/20", color: "bg-success" },
  { class: "bg-primary/10 text-primary border-primary/20", color: "bg-primary" },
  { class: "bg-warning/10 text-warning border-warning/20", color: "bg-warning" },
  { class: "bg-destructive/10 text-destructive border-destructive/20", color: "bg-destructive" },
  { class: "bg-muted/30 text-muted-foreground border-border/50", color: "bg-muted-foreground/40" },
];

const getRecommendedColor = (label: string) => {
  const l = label.toUpperCase();
  if (l.startsWith("A")) return COLOR_OPTIONS[0].class;
  if (l.startsWith("B")) return COLOR_OPTIONS[1].class;
  if (l.startsWith("C") || l.startsWith("D")) return COLOR_OPTIONS[2].class;
  if (l.startsWith("F")) return COLOR_OPTIONS[3].class;
  return COLOR_OPTIONS[1].class;
};

const GradeSystemPage = () => {
  const [bands, setBands] = useState<GradeBand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch real data from database
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await gradeService.getConfig();
      const rawBands = res.data.bands || [];
      const validColorClasses = new Set(COLOR_OPTIONS.map((o) => o.class));

      // If all bands share the same color, it's the old default — apply smart colors
      const uniqueColors = new Set(rawBands.map((b) => b.color));
      const allSameColor = rawBands.length > 0 && uniqueColors.size === 1;

      const loaded = rawBands.map((band) => ({
        ...band,
        color: allSameColor || !validColorClasses.has(band.color)
          ? getRecommendedColor(band.label)
          : band.color,
      }));
      setBands(loaded);
    } catch (error) {
      toast.error("Failed to load grading system standards.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Persist only bands from Admin side to avoid overwriting coordinator's phases
      await gradeService.updateConfig({ bands });
      toast.success("Academic grading standards updated successfully!");
    } catch (error) {
      toast.error("Failed to save standards.");
    } finally {
      setIsSaving(false);
    }
  };

  const addBand = () => {
    const newLabel = "New";
    setBands(prev => [
      ...prev,
      { 
        id: `g-${Date.now()}`, 
        label: newLabel, 
        minScore: 0, 
        maxScore: 0, 
        color: getRecommendedColor(newLabel)
      }
    ]);
  };

  const updateBand = (id: string, updates: Partial<GradeBand>) => {
    setBands(prev => prev.map(b => {
      if (b.id === id) {
        const newBand = { ...b, ...updates };
        // Auto-suggest color when label changes, unless user explicitly chose a palette color
        if (updates.label !== undefined && !updates.color) {
          newBand.color = getRecommendedColor(updates.label);
        }
        return newBand;
      }
      return b;
    }));
  };

  const removeBand = (id: string) => {
    setBands(prev => prev.filter(b => b.id !== id));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 border-b">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Trophy className="w-5 h-5 text-primary-foreground" />
             </div>
             Academic Standards
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Admin: Define the global institutional grade boundaries.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <Button 
            disabled={isSaving} 
            onClick={handleSave}
            className="gradient-primary text-primary-foreground h-11 px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
           >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Publish Bands
                </>
              )}
           </Button>
        </div>
      </div>

      {/* Role Context Informer */}
      <Card className="bg-info/5 border-info/20 shadow-none">
         <CardContent className="p-4 flex items-start gap-4">
            <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
            <div className="space-y-1">
               <p className="text-sm font-bold text-info">System Architecture</p>
               <p className="text-xs text-info/70 leading-relaxed">
                  The Admin is responsible for the <b>Academic Bands</b> (A+ to F). The Coordinator manages the <b>Evaluation Phases</b> (Weights & Criteria). Both work together to form the complete grading system.
               </p>
            </div>
         </CardContent>
      </Card>

      {/* Institutional Grading Standards Section */}
      <div className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
               <Palette className="w-6 h-6 text-primary" />
               Institutional Grading Standards
            </h2>
            <Button onClick={addBand} variant="outline" className="h-11 px-6 border-2 border-primary/20 rounded-2xl hover:bg-primary/5 font-semibold text-xs uppercase tracking-wider text-primary shadow-sm active:scale-95 transition-all">
               <Plus className="w-4 h-4 mr-2" /> Add Grade Level
            </Button>
         </div>

         <div className="overflow-hidden rounded-[2rem] border border-border/50 shadow-2xl shadow-primary/5 bg-background/50 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-muted/30 text-muted-foreground font-semibold uppercase text-xs tracking-wider border-b border-border/50">
                     <th className="py-6 px-10">Grade Symbol</th>
                     <th className="py-6 px-8 text-center w-64">Performance Range (%)</th>
                     <th className="py-6 px-8">Aesthetics & Theme</th>
                     <th className="py-6 px-8 text-right">Operations</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border/20">
                  {bands.map((band) => (
                    <tr key={band.id} className="group hover:bg-primary/[0.03] transition-all duration-300">
                      <td className="py-5 px-10">
                        <div className="flex items-center gap-4">
                           <div className={cn(
                             "w-12 h-12 rounded-2xl flex items-center justify-center font-display font-bold text-lg shadow-inner ring-4 ring-background transition-all group-hover:scale-110",
                             band.color
                           )}>
                              {band.label || "?"}
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Level Label</label>
                               <Input 
                                 value={band.label}
                                 onChange={(e) => updateBand(band.id, { label: e.target.value })}
                                 className="h-9 w-32 font-semibold bg-muted/40 border-none px-3 text-sm focus-visible:ring-primary/20"
                                 placeholder="e.g. A+"
                               />
                           </div>
                        </div>
                      </td>
                      
                      <td className="py-5 px-8">
                         <div className="flex items-center justify-center gap-3">
                            <div className="space-y-1">
                               <label className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider text-center block">MIN</label>
                               <Input 
                                 type="number"
                                 value={band.minScore}
                                 onChange={(e) => updateBand(band.id, { minScore: parseInt(e.target.value) || 0 })}
                                 className="h-10 w-20 text-center font-semibold bg-muted/20 border-none text-base"
                               />
                            </div>
                            <div className="h-0.5 w-4 bg-muted-foreground/20 mt-5 shrink-0" />
                            <div className="space-y-1">
                               <label className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider text-center block">MAX</label>
                               <Input 
                                 type="number"
                                 value={band.maxScore}
                                 onChange={(e) => updateBand(band.id, { maxScore: parseInt(e.target.value) || 0 })}
                                 className="h-10 w-20 text-center font-semibold bg-muted/20 border-none text-base"
                               />
                            </div>
                         </div>
                      </td>

                      <td className="py-5 px-8">
                         <div className="space-y-2">
                           <label className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Theme Palette</label>
                           <div className="flex gap-2 p-1.5 bg-muted/30 rounded-2xl border border-border/50 w-fit">
                              {COLOR_OPTIONS.map((opt) => (
                                 <button
                                   key={opt.class}
                                   title={opt.class.split(" ")[1].replace("text-", "")}
                                   onClick={() => updateBand(band.id, { color: opt.class })}
                                   className={cn(
                                     "w-7 h-7 rounded-full border-4 border-background shadow-sm shrink-0 transition-all hover:scale-125 hover:rotate-12",
                                     opt.color,
                                     band.color === opt.class && "ring-2 ring-primary ring-offset-2 scale-110 z-10"
                                   )}
                                 />
                              ))}
                           </div>
                         </div>
                      </td>

                      <td className="py-5 px-8 text-right">
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                          onClick={() => removeBand(band.id)}
                         >
                            <Trash2 className="w-5 h-5" />
                         </Button>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {bands.length === 0 && (
           <div className="py-32 text-center bg-muted/5 border-2 border-dashed border-border/50 rounded-[3rem] opacity-50 flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-muted/10 flex items-center justify-center mb-6">
                 <Trophy className="w-10 h-10 text-muted-foreground" />
              </div>
               <p className="font-bold text-lg text-muted-foreground uppercase tracking-wider">No definitions found</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Start by adding a new grade level above.</p>
           </div>
         )}
      </div>

      {/* Sync Footer */}
      <footer className="bg-success/5 border border-success/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-4 text-success">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
               <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
               <p className="text-sm font-bold capitalize">Institutional Consistency</p>
               <p className="text-xs opacity-80">All changes are synchronized with the live academic database.</p>
            </div>
         </div>
         <Badge variant="outline" className="hover:bg-success/10 transition-colors uppercase font-semibold tracking-wider bg-success/10 border-success/30 text-success">
            <CheckCircle2 className="w-3 h-3 mr-2" /> Live Connection Active
         </Badge>
      </footer>
    </div>
  );
};

export default GradeSystemPage;
