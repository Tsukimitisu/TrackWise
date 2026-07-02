import type { RoleName } from '../types';

export type NavIconName =
  | 'dashboard'
  | 'bell'
  | 'chart'
  | 'spark'
  | 'building'
  | 'users'
  | 'layers'
  | 'clipboard'
  | 'calendar'
  | 'file'
  | 'checklist'
  | 'clock'
  | 'badge'
  | 'settings'
  | 'user';

export interface NavItem {
  label: string;
  to: string;
  icon: NavIconName;
}

const dashboard: NavItem = { label: 'Dashboard', to: '/app', icon: 'dashboard' };

const roleNav: Record<RoleName, NavItem[]> = {
  'Super Admin': [
    dashboard,
    { label: 'Users', to: '/app/users', icon: 'users' },
    { label: 'Companies', to: '/app/organizations', icon: 'building' },
    { label: 'OJT Requirements', to: '/app/programs', icon: 'layers' },
    { label: 'System Records', to: '/app/admin-statistics', icon: 'chart' },
    { label: 'Settings', to: '/app/settings', icon: 'settings' },
  ],
  'Organization Admin': [
    dashboard,
    { label: 'Users', to: '/app/users', icon: 'users' },
    { label: 'Companies', to: '/app/organizations', icon: 'building' },
    { label: 'OJT Requirements', to: '/app/programs', icon: 'layers' },
    { label: 'System Records', to: '/app/admin-statistics', icon: 'chart' },
    { label: 'Settings', to: '/app/settings', icon: 'settings' },
  ],
  Coordinator: [
    dashboard,
    { label: 'Students', to: '/app/assigned-trainees', icon: 'users' },
    { label: 'Companies', to: '/app/organizations', icon: 'building' },
    { label: 'Progress Monitoring', to: '/app/progress', icon: 'checklist' },
    { label: 'Reports', to: '/app/printables', icon: 'clipboard' },
  ],
  Supervisor: [
    dashboard,
    { label: 'Assigned Students', to: '/app/assigned-trainees', icon: 'users' },
    { label: 'Submitted Reports', to: '/app/reports/daily', icon: 'file' },
    { label: 'Attendance Records', to: '/app/attendance', icon: 'calendar' },
    { label: 'Feedback', to: '/app/evaluations', icon: 'checklist' },
  ],
  Student: [
    dashboard,
    { label: 'My OJT Profile', to: '/app/ojt-setup', icon: 'user' },
    { label: 'Attendance', to: '/app/attendance', icon: 'clock' },
    { label: 'Daily Logs', to: '/app/reports/daily', icon: 'file' },
    { label: 'Documentation', to: '/app/documents', icon: 'file' },
    { label: 'Narrative Reports', to: '/app/reports/weekly', icon: 'clipboard' },
    { label: 'Progress', to: '/app/progress', icon: 'checklist' },
  ],
  Viewer: [dashboard, { label: 'Reports', to: '/app/reports', icon: 'clipboard' }],
};

export function getNavigation(role?: RoleName) {
  return role ? roleNav[role] : [dashboard];
}
