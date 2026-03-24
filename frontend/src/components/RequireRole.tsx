// ============================================================
// RequireRole — Protects routes by checking the user's role.
// Redirects unauthorized users to their own dashboard.
// ============================================================

import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

interface RequireRoleProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

const RequireRole = ({ allowedRoles, children }: RequireRoleProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard — don't expose a 403 page
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RequireRole;
