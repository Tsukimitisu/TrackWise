import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';

const AppShell = lazy(() => import('./components/AppShell'));
const AnalyticsDashboardPage = lazy(() => import('./pages/analytics/AnalyticsDashboardPage'));
const AdminStatisticsPage = lazy(() => import('./pages/admin/AdminStatisticsPage'));
const AssignmentsPage = lazy(() => import('./pages/assignments/AssignmentsPage'));
const AssignmentDetailPage = lazy(() => import('./pages/assignments/AssignmentDetailPage'));
const AssignmentFormPage = lazy(() => import('./pages/assignments/AssignmentFormPage'));
const AttendancePage = lazy(() => import('./pages/attendance/AttendancePage'));
const TimeInOutPage = lazy(() => import('./pages/attendance/TimeInOutPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const DocumentationDetailPage = lazy(() => import('./pages/documents/DocumentationDetailPage'));
const DocumentationPage = lazy(() => import('./pages/documents/DocumentationPage'));
const DocumentationUploadPage = lazy(() => import('./pages/documents/DocumentationUploadPage'));
const EvaluationDetailPage = lazy(() => import('./pages/evaluations/EvaluationDetailPage'));
const EvaluationFormPage = lazy(() => import('./pages/evaluations/EvaluationFormPage'));
const EvaluationPage = lazy(() => import('./pages/evaluations/EvaluationPage'));
const ModulePage = lazy(() => import('./pages/ModulePage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const OrganizationDetailPage = lazy(() => import('./pages/organizations/OrganizationDetailPage'));
const OrganizationFormPage = lazy(() => import('./pages/organizations/OrganizationFormPage'));
const OrganizationPage = lazy(() => import('./pages/organizations/OrganizationPage'));
const PrintableReportsPage = lazy(() => import('./pages/printables/PrintableReportsPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const ProgramDetailPage = lazy(() => import('./pages/programs/ProgramDetailPage'));
const ProgramFormPage = lazy(() => import('./pages/programs/ProgramFormPage'));
const ProgramsPage = lazy(() => import('./pages/programs/ProgramsPage'));
const ForgotPasswordPage = lazy(() => import('./pages/public/ForgotPasswordPage'));
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage'));
const ResetPasswordPage = lazy(() => import('./pages/public/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/public/VerifyEmailPage'));
const ProgressDetailPage = lazy(() => import('./pages/progress/ProgressDetailPage'));
const ProgressPage = lazy(() => import('./pages/progress/ProgressPage'));
const DailyReportDetailPage = lazy(() => import('./pages/reports/DailyReportDetailPage'));
const DailyReportFormPage = lazy(() => import('./pages/reports/DailyReportFormPage'));
const DailyReportPage = lazy(() => import('./pages/reports/DailyReportPage'));
const WeeklyReportDetailPage = lazy(() => import('./pages/reports/WeeklyReportDetailPage'));
const WeeklyReportFormPage = lazy(() => import('./pages/reports/WeeklyReportFormPage'));
const WeeklyReportPage = lazy(() => import('./pages/reports/WeeklyReportPage'));
const SystemSettingsPage = lazy(() => import('./pages/settings/SystemSettingsPage'));
const OjtSetupPage = lazy(() => import('./pages/student/OjtSetupPage'));
const AssignedTraineeDetailPage = lazy(() => import('./pages/trainees/AssignedTraineeDetailPage'));
const AssignedTraineesPage = lazy(() => import('./pages/trainees/AssignedTraineesPage'));
const UserDetailPage = lazy(() => import('./pages/users/UserDetailPage'));
const UserFormPage = lazy(() => import('./pages/users/UserFormPage'));
const UsersPage = lazy(() => import('./pages/users/UsersPage'));

function RouteFallback() {
  return (
    <div className="flex min-h-[240px] items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-400">
      Loading...
    </div>
  );
}

const page = (node: ReactNode) => <Suspense fallback={<RouteFallback />}>{node}</Suspense>;

const modulePage = (title: string, description: string) => page(<ModulePage title={title} description={description} />);

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={page(<LandingPage />)} />
        <Route path="/login" element={page(<LoginPage />)} />
        <Route path="/register" element={page(<RegisterPage />)} />
        <Route path="/forgot-password" element={page(<ForgotPasswordPage />)} />
        <Route path="/reset-password" element={page(<ResetPasswordPage />)} />
        <Route path="/verify-email" element={page(<VerifyEmailPage />)} />

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={page(<AppShell />)}>
            <Route index element={page(<DashboardPage />)} />
            <Route path="organizations" element={page(<OrganizationPage />)} />
            <Route path="organizations/create" element={page(<OrganizationFormPage />)} />
            <Route path="organizations/:id" element={page(<OrganizationDetailPage />)} />
            <Route path="organizations/:id/edit" element={page(<OrganizationFormPage />)} />
            <Route path="users" element={page(<UsersPage />)} />
            <Route path="users/create" element={page(<UserFormPage />)} />
            <Route path="users/:id" element={page(<UserDetailPage />)} />
            <Route path="users/:id/edit" element={page(<UserFormPage />)} />
            <Route path="programs" element={page(<ProgramsPage />)} />
            <Route path="programs/create" element={page(<ProgramFormPage />)} />
            <Route path="programs/:id" element={page(<ProgramDetailPage />)} />
            <Route path="programs/:id/edit" element={page(<ProgramFormPage />)} />
            <Route path="assignments" element={page(<AssignmentsPage />)} />
            <Route path="assignments/create" element={page(<AssignmentFormPage />)} />
            <Route path="assignments/:id" element={page(<AssignmentDetailPage />)} />
            <Route path="assignments/:id/edit" element={page(<AssignmentFormPage />)} />
            <Route path="attendance" element={page(<AttendancePage />)} />
            <Route path="time-in-out" element={page(<TimeInOutPage />)} />
            <Route path="reports/daily" element={page(<DailyReportPage />)} />
            <Route path="reports/daily/create" element={page(<DailyReportFormPage />)} />
            <Route path="reports/daily/:id" element={page(<DailyReportDetailPage />)} />
            <Route path="reports/daily/:id/edit" element={page(<DailyReportFormPage />)} />
            <Route path="reports/weekly" element={page(<WeeklyReportPage />)} />
            <Route path="reports/weekly/create" element={page(<WeeklyReportFormPage />)} />
            <Route path="reports/weekly/:id" element={page(<WeeklyReportDetailPage />)} />
            <Route path="reports/weekly/:id/edit" element={page(<WeeklyReportFormPage />)} />
            <Route path="documents" element={page(<DocumentationPage />)} />
            <Route path="documents/upload" element={page(<DocumentationUploadPage />)} />
            <Route path="documents/:id" element={page(<DocumentationDetailPage />)} />
            <Route path="evaluations" element={page(<EvaluationPage />)} />
            <Route path="evaluations/create" element={page(<EvaluationFormPage />)} />
            <Route path="evaluations/:id" element={page(<EvaluationDetailPage />)} />
            <Route path="evaluations/:id/edit" element={page(<EvaluationFormPage />)} />
            <Route path="daily-reports" element={modulePage('Daily Reports', 'Create, submit, and review daily work reports.')} />
            <Route path="weekly-reports" element={modulePage('Weekly Reports', 'Create, submit, and review weekly narrative reports.')} />
            <Route path="reports" element={modulePage('Reports', 'Printable DTR and export-ready summaries.')} />
            <Route path="settings" element={page(<SystemSettingsPage />)} />
            <Route path="analytics" element={page(<AnalyticsDashboardPage />)} />
            <Route path="admin-statistics" element={page(<AdminStatisticsPage />)} />
            <Route path="progress" element={page(<ProgressPage />)} />
            <Route path="progress/:id" element={page(<ProgressDetailPage />)} />
            <Route path="assigned-trainees" element={page(<AssignedTraineesPage />)} />
            <Route path="assigned-trainees/:id" element={page(<AssignedTraineeDetailPage />)} />
            <Route path="printables" element={page(<PrintableReportsPage />)} />
            <Route path="notifications" element={page(<NotificationsPage />)} />
            <Route path="profile" element={page(<ProfilePage />)} />
            <Route path="ojt-setup" element={page(<OjtSetupPage />)} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
