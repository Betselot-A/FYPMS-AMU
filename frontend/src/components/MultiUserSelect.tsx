import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Users, CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@/types";

interface MultiUserSelectProps {
  users: UserType[];
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
  className?: string;
}

export const MultiUserSelect: React.FC<MultiUserSelectProps> = ({
  users,
  selectedUserIds,
  onSelectionChange,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onSelectionChange(selectedUserIds.filter((id) => id !== userId));
    } else {
      onSelectionChange([...selectedUserIds, userId]);
    }
  };

  const toggleAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredUsers.map((u) => u.id));
    }
  };

  const isAllSelected = filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search recipients by name, role, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-background/50 focus-visible:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="h-10 px-3 bg-primary/5 text-primary border-primary/20 gap-2 shrink-0">
            <Users className="w-3.5 h-3.5" />
            <span className="font-semibold">{selectedUserIds.length}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-70">Selected</span>
          </Badge>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-background/30 backdrop-blur-sm shadow-inner group">
        <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b border-border">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">RECIPIENTS</span>
          <button
            type="button"
            onClick={toggleAll}
            className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
          >
            {isAllSelected ? "Deselect All" : "Select All Filtered"}
          </button>
        </div>

        <ScrollArea className="h-64 sm:h-80">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-60">
              <Users className="w-10 h-10 mb-2 stroke-1" />
              <p className="text-sm">No users match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 divide-y divide-border/40">
              {filteredUsers.map((u) => {
                const isSelected = selectedUserIds.includes(u.id);
                const initials = u.name.split(" ").map((n) => n[0]).join("").toUpperCase();
                
                return (
                  <div
                    key={u.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-all cursor-pointer select-none group/item hover:bg-muted/30",
                      isSelected && "bg-primary/5 hover:bg-primary/10"
                    )}
                    onClick={() => toggleUser(u.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleUser(u.id)}
                      className="rounded border-border group-hover/item:border-primary/40 data-[state=checked]:border-primary"
                    />
                    <Avatar className="w-8 h-8 border border-border/50 shadow-sm shrink-0">
                      <AvatarFallback className={cn(
                        "text-[10px] font-bold",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 pr-2">
                      <p className={cn(
                        "text-sm font-semibold truncate transition-colors",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {u.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 opacity-70">
                        <span className="text-[10px] truncate">{u.email}</span>
                        <span className="text-[10px] px-1.5 py-0 rounded-full border border-current capitalize shrink-0 opacity-80">
                          {u.role}
                        </span>
                      </div>
                    </div>
                    {isSelected && <CheckSquare className="w-4 h-4 text-primary shrink-0 animate-in zoom-in-50 duration-200" />}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
