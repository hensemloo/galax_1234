import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import StaffLayout from '../layouts/StaffLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminInspectionDetailPage from '../pages/admin/AdminInspectionDetailPage';
import AdminInspectionsPage from '../pages/admin/AdminInspectionsPage';
import AdminReportPage from '../pages/admin/AdminReportPage';
import BlockDetailPage from '../pages/admin/BlockDetailPage';
import AdminBlocksPage from '../pages/admin/AdminBlocksPage';
import DiseaseInfoPage from '../pages/admin/DiseaseInfoPage';
import TreeHistoryPage from '../pages/admin/TreeHistoryPage';
import AdminTreesPage from '../pages/admin/AdminTreesPage';
import LoginPage from '../pages/auth/LoginPage';
import ComponentsPreviewPage from '../pages/dev/ComponentsPreviewPage';
import NotFoundPage from '../pages/NotFoundPage';
import DiseaseGuidePage from '../pages/staff/DiseaseGuidePage';
import HomePage from '../pages/staff/HomePage';
import InspectionFullReportPage from '../pages/staff/InspectionFullReportPage';
import InspectionHistoryPage from '../pages/staff/InspectionHistoryPage';
import InspectionPrintPage from '../pages/staff/InspectionPrintPage';
import InspectionReportPage from '../pages/staff/InspectionReportPage';
import InspectionSummaryPage from '../pages/staff/InspectionSummaryPage';
import NewInspectionPage from '../pages/staff/NewInspectionPage';
import PodPhotosPage from '../pages/staff/PodPhotosPage';
import ProfilePage from '../pages/staff/ProfilePage';
import ReviewPodsPage from '../pages/staff/ReviewPodsPage';
import { getHomePath } from './homePath';
import ProtectedRoute from './ProtectedRoute';

// "/" sends each user to the right place.
function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? getHomePath(user.role) : '/login'} replace />;
}

// Routes match CLAUDE.md section 7. Role "staff" = Field officer, role "admin" = Supervisor.
// URL helpers for officer screens are in utils/inspectionRoutes.js.
function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        {/* DEV ONLY: component preview. Not registered in production builds. */}
        {import.meta.env.DEV && (
          <Route path="/dev/components" element={<ComponentsPreviewPage />} />
        )}

        {/* Field officer */}
        <Route element={<ProtectedRoute role="staff" />}>
          {/* Header, avatar and tab bar per page are set in layouts/StaffLayout.jsx. */}
          <Route element={<StaffLayout />}>
            <Route path="/staff" element={<HomePage />} />
            <Route path="/staff/inspections" element={<InspectionHistoryPage />} />
            <Route path="/staff/profile" element={<ProfilePage />} />
            <Route path="/staff/diseases" element={<DiseaseGuidePage />} />
            <Route path="/staff/inspections/:id/report" element={<InspectionReportPage />} />
            <Route path="/staff/inspections/:id" element={<InspectionFullReportPage />} />
          </Route>

          {/* Wizard (O2–O5): each page renders StaffWizardLayout with its step number. No tab bar. */}
          <Route path="/staff/inspections/new" element={<NewInspectionPage />} />
          <Route path="/staff/inspections/:id/photos" element={<PodPhotosPage />} />
          <Route path="/staff/inspections/:id/review" element={<ReviewPodsPage />} />
          <Route path="/staff/inspections/:id/summary" element={<InspectionSummaryPage />} />

          {/* Print page for Download PDF (O6): only the A4 report, no header or tab bar. */}
          <Route path="/staff/inspections/:id/print" element={<InspectionPrintPage />} />
        </Route>

        {/* Supervisor */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/inspections" element={<AdminInspectionsPage />} />
            <Route path="/admin/inspections/:id" element={<AdminInspectionDetailPage />} />
            <Route path="/admin/inspections/:id/report" element={<AdminReportPage />} />
            <Route path="/admin/blocks" element={<AdminBlocksPage />} />
            <Route path="/admin/blocks/:blockId" element={<BlockDetailPage />} />
            <Route path="/admin/trees" element={<AdminTreesPage />} />
            <Route path="/admin/trees/:treeId" element={<TreeHistoryPage />} />
            <Route path="/admin/diseases" element={<DiseaseInfoPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
