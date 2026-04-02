// ============================================================
// ProjectHub Dashboard Layout
// Main interface structure including navigation and user profile.
// ============================================================

import { ReactNode, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, LayoutDashboard, FolderOpen, MessageSquare,
  Bell, Users, ClipboardCheck, BarChart3, Settings, LogOut, Award, UserCog,
  FileUp, Send, Activity, ChevronDown, ChevronRight, UserPen, Video, Clock,
  Wrench, Key, UserCheck, Mail, Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface NavItem {
  label: string;
  icon: ReactNode;
  path?: string;
  children?: { label: string; icon: ReactNode; path: string }[];
}

const getStudentNav = (): NavItem[] => [
  { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, path: "/dashboard" },
  {
    label: "Project",
    icon: <FolderOpen className="w-4 h-4" />,
    children: [
      { label: "Upload Files", icon: <FileUp className="w-4 h-4" />, path: "/dashboard/project/upload" },
      { label: "Submit", icon: <Send className="w-4 h-4" />, path: "/dashboard/project/submit" },
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

const NavItems = ({ items, currentPath }: { items: NavItem[]; currentPath: string }) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.children?.some((c) => currentPath === c.path)) {
        initial[item.label] = true;
      }
    });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <nav className="flex-1 p-3 space-y-1">
      {items.map((item) => {
        if (item.children) {
          const isOpen = openGroups[item.label] || false;
          const isChildActive = item.children.some((c) => currentPath === c.path);
          return (
            <div key={item.label}>
              <button
                onClick={() => toggleGroup(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isChildActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {isOpen && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {item.children.map((child) => {
                    const isActive = currentPath === child.path;
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                          ? "bg-sidebar-accent text-sidebar-primary font-medium"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                          }`}
                      >
                        {child.icon}
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        const isActive = currentPath === item.path;
        return (
          <Link
            key={item.path}
            to={item.path!}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
              ? "bg-sidebar-accent text-sidebar-primary"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const navItems = getNavConfig(user);
  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Display role label
  const roleLabel = user.role === "staff"
    ? `Staff${user.staffAssignment?.isAdvisor && user.staffAssignment?.isExaminer ? " (Advisor & Examiner)" : user.staffAssignment?.isAdvisor ? " (Advisor)" : user.staffAssignment?.isExaminer ? " (Examiner)" : ""}`
    : user.role;

  return (
    <div className="h-screen flex bg-background overflow-hidden relative">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shrink-0 shadow-sm relative z-20">
        <div className="p-5 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-normal text-university text-sidebar-foreground">ProjectHub</span>
          </Link>
        </div>

        <NavItems items={navItems} currentPath={location.pathname} />

        <div className="p-4 border-t border-sidebar-border mt-auto">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-9 h-9 border border-sidebar-border/50 shadow-sm">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-sidebar-foreground truncate leading-tight">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/60 uppercase font-black tracking-widest mt-0.5">{roleLabel}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 h-9 rounded-lg" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-hidden relative h-full bg-background z-10">
        <div className={cn(
          "animate-fade-in h-full",
          location.pathname.includes("/messages") ? "p-0" : "p-6 lg:p-8 overflow-y-auto"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
