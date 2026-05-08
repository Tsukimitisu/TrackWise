import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AppShell from './components/AppShell';
import AttendancePage from './pages/attendance/AttendancePage';
import AnalyticsDashboardPage from './pages/analytics/AnalyticsDashboardPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ModulePage from './pages/ModulePage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import TimeInOutPage from './pages/attendance/TimeInOutPage';
import DailyReportPage from './pages/reports/DailyReportPage';
import DailyReportDetailPage from './pages/reports/DailyReportDetailPage';
import DailyReportFormPage from './pages/reports/DailyReportFormPage';
import WeeklyReportPage from './pages/reports/WeeklyReportPage';
import WeeklyReportDetailPage from './pages/reports/WeeklyReportDetailPage';
import WeeklyReportFormPage from './pages/reports/WeeklyReportFormPage';
import DocumentationPage from './pages/documents/DocumentationPage';
import DocumentationUploadPage from './pages/documents/DocumentationUploadPage';
import DocumentationDetailPage from './pages/documents/DocumentationDetailPage';
import EvaluationPage from './pages/evaluations/EvaluationPage';
import EvaluationFormPage from './pages/evaluations/EvaluationFormPage';
import EvaluationDetailPage from './pages/evaluations/EvaluationDetailPage';
import OrganizationPage from './pages/organizations/OrganizationPage';
import OrganizationFormPage from './pages/organizations/OrganizationFormPage';
import OrganizationDetailPage from './pages/organizations/OrganizationDetailPage';
import ProgramsPage from './pages/programs/ProgramsPage';
import ProgramFormPage from './pages/programs/ProgramFormPage';
import ProgramDetailPage from './pages/programs/ProgramDetailPage';
import UsersPage from './pages/users/UsersPage';
import UserFormPage from './pages/users/UserFormPage';
import UserDetailPage from './pages/users/UserDetailPage';
import AssignmentsPage from './pages/assignments/AssignmentsPage';
import AssignmentFormPage from './pages/assignments/AssignmentFormPage';
import AssignmentDetailPage from './pages/assignments/AssignmentDetailPage';
import ProgressPage from './pages/progress/ProgressPage';
import SystemSettingsPage from './pages/settings/SystemSettingsPage';
import ProfilePage from './pages/profile/ProfilePage';
import ProgressDetailPage from './pages/progress/ProgressDetailPage';
import PrintableReportsPage from './pages/printables/PrintableReportsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import AdminStatisticsPage from './pages/admin/AdminStatisticsPage';
import AssignedTraineesPage from './pages/trainees/AssignedTraineesPage';
import AssignedTraineeDetailPage from './pages/trainees/AssignedTraineeDetailPage';

const modulePage = (title: string, description: string) => <ModulePage title={title} description={description} />;

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="organizations" element={<OrganizationPage />} />
            <Route path="organizations/create" element={<OrganizationFormPage />} />
            <Route path="organizations/:id" element={<OrganizationDetailPage />} />
            <Route path="organizations/:id/edit" element={<OrganizationFormPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/create" element={<UserFormPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
            <Route path="users/:id/edit" element={<UserFormPage />} />
            <Route path="programs" element={<ProgramsPage />} />
            <Route path="programs/create" element={<ProgramFormPage />} />
            <Route path="programs/:id" element={<ProgramDetailPage />} />
            <Route path="programs/:id/edit" element={<ProgramFormPage />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="assignments/create" element={<AssignmentFormPage />} />
            <Route path="assignments/:id" element={<AssignmentDetailPage />} />
            <Route path="assignments/:id/edit" element={<AssignmentFormPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="time-in-out" element={<TimeInOutPage />} />
            <Route path="reports/daily" element={<DailyReportPage />} />
            <Route path="reports/daily/create" element={<DailyReportFormPage />} />
            <Route path="reports/daily/:id" element={<DailyReportDetailPage />} />
            <Route path="reports/daily/:id/edit" element={<DailyReportFormPage />} />
            <Route path="reports/weekly" element={<WeeklyReportPage />} />
            <Route path="reports/weekly/create" element={<WeeklyReportFormPage />} />
            <Route path="reports/weekly/:id" element={<WeeklyReportDetailPage />} />
            <Route path="reports/weekly/:id/edit" element={<WeeklyReportFormPage />} />
            <Route path="documents" element={<DocumentationPage />} />
            <Route path="documents/upload" element={<DocumentationUploadPage />} />
            <Route path="documents/:id" element={<DocumentationDetailPage />} />
            <Route path="evaluations" element={<EvaluationPage />} />
            <Route path="evaluations/create" element={<EvaluationFormPage />} />
            <Route path="evaluations/:id" element={<EvaluationDetailPage />} />
            <Route path="evaluations/:id/edit" element={<EvaluationFormPage />} />
            <Route path="daily-reports" element={modulePage('Daily Reports', 'Create, submit, and review daily work reports.')} />
            <Route path="weekly-reports" element={modulePage('Weekly Reports', 'Create, submit, and review weekly narrative reports.')} />
            <Route path="reports" element={modulePage('Reports', 'Printable DTR and export-ready summaries.')} />
            <Route path="settings" element={<SystemSettingsPage />} />
            <Route path="analytics" element={<AnalyticsDashboardPage />} />
            <Route path="admin-statistics" element={<AdminStatisticsPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="progress/:id" element={<ProgressDetailPage />} />
            <Route path="assigned-trainees" element={<AssignedTraineesPage />} />
            <Route path="assigned-trainees/:id" element={<AssignedTraineeDetailPage />} />
            <Route path="printables" element={<PrintableReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
