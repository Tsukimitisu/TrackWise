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

const commonItems: NavItem[] = [
  { label: 'Dashboard', to: '/app', icon: 'dashboard' },
  { label: 'Notifications', to: '/app/notifications', icon: 'bell' },
];

const roleNav: Record<RoleName, NavItem[]> = {
  'Super Admin': [
    ...commonItems,
    { label: 'Analytics', to: '/app/analytics', icon: 'chart' },
    { label: 'Admin Statistics', to: '/app/admin-statistics', icon: 'spark' },
    { label: 'Organizations', to: '/app/organizations', icon: 'building' },
    { label: 'Users', to: '/app/users', icon: 'users' },
    { label: 'Programs', to: '/app/programs', icon: 'layers' },
    { label: 'Progress Tracking', to: '/app/progress', icon: 'checklist' },
    { label: 'Reports', to: '/app/reports', icon: 'clipboard' },
    { label: 'System Settings', to: '/app/settings', icon: 'settings' },
  ],
  'Organization Admin': [
    ...commonItems,
    { label: 'Analytics', to: '/app/analytics', icon: 'chart' },
    { label: 'Admin Statistics', to: '/app/admin-statistics', icon: 'spark' },
    { label: 'Manage Users', to: '/app/users', icon: 'users' },
    { label: 'Manage Programs', to: '/app/programs', icon: 'layers' },
    { label: 'Assignments', to: '/app/assignments', icon: 'clipboard' },
    { label: 'Attendance Records', to: '/app/attendance', icon: 'calendar' },
    { label: 'Progress Tracking', to: '/app/progress', icon: 'checklist' },
    { label: 'Reports', to: '/app/reports', icon: 'clipboard' },
    { label: 'Documents', to: '/app/documents', icon: 'file' },
    { label: 'Settings', to: '/app/settings', icon: 'settings' },
  ],
  Coordinator: [
    ...commonItems,
    { label: 'Analytics', to: '/app/analytics', icon: 'chart' },
    { label: 'Admin Statistics', to: '/app/admin-statistics', icon: 'spark' },
    { label: 'Assigned Trainees', to: '/app/assigned-trainees', icon: 'users' },
    { label: 'DTR Monitoring', to: '/app/attendance', icon: 'calendar' },
    { label: 'Daily Reports', to: '/app/reports/daily', icon: 'file' },
    { label: 'Weekly Reports', to: '/app/reports/weekly', icon: 'clipboard' },
    { label: 'Progress Tracking', to: '/app/progress', icon: 'checklist' },
    { label: 'Printable Reports', to: '/app/printables', icon: 'badge' },
  ],
  Supervisor: [
    ...commonItems,
    { label: 'Assigned Trainees', to: '/app/assigned-trainees', icon: 'users' },
    { label: 'Pending DTR Approval', to: '/app/attendance', icon: 'calendar' },
    { label: 'Pending Daily Reports', to: '/app/reports/daily', icon: 'file' },
    { label: 'Pending Weekly Reports', to: '/app/reports/weekly', icon: 'clipboard' },
    { label: 'Evaluations', to: '/app/evaluations', icon: 'checklist' },
    { label: 'Documentation Review', to: '/app/documents', icon: 'file' },
  ],
  Student: [
    ...commonItems,
    { label: 'Time In / Time Out', to: '/app/time-in-out', icon: 'clock' },
    { label: 'My Attendance', to: '/app/attendance', icon: 'calendar' },
    { label: 'My DTR', to: '/app/printables', icon: 'badge' },
    { label: 'Daily Reports', to: '/app/reports/daily', icon: 'file' },
    { label: 'Weekly Reports', to: '/app/reports/weekly', icon: 'clipboard' },
    { label: 'Documentation', to: '/app/documents', icon: 'file' },
    { label: 'My Progress', to: '/app/progress', icon: 'checklist' },
    { label: 'Profile', to: '/app/profile', icon: 'user' },
  ],
  Viewer: [...commonItems, { label: 'Read Only Reports', to: '/app/reports', icon: 'clipboard' }],
};

export function getNavigation(role?: RoleName) {
  return role ? roleNav[role] : commonItems;
}
