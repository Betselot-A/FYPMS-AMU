// ============================================================
// ProjectHub Dashboard Layout
// Main interface structure including navigation and user profile.
// ============================================================

import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { GraduationCap, LayoutDashboard, FolderOpen, MessageSquare,
  Bell, Users, ClipboardCheck, BarChart3, Settings, LogOut, Award, UserCog,
  FileUp, Activity, ChevronDown, ChevronRight, UserPen, Wrench, Key, Megaphone,
  PanelLeftClose, PanelLeftOpen, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface NavItem {
  label: string;
  icon: ReactNode;
  path?: string;
  children?: { label: string; icon?: ReactNode; path: string }[];
}

const getStudentNav = (): NavItem[] => [
  { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, path: "/dashboard" },
  {
    label: "Grouping",
    icon: <Users className="w-4 h-4" />,
    children: [
      { label: "Grouped", path: "/dashboard/grouping/grouped" },
      { label: "Not Grouped", path: "/dashboard/grouping/not-grouped" },
    ],
  },
  {
    label: "Project Titles",
    icon: <FolderOpen className="w-4 h-4" />,
    children: [
      { label: "Previous Titles", path: "/dashboard/project-titles/previous" },
      { label: "Titles Submission", path: "/dashboard/project/submit" },
      { label: "View Approved Titles", path: "/dashboard/project-titles/approved" },
    ],
  },
  {
    label: "Project",
    icon: <ClipboardCheck className="w-4 h-4" />,
    children: [
      { label: "Upload Files", icon: <FileUp className="w-4 h-4" />, path: "/dashboard/project/upload" },
      { label: "Status", icon: <Activity className="w-4 h-4" />, path: "/dashboard/project/status" },
    ],
  },
  { label: "Notifications", icon: <Bell className="w-4 h-4" />, path: "/dashboard/notifications" },
  { label: "Messages", icon: <MessageSquare className="w-4 h-4" />, path: "/dashboard/messages" },
  { label: "Results", icon: <Award className="w-4 h-4" />, path: "/dashboard/results" },
  { label: "Edit Profile", icon: <UserPen className="w-4 h-4" />, path: "/dashboard/profile" },
];

const getStaffNav = (user: User): NavItem[] => {
  const items: NavItem[] = [
    { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, path: "/dashboard" },
    { label: "Messenger", icon: <MessageSquare className="w-4 h-4" />, path: "/dashboard/staff/messages" },
    { label: "Notifications", icon: <Bell className="w-4 h-4" />, path: "/dashboard/notifications" },
    { label: "Edit Profile", icon: <UserPen className="w-4 h-4" />, path: "/dashboard/profile" },
  ];

  return items;
};

const getNavConfig = (user: User): NavItem[] => {
  switch (user.role) {
    case "student":
      return getStudentNav();
    case "staff":
      return getStaffNav(user);
    case "coordinator":
      return [
        { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, path: "/dashboard" },
        { label: "Announcements", icon: <Megaphone className="w-4 h-4" />, path: "/dashboard/coordinator/announcements" },
        { label: "Student Grouping", icon: <Users className="w-4 h-4" />, path: "/dashboard/coordinator/grouping" },
        { label: "Project Setup", icon: <FolderOpen className="w-4 h-4" />, path: "/dashboard/coordinator/project-setup" },
        { label: "Criteria Setup", icon: <Settings className="w-4 h-4" />, path: "/dashboard/coordinator/criteria-setup" },
        { label: "Project Mgmt", icon: <Wrench className="w-4 h-4" />, path: "/dashboard/coordinator/project-management" },
        { label: "Evaluation", icon: <ClipboardCheck className="w-4 h-4" />, path: "/dashboard/coordinator/evaluation" },
        { label: "All Students", icon: <Users className="w-4 h-4" />, path: "/dashboard/coordinator/students" },
        { label: "Reports", icon: <BarChart3 className="w-4 h-4" />, path: "/dashboard/coordinator/reports" },
        { label: "Messenger", icon: <MessageSquare className="w-4 h-4" />, path: "/dashboard/coordinator/messages" },
        { label: "Notifications", icon: <Bell className="w-4 h-4" />, path: "/dashboard/notifications" },
        { label: "Edit Profile", icon: <UserPen className="w-4 h-4" />, path: "/dashboard/profile" },
      ];
    case "admin":
      return [
        { label: "Manage Users", icon: <UserCog className="w-4 h-4" />, path: "/dashboard/admin/users" },
        { label: "Announcements", icon: <Megaphone className="w-4 h-4" />, path: "/dashboard/admin/announcements" },
        { label: "Group Analysis", icon: <Users className="w-4 h-4" />, path: "/dashboard/admin/grouping" },
        { label: "Grade System", icon: <BarChart3 className="w-4 h-4" />, path: "/dashboard/admin/grade-system" },
        { label: "Passwords", icon: <Key className="w-4 h-4" />, path: "/dashboard/admin/passwords" },
        { label: "Messenger", icon: <MessageSquare className="w-4 h-4" />, path: "/dashboard/admin/messages" },
        { label: "Settings", icon: <Settings className="w-4 h-4" />, path: "/dashboard/admin/settings" },
        { label: "Notifications", icon: <Bell className="w-4 h-4" />, path: "/dashboard/notifications" },
        { label: "Edit Profile", icon: <UserPen className="w-4 h-4" />, path: "/dashboard/profile" },
      ];
    default:
      return [];
  }
};

interface DashboardLayoutProps {
  children: ReactNode;
}

const NavItems = ({ 
  items, 
  currentPath, 
  isCollapsed, 
  unreadCount,
  onItemClick 
}: { 
  items: NavItem[]; 
  currentPath: string; 
  isCollapsed: boolean;
  unreadCount: number;
  onItemClick?: () => void;
}) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (!isCollapsed) {
      items.forEach((item) => {
        if (item.children?.some((c) => currentPath === c.path)) {
          initial[item.label] = true;
        }
      });
    }
    return initial;
  });

  // Keep sidebar groups in sync with current path
  useEffect(() => {
    if (!isCollapsed) {
      items.forEach((item) => {
        if (item.children?.some((c) => currentPath === c.path)) {
          setOpenGroups((prev) => ({ ...prev, [item.label]: true }));
        }
      });
    }
  }, [currentPath, items, isCollapsed]);

  const toggleGroup = (label: string) => {
    if (isCollapsed) return; // Disable expansion in collapsed mode
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <nav className={cn(
      "flex-1 pl-4 space-y-2 py-4 overflow-y-auto hide-scrollbar scroll-smooth",
      isCollapsed && "px-2"
    )}>
      {items.map((item) => {
        if (item.children) {
          const isOpen = !isCollapsed && (openGroups[item.label] || false);
          const isChildActive = item.children.some((c) => currentPath === c.path);

          const trigger = (
            <button
              onClick={() => toggleGroup(item.label)}
              className={cn(
                "w-full flex items-center justify-center h-12 rounded-l-full text-sm font-bold transition-all duration-300 group relative",
                isCollapsed ? "px-0" : "px-3 gap-3",
                isChildActive && !isOpen
                  ? "text-primary bg-sidebar-accent/30"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
                isCollapsed && isChildActive && "bg-background liquid-collapsed-parent z-[100] mr-[-4px]"
              )}
            >
              <div className={cn("transition-all duration-300 shrink-0 flex items-center justify-center", isCollapsed ? "w-10 h-10 rounded-xl" : "w-6 h-6", isChildActive ? "scale-110 text-primary" : "group-hover:scale-110")}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {isOpen ? <ChevronDown className="w-3.5 h-3.5 opacity-50" /> : <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                </>
              )}
            </button>
          );

          return (
            <div key={item.label}>
              {isCollapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>{trigger}</TooltipTrigger>
                  <TooltipContent side="right" className="ml-2 font-bold">{item.label}</TooltipContent>
                </Tooltip>
              ) : trigger}

              {isOpen && !isCollapsed && (
                <div className="ml-4 mt-1.5 space-y-0.5 relative pl-2 animate-in slide-in-from-top-2 duration-200">
                  <div className="absolute left-[13px] top-0 bottom-2 w-px bg-sidebar-border/40" />
                      {item.children.map((child) => {
                        const isActive = currentPath === child.path;
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={onItemClick}
                            className={cn(
                              "flex items-center gap-3 px-3 h-10 rounded-l-full text-sm transition-all duration-300 group relative",
                              isActive
                                ? "bg-background text-primary font-black liquid-child z-[100] mr-[-4px] shadow-[-15px_0_30px_-15px_rgba(0,0,0,0.15),4px_0_0_0_hsl(var(--background))]"
                                : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground z-10"
                            )}
                          >
                            <div className={cn("transition-all duration-300 shrink-0 flex items-center justify-center w-5 h-5", isActive ? "scale-100" : "group-hover:translate-x-1")}>
                              {child.icon || <div className="w-2 h-2 rounded-full bg-current shadow-[0_0_8px_currentColor] transition-all" />}
                            </div>
                            <span className="truncate leading-none pt-[1px]">{child.label}</span>
                          </Link>
                        );
                      })}
                </div>
              )}
            </div>
          );
        }

        const isActive = currentPath === item.path;
        const isNotifications = item.label === "Notifications";
        const link = (
          <Link
            key={item.path}
            to={item.path!}
            onClick={onItemClick}
            className={cn(
              "w-full flex items-center h-12 rounded-l-full text-sm font-bold transition-all duration-300 group relative",
              isCollapsed ? "justify-center px-0" : "justify-start px-3 gap-3",
              isActive
                ? cn(
                    "bg-background text-primary z-[100] mr-[-4px] shadow-[-15px_0_30px_-15px_rgba(0,0,0,0.15),4px_0_0_0_hsl(var(--background))]",
                    isCollapsed ? "liquid-collapsed-parent" : "liquid-parent"
                  )
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground z-10"
            )}
          >
            <div className={cn("transition-all duration-300 shrink-0 flex items-center justify-center relative", isCollapsed ? "w-10 h-10 rounded-xl" : "w-6 h-6", isActive ? "scale-110 text-primary" : "group-hover:scale-110")}>
              {item.icon}
              {isNotifications && unreadCount > 0 && (
                <span className={cn(
                  "absolute flex h-2.5 w-2.5",
                  isCollapsed ? "top-1 right-1" : "-top-1 -right-1"
                )}>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary border-2 border-sidebar"></span>
                </span>
              )}
            </div>
            {!isCollapsed && (
              <span className="truncate leading-none pt-[1px] flex-1 flex items-center justify-between">
                {item.label}
                {isNotifications && unreadCount > 0 && (
                  <Badge className="h-5 min-w-[20px] px-1.5 flex items-center justify-center bg-primary text-[10px] border-none font-black animate-in zoom-in duration-300">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </span>
            )}
          </Link>
        );

        return isCollapsed ? (
          <Tooltip key={item.label} delayDuration={0}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right" className="ml-2 font-bold">{item.label}</TooltipContent>
          </Tooltip>
        ) : link;
      })}
    </nav>
  );
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    return saved === "true";
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", isCollapsed.toString());
  }, [isCollapsed]);

  if (!user) return null;

  const navItems = getNavConfig(user);
  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Display role label with formatting
  const roleLabel = user.role === "staff"
    ? `Staff${user.staffAssignment?.isAdvisor && user.staffAssignment?.isExaminer ? " (Advisor & Examiner)" : user.staffAssignment?.isAdvisor ? " (Advisor)" : user.staffAssignment?.isExaminer ? " (Examiner)" : ""}`
    : user.role.charAt(0).toUpperCase() + user.role.slice(1);

  const SidebarContent = ({ collapsed = false, isMobile = false }) => (
    <>
      <div className={cn("p-6 border-b border-sidebar-border mb-2 relative group-logo", collapsed && "p-4")}>
        <Link 
          to="/dashboard" 
          className={cn("flex items-center gap-3 group/logo logo-glow", collapsed && "justify-center")}
          onClick={() => isMobile && setIsMobileOpen(false)}
        >
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover/logo:scale-105 transition-transform duration-500 shrink-0">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-in fade-in duration-500">
              <span className="font-display font-bold text-lg tracking-tight text-sidebar-foreground leading-none">ProjectHub</span>
              <span className="text-[10px] text-sidebar-foreground/40 font-bold uppercase tracking-[0.2em] mt-1 text-center lg:text-left">Management</span>
            </div>
          )}
        </Link>

        {/* Sidebar Toggle Button - Only show on desktop */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="toggle-btn absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-sidebar-border text-sidebar-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-md z-30 opacity-0 scale-90"
          >
            {isCollapsed ? <PanelLeftOpen className="w-3 h-3" /> : <PanelLeftClose className="w-3 h-3" />}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <NavItems 
          items={navItems} 
          currentPath={location.pathname} 
          isCollapsed={collapsed} 
          unreadCount={unreadCount}
          onItemClick={() => isMobile && setIsMobileOpen(false)}
        />
      </div>

      <div className={cn("p-5 border-t border-sidebar-border mt-auto bg-sidebar-accent/10 transition-all", collapsed && "p-4")}>
        <div className={cn("flex items-center gap-3 mb-4 p-2 rounded-2xl bg-sidebar-accent/20 border border-sidebar-border/30", collapsed && "justify-center px-0")}>
          <Avatar className="w-10 h-10 border-2 border-sidebar-primary/10 shadow-inner shrink-0 leading-[10px]">
            <AvatarFallback className="bg-sidebar-primary/5 text-sidebar-primary text-sm font-black">{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="overflow-hidden animate-in fade-in duration-500">
              <p className="text-sm font-bold text-sidebar-foreground truncate leading-tight group-hover:text-sidebar-primary transition-colors">{user.name}</p>
              <p className="text-[9px] text-sidebar-foreground/30 uppercase font-black tracking-[0.1em] mt-1">{roleLabel}</p>
            </div>
          )}
        </div>

        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 h-11 rounded-2xl transition-all duration-200 font-bold group",
                  collapsed && "justify-center px-0"
                )}
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                {!collapsed && <span className="ml-2 uppercase text-[10px] tracking-widest">Sign Out</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right" className="ml-2 font-bold bg-destructive text-white">Sign Out</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-background overflow-hidden relative font-sans antialiased text-foreground">
      <style>{`
        @keyframes logo-pulse {
          0% { filter: drop-shadow(0 0 2px hsl(var(--primary) / 0.1)); }
          50% { filter: drop-shadow(0 0 10px hsl(var(--primary) / 0.3)); }
          100% { filter: drop-shadow(0 0 2px hsl(var(--primary) / 0.1)); }
        }
        .logo-glow {
          animation: logo-pulse 3s infinite ease-in-out;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        /* Mathematical Perfection: S-Curves synced to heights */
        .liquid-parent::before, .liquid-parent::after,
        .liquid-child::before, .liquid-child::after {
          content: "";
          position: absolute;
          right: 0;
          background-color: transparent;
          pointer-events: none;
          z-index: 100;
        }

        /* Parent (h-12 = 48px) -> 24px Radius Join */
        .liquid-parent::before, .liquid-parent::after { width: 48px; height: 48px; }
        .liquid-parent::before { top: -48px; border-bottom-right-radius: 24px; box-shadow: 20px 20px 0 0 hsl(var(--background)); }
        .liquid-parent::after { bottom: -48px; border-top-right-radius: 24px; box-shadow: 20px -20px 0 0 hsl(var(--background)); }

        /* Child (h-10 = 40px) -> 20px Radius Join */
        .liquid-child::before, .liquid-child::after { width: 40px; height: 40px; }
        .liquid-child::before { top: -40px; border-bottom-right-radius: 20px; box-shadow: 20px 20px 0 0 hsl(var(--background)); }
        .liquid-child::after { bottom: -40px; border-top-right-radius: 20px; box-shadow: 20px -20px 0 0 hsl(var(--background)); }

        /* Collapsed Selection (Minimalist Liquid) */
        .liquid-collapsed-parent::before, .liquid-collapsed-parent::after {
          content: "";
          position: absolute;
          right: 0;
          width: 25px;
          height: 25px;
          background-color: transparent;
          pointer-events: none;
          z-index: 100;
        }
        .liquid-collapsed-parent::before { top: -25px; border-bottom-right-radius: 15px; box-shadow: 10px 10px 0 0 hsl(var(--background)); }
        .liquid-collapsed-parent::after { bottom: -25px; border-top-right-radius: 15px; box-shadow: 10px -10px 0 0 hsl(var(--background)); }

        .group-logo:hover .toggle-btn {
          opacity: 1;
          transform: translateY(-50%) scale(1);
        }
      `}</style>

      {/* Mobile Header */}
      <header className="lg:hidden h-16 border-b bg-sidebar text-sidebar-foreground px-4 flex items-center justify-between shrink-0 z-30">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-base tracking-tight">ProjectHub</span>
        </Link>
        
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent/50">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-sidebar border-sidebar-border w-72">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">Access different sections of the ProjectHub portal.</SheetDescription>
            <div className="h-full flex flex-col">
              <SidebarContent isMobile />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground hidden lg:flex flex-col shrink-0 shadow-2xl relative z-20 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      <main className="flex-1 min-w-0 overflow-hidden relative h-full bg-background z-10 transition-all duration-300">
        <div className={cn(
          "animate-fade-in h-full transition-all duration-300",
          location.pathname.includes("/messages") ? "p-0" : "p-4 sm:p-6 lg:p-8 overflow-y-auto"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
