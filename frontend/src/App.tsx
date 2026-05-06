import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AppShell from './components/AppShell';
import AttendancePage from './pages/attendance/AttendancePage';
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
            <Route path="organizations" element={modulePage('Organizations', 'Create, update, activate, and deactivate organizations.')} />
            <Route path="users" element={modulePage('Users', 'Manage role-based user accounts and assignments.')} />
            <Route path="programs" element={modulePage('Programs', 'Configure tracker programs and required hours.')} />
            <Route path="assignments" element={modulePage('Assignments', 'Assign users to programs, supervisors, and coordinators.')} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="time-in-out" element={<TimeInOutPage />} />
            <Route path="reports/daily" element={<DailyReportPage />} />
            <Route path="reports/daily/create" element={<DailyReportFormPage />} />
            <Route path="reports/daily/:id" element={<DailyReportDetailPage />} />
            <Route path="reports/daily/:id/edit" element={<DailyReportFormPage />} />
            <Route path="daily-reports" element={modulePage('Daily Reports', 'Create, submit, and review daily work reports.')} />
            <Route path="weekly-reports" element={modulePage('Weekly Reports', 'Create, submit, and review weekly narrative reports.')} />
            <Route path="documents" element={modulePage('Documents', 'Upload, preview, and review supporting documents.')} />
            <Route path="evaluations" element={modulePage('Evaluations', 'Score attendance, performance, communication, and professionalism.')} />
            <Route path="reports" element={modulePage('Reports', 'Printable DTR and export-ready summaries.')} />
            <Route path="settings" element={modulePage('System Settings', 'Manage organization-level and global settings.')} />
            <Route path="progress" element={modulePage('Progress Tracking', 'Monitor completed hours and remaining requirements.')} />
            <Route path="assigned-trainees" element={modulePage('Assigned Trainees', 'View users assigned to your scope.')} />
            <Route path="printables" element={modulePage('Printable Reports', 'Generate browser-print friendly reports and summaries.')} />
            <Route path="profile" element={modulePage('Profile', 'Review and update the current user profile.')} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
