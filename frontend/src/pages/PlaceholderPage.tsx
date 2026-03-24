// ============================================================
// ProjectHub Component Placeholder
// Temporary view for features currently in active development.
// ============================================================

import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

const PlaceholderPage = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Extract page name from path
  const pageName = location.pathname.split("/").pop() || "Page";

  return (
    <DashboardLayout>
      <Card className="shadow-card">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <Construction className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-display font-bold text-foreground capitalize">{pageName}</h2>
          <p className="text-muted-foreground text-sm mt-2">
            This ProjectHub module is currently being finalized. Please check back soon for full functionality.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PlaceholderPage;
