import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import SupportPage from "./pages/SupportPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";

// Student sub-pages
import UploadFilesPage from "./pages/student/UploadFilesPage";
import SubmitPage from "./pages/student/SubmitPage";
import ProjectStatusPage from "./pages/student/ProjectStatusPage";
import ChatPage from "./pages/student/ChatPage";
import ResultsPage from "./pages/student/ResultsPage";
import EditProfilePage from "./pages/student/EditProfilePage";

// Staff sub-pages
import StaffProjectDetailPage from "./pages/staff/StaffProjectDetailPage";
import ProjectSubmissionsPage from "./pages/staff/ProjectSubmissionsPage";
import ProjectDeadlinesPage from "./pages/staff/ProjectDeadlinesPage";

import ProjectDetailsPage from "./pages/staff/ProjectDetailsPage";
import ProjectEvaluatePage from "./pages/staff/ProjectEvaluatePage";
import ProjectGradesPage from "./pages/staff/ProjectGradesPage";
import ProjectStatusPage_ from "./pages/staff/ProjectStatusPage";
import StaffMessagesPage from "./pages/staff/StaffMessagesPage";

// Coordinator sub-pages
import GroupingPage from "./pages/coordinator/GroupingPage";
import AnnouncementsPage from "./pages/coordinator/AnnouncementsPage";
import ProjectSetupPage from "./pages/coordinator/ProjectSetupPage";
import CriteriaSetupPage from "./pages/coordinator/CriteriaSetupPage";
import ProjectManagementPage from "./pages/coordinator/ProjectManagementPage";
import CoordinatorEvaluationPage from "./pages/coordinator/CoordinatorEvaluationPage";
import AllStudentsPage from "./pages/coordinator/AllStudentsPage";
import EvaluationReportPage from "./pages/coordinator/EvaluationReportPage";

// Admin sub-pages
import GradeSystemPage from "./pages/admin/GradeSystemPage";
import PasswordManagementPage from "./pages/admin/PasswordManagementPage";
import StudentGroupingPage from "./pages/admin/StudentGroupingPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminMessenger from "./pages/admin/AdminMessenger";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import RequireRole from "@/components/RequireRole";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Student routes */}
            <Route path="/dashboard/project/upload" element={<DashboardPage><UploadFilesPage /></DashboardPage>} />
            <Route path="/dashboard/project/submit" element={<DashboardPage><SubmitPage /></DashboardPage>} />
            <Route path="/dashboard/project/status" element={<DashboardPage><ProjectStatusPage /></DashboardPage>} />
            <Route path="/dashboard/notifications" element={<DashboardPage><NotificationsPage /></DashboardPage>} />
            <Route path="/dashboard/messages" element={<DashboardPage><ChatPage /></DashboardPage>} />
            <Route path="/dashboard/results" element={<DashboardPage><ResultsPage /></DashboardPage>} />
            <Route path="/dashboard/profile" element={<DashboardPage><EditProfilePage /></DashboardPage>} />

            {/* Staff: Project detail and sub-pages */}
            <Route path="/dashboard/staff/project/:projectId" element={<DashboardPage><StaffProjectDetailPage /></DashboardPage>} />
            <Route path="/dashboard/staff/project/:projectId/submissions" element={<DashboardPage><ProjectSubmissionsPage /></DashboardPage>} />
            <Route path="/dashboard/staff/project/:projectId/deadlines" element={<DashboardPage><ProjectDeadlinesPage /></DashboardPage>} />

            <Route path="/dashboard/staff/project/:projectId/details" element={<DashboardPage><ProjectDetailsPage /></DashboardPage>} />
            <Route path="/dashboard/staff/project/:projectId/evaluate" element={<DashboardPage><ProjectEvaluatePage /></DashboardPage>} />
            <Route path="/dashboard/staff/project/:projectId/grades" element={<DashboardPage><ProjectGradesPage /></DashboardPage>} />
            <Route path="/dashboard/staff/project/:projectId/status" element={<DashboardPage><ProjectStatusPage_ /></DashboardPage>} />
            <Route path="/dashboard/staff/messages" element={<DashboardPage><AdminMessenger /></DashboardPage>} />


            {/* Coordinator routes */}
            <Route path="/dashboard/coordinator/grouping" element={<DashboardPage><GroupingPage /></DashboardPage>} />
            <Route path="/dashboard/coordinator/announcements" element={<DashboardPage><AnnouncementsPage /></DashboardPage>} />
            <Route path="/dashboard/coordinator/project-setup" element={<DashboardPage><ProjectSetupPage /></DashboardPage>} />
            <Route path="/dashboard/coordinator/criteria-setup" element={<DashboardPage><CriteriaSetupPage /></DashboardPage>} />
            <Route path="/dashboard/coordinator/project-management" element={<DashboardPage><ProjectManagementPage /></DashboardPage>} />
            <Route path="/dashboard/coordinator/evaluation" element={<DashboardPage><CoordinatorEvaluationPage /></DashboardPage>} />
            <Route path="/dashboard/coordinator/students" element={<DashboardPage><AllStudentsPage /></DashboardPage>} />
            <Route path="/dashboard/coordinator/reports" element={<DashboardPage><EvaluationReportPage /></DashboardPage>} />
            <Route path="/dashboard/coordinator/messages" element={<DashboardPage><AdminMessenger /></DashboardPage>} />

            <Route path="/dashboard/admin/users" element={<RequireRole allowedRoles={["admin"]}><DashboardPage><AdminDashboard /></DashboardPage></RequireRole>} />
            <Route path="/dashboard/admin/announcements" element={<RequireRole allowedRoles={["admin"]}><DashboardPage><AnnouncementsPage /></DashboardPage></RequireRole>} />
            <Route path="/dashboard/admin/grouping" element={<RequireRole allowedRoles={["admin"]}><DashboardPage><StudentGroupingPage /></DashboardPage></RequireRole>} />
            <Route path="/dashboard/admin/grade-system" element={<RequireRole allowedRoles={["admin"]}><DashboardPage><GradeSystemPage /></DashboardPage></RequireRole>} />
            <Route path="/dashboard/admin/passwords" element={<RequireRole allowedRoles={["admin"]}><DashboardPage><PasswordManagementPage /></DashboardPage></RequireRole>} />
            <Route path="/dashboard/admin/messages" element={<RequireRole allowedRoles={["admin"]}><DashboardPage><AdminMessenger /></DashboardPage></RequireRole>} />
            <Route path="/dashboard/admin/settings" element={<RequireRole allowedRoles={["admin"]}><DashboardPage><AdminSettingsPage /></DashboardPage></RequireRole>} />

            {/* Legacy routes */}
            <Route path="/dashboard/projects" element={<DashboardPage><PlaceholderPage /></DashboardPage>} />
            <Route path="/dashboard/assign" element={<DashboardPage><PlaceholderPage /></DashboardPage>} />
            <Route path="/dashboard/reports" element={<DashboardPage><PlaceholderPage /></DashboardPage>} />
            <Route path="/dashboard/users" element={<DashboardPage><PlaceholderPage /></DashboardPage>} />
            <Route path="/dashboard/settings" element={<DashboardPage><PlaceholderPage /></DashboardPage>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
