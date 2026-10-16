import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import StaffLayout from '../layouts/StaffLayout';
import ActivityLogsPage from '../pages/admin/ActivityLogsPage';
import AdminAssessmentDetailPage from '../pages/admin/AdminAssessmentDetailPage';
import AdminAssessmentsPage from '../pages/admin/AdminAssessmentsPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AssessmentRulesPage from '../pages/admin/AssessmentRulesPage';
import StaffManagementPage from '../pages/admin/StaffManagementPage';
import LoginPage from '../pages/auth/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import AiScreeningPage from '../pages/staff/AiScreeningPage';
import AssessmentDetailPage from '../pages/staff/AssessmentDetailPage';
import AssessmentHistoryPage from '../pages/staff/AssessmentHistoryPage';
import AssessmentResultPage from '../pages/staff/AssessmentResultPage';
import BatchInfoPage from '../pages/staff/BatchInfoPage';
import MeasurementsPage from '../pages/staff/MeasurementsPage';
import ProfilePage from '../pages/staff/ProfilePage';
import ReviewPage from '../pages/staff/ReviewPage';
import StaffDashboardPage from '../pages/staff/StaffDashboardPage';
import UploadImagePage from '../pages/staff/UploadImagePage';
import { getHomePath } from './homePath';
import ProtectedRoute from './ProtectedRoute';

// "/" sends each user to the right place.
function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? getHomePath(user.role) : '/login'} replace />;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Staff */}
        <Route element={<ProtectedRoute role="staff" />}>
          <Route element={<StaffLayout />}>
            <Route path="/staff" element={<StaffDashboardPage />} />
            <Route path="/staff/assessments" element={<AssessmentHistoryPage />} />
            <Route path="/staff/assessments/:id" element={<AssessmentDetailPage />} />
            <Route path="/staff/profile" element={<ProfilePage />} />
          </Route>

          {/* New assessment wizard: each page renders StaffWizardLayout with its step number. */}
          <Route path="/staff/assessments/new" element={<BatchInfoPage />} />
          <Route path="/staff/assessments/:id/upload" element={<UploadImagePage />} />
          <Route path="/staff/assessments/:id/screening" element={<AiScreeningPage />} />
          <Route path="/staff/assessments/:id/measurements" element={<MeasurementsPage />} />
          <Route path="/staff/assessments/:id/result" element={<AssessmentResultPage />} />
          <Route path="/staff/assessments/:id/review" element={<ReviewPage />} />
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/assessments" element={<AdminAssessmentsPage />} />
            <Route path="/admin/assessments/:id" element={<AdminAssessmentDetailPage />} />
            <Route path="/admin/staff" element={<StaffManagementPage />} />
            <Route path="/admin/rules" element={<AssessmentRulesPage />} />
            <Route path="/admin/logs" element={<ActivityLogsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
