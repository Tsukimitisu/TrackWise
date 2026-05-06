import type { RoleName } from '../types';

export interface NavItem {
  label: string;
  to: string;
}

const commonItems: NavItem[] = [{ label: 'Dashboard', to: '/app' }];

const roleNav: Record<RoleName, NavItem[]> = {
  'Super Admin': [
    ...commonItems,
    { label: 'Organizations', to: '/app/organizations' },
    { label: 'Users', to: '/app/users' },
    { label: 'Programs', to: '/app/programs' },
    { label: 'Reports', to: '/app/reports' },
    { label: 'System Settings', to: '/app/settings' },
  ],
  'Organization Admin': [
    ...commonItems,
    { label: 'Manage Users', to: '/app/users' },
    { label: 'Manage Programs', to: '/app/programs' },
    { label: 'Assignments', to: '/app/assignments' },
    { label: 'Attendance Records', to: '/app/attendance' },
    { label: 'Reports', to: '/app/reports' },
    { label: 'Documents', to: '/app/documents' },
    { label: 'Settings', to: '/app/settings' },
  ],
  Coordinator: [
    ...commonItems,
    { label: 'Assigned Trainees', to: '/app/assigned-trainees' },
    { label: 'DTR Monitoring', to: '/app/attendance' },
    { label: 'Daily Reports', to: '/app/reports/daily' },
    { label: 'Weekly Reports', to: '/app/reports/weekly' },
    { label: 'Progress Tracking', to: '/app/progress' },
    { label: 'Printable Reports', to: '/app/printables' },
  ],
  Supervisor: [
    ...commonItems,
    { label: 'Assigned Trainees', to: '/app/assigned-trainees' },
    { label: 'Pending DTR Approval', to: '/app/attendance' },
    { label: 'Pending Daily Reports', to: '/app/reports/daily' },
    { label: 'Pending Weekly Reports', to: '/app/reports/weekly' },
    { label: 'Evaluations', to: '/app/evaluations' },
    { label: 'Documentation Review', to: '/app/documents' },
  ],
  Student: [
    ...commonItems,
    { label: 'Time In / Time Out', to: '/app/time-in-out' },
    { label: 'My Attendance', to: '/app/attendance' },
    { label: 'My DTR', to: '/app/printables' },
    { label: 'Daily Reports', to: '/app/reports/daily' },
    { label: 'Weekly Reports', to: '/app/reports/weekly' },
    { label: 'Documentation', to: '/app/documents' },
    { label: 'My Progress', to: '/app/progress' },
    { label: 'Profile', to: '/app/profile' },
  ],
  Viewer: [...commonItems, { label: 'Read Only Reports', to: '/app/reports' }],
};

export function getNavigation(role?: RoleName) {
  return role ? roleNav[role] : commonItems;
}
