// ============================================================
// ProjectHub Dashboard Entry Point
// Routes users to their specific professional dashboard based on role.
// ============================================================

import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StudentDashboard from "@/pages/dashboards/StudentDashboard";
import StaffDashboard from "@/pages/dashboards/StaffDashboard";
import CoordinatorDashboard from "@/pages/dashboards/CoordinatorDashboard";
import AdminDashboard from "@/pages/dashboards/AdminDashboard";

import ForcePasswordChange from "@/components/ForcePasswordChange";

const dashboardByRole: Record<string, React.FC> = {
  student: StudentDashboard,
  staff: StaffDashboard,
  coordinator: CoordinatorDashboard,
  admin: AdminDashboard,
};

interface DashboardPageProps {
  children?: ReactNode;
}

const DashboardPage = ({ children }: DashboardPageProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground text-sm animate-pulse">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const RoleDashboard = dashboardByRole[user.role] || StudentDashboard;

  if (user.mustChangePassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <ForcePasswordChange />
      </div>
    );
  }

  return (
    <DashboardLayout>
      {children || <RoleDashboard />}
    </DashboardLayout>
  );
};

export default DashboardPage;
