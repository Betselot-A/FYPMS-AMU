import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import RequireRole from "@/components/RequireRole";

// Public Pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const PlaceholderPage = lazy(() => import("./pages/PlaceholderPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Student sub-pages
const UploadFilesPage = lazy(() => import("./pages/student/UploadFilesPage"));
const SubmitPage = lazy(() => import("./pages/student/SubmitPage"));
const ProjectStatusPage = lazy(() => import("./pages/student/ProjectStatusPage"));
const ChatPage = lazy(() => import("./pages/student/ChatPage"));
const ResultsPage = lazy(() => import("./pages/student/ResultsPage"));
const EditProfilePage = lazy(() => import("./pages/student/EditProfilePage"));
const GroupedPage = lazy(() => import("./pages/student/GroupedPage"));
const NotGroupedPage = lazy(() => import("./pages/student/NotGroupedPage"));
const PreviousTitlesPage = lazy(() => import("./pages/student/PreviousTitlesPage"));
const ApprovedTitlesPage = lazy(() => import("./pages/student/ApprovedTitlesPage"));

// Staff sub-pages
const StaffProjectDetailPage = lazy(() => import("./pages/staff/StaffProjectDetailPage"));
const ProjectSubmissionsPage = lazy(() => import("./pages/staff/ProjectSubmissionsPage"));
const ProjectDeadlinesPage = lazy(() => import("./pages/staff/ProjectDeadlinesPage"));
const ProjectDetailsPage = lazy(() => import("./pages/staff/ProjectDetailsPage"));
const ProjectEvaluatePage = lazy(() => import("./pages/staff/ProjectEvaluatePage"));
const ProjectGradesPage = lazy(() => import("./pages/staff/ProjectGradesPage"));
const ProjectStatusPage_ = lazy(() => import("./pages/staff/ProjectStatusPage"));

// Coordinator sub-pages
const GroupingPage = lazy(() => import("./pages/coordinator/GroupingPage"));
const AnnouncementsPage = lazy(() => import("./pages/coordinator/AnnouncementsPage"));
const ProjectSetupPage = lazy(() => import("./pages/coordinator/ProjectSetupPage"));
const CriteriaSetupPage = lazy(() => import("./pages/coordinator/CriteriaSetupPage"));
const ProjectManagementPage = lazy(() => import("./pages/coordinator/ProjectManagementPage"));
const CoordinatorEvaluationPage = lazy(() => import("./pages/coordinator/CoordinatorEvaluationPage"));
const AllStudentsPage = lazy(() => import("./pages/coordinator/AllStudentsPage"));
const EvaluationReportPage = lazy(() => import("./pages/coordinator/EvaluationReportPage"));

// Admin sub-pages
const GradeSystemPage = lazy(() => import("./pages/admin/GradeSystemPage"));
const PasswordManagementPage = lazy(() => import("./pages/admin/PasswordManagementPage"));
const StudentGroupingPage = lazy(() => import("./pages/admin/StudentGroupingPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminMessenger = lazy(() => import("./pages/admin/AdminMessenger"));
const AdminDashboard = lazy(() => import("./pages/dashboards/AdminDashboard"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
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

              {/* Students: Grouping & Project Titles */}
              <Route path="/dashboard/grouping/grouped" element={<DashboardPage><GroupedPage /></DashboardPage>} />
              <Route path="/dashboard/grouping/not-grouped" element={<DashboardPage><NotGroupedPage /></DashboardPage>} />
              <Route path="/dashboard/project-titles/previous" element={<DashboardPage><PreviousTitlesPage /></DashboardPage>} />
              <Route path="/dashboard/project-titles/approved" element={<DashboardPage><ApprovedTitlesPage /></DashboardPage>} />

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

              {/* Admin routes */}
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
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
