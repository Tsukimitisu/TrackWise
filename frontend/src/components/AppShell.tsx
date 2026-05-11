import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getNavigation, type NavIconName } from '../data/navigation';
import ThemeToggle from './ThemeToggle';
import Button from './ui/Button';

const iconPaths: Record<NavIconName, string[]> = {
  dashboard: ['M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6.5h-5V21H5a1 1 0 0 1-1-1z'],
  bell: ['M6 8a6 6 0 1 1 12 0c0 4 1.5 5 2.5 6.5H3.5C4.5 13 6 12 6 8', 'M10 19a2 2 0 0 0 4 0'],
  chart: ['M5 19V5', 'M5 19h14', 'M9 15l2-4 3 2 4-7'],
  spark: ['M12 3 13.8 8.2 19 10 13.8 11.8 12 17 10.2 11.8 5 10 10.2 8.2z'],
  building: ['M4 21V5a1 1 0 0 1 1-1h6v17', 'M11 21V4h8a1 1 0 0 1 1 1v16', 'M8 8h2M8 12h2M15 8h2M15 12h2'],
  users: ['M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm8 1a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5', 'M3.5 20a4.5 4.5 0 0 1 9 0', 'M12 20a4 4 0 0 1 8 0'],
  layers: ['M12 4 21 9l-9 5-9-5 9-5z', 'M3 12l9 5 9-5', 'M3 16l9 5 9-5'],
  clipboard: ['M9 4h6a1 1 0 0 1 1 1v1h1.5A1.5 1.5 0 0 1 19 7.5v11A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-11A1.5 1.5 0 0 1 6.5 6H8V5a1 1 0 0 1 1-1z', 'M9 6h6'],
  calendar: ['M7 3v3M17 3v3M4.5 8h15', 'M6 6.5h12A1.5 1.5 0 0 1 19.5 8v11A1.5 1.5 0 0 1 18 20H6a1.5 1.5 0 0 1-1.5-1.5V8A1.5 1.5 0 0 1 6 6.5z', 'M8 11h2M12 11h2M16 11h2M8 15h2M12 15h2'],
  file: ['M7 3h6l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z', 'M13 3v5h5'],
  checklist: ['M7 7h10M7 12h10M7 17h10', 'M4.5 7 6 8.5 8.5 6', 'M4.5 12 6 13.5 8.5 11', 'M4.5 17 6 18.5 8.5 16'],
  clock: ['M12 7v5l3 2', 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0'],
  badge: ['M12 3 14.5 6.5 19 7.5 16 11 16.5 16 12 13.8 7.5 16 8 11 5 7.5 9.5 6.5z'],
  settings: ['M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm8 4-2.2.7a6.9 6.9 0 0 1-.4 1l1.2 2-2 2-2-1.2a6.9 6.9 0 0 1-1 .4L12 20l-1.6-2.1a6.9 6.9 0 0 1-1-.4l-2 1.2-2-2 1.2-2a6.9 6.9 0 0 1-.4-1L4 12l2.2-.7a6.9 6.9 0 0 1 .4-1l-1.2-2 2-2 2 1.2a6.9 6.9 0 0 1 1-.4L12 4l1.6 2.1a6.9 6.9 0 0 1 1 .4l2-1.2 2 2-1.2 2a6.9 6.9 0 0 1 .4 1z'],
  user: ['M12 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4z', 'M5 20a7 7 0 0 1 14 0'],
};

function NavIcon({ name }: { name: NavIconName }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}

export default function AppShell() {
  const { user, clearSession } = useAuth();
  const navigation = getNavigation(user?.role.name);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const initials = useMemo(() => {
    const first = user?.first_name?.[0] ?? 'T';
    const last = user?.last_name?.[0] ?? 'W';
    return `${first}${last}`.toUpperCase();
  }, [user?.first_name, user?.last_name]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button 
          type="button" 
          aria-label="Close navigation" 
          onClick={() => setMobileOpen(false)} 
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden animate-fade-in" 
        />
      )}

      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 lg:gap-0">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-700 dark:bg-slate-900 lg:sticky lg:translate-x-0 ${
            collapsed ? 'lg:w-20' : 'lg:w-64'
          } ${mobileOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full lg:translate-x-0'}`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-5 dark:border-slate-700">
            <Link to="/app" className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-sm font-bold text-white shrink-0">TW</div>
              {!collapsed && <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100">TrackWise</span>}
            </Link>
            {/* Close button for mobile */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-5 flex-1 overflow-y-auto space-y-1 px-3 py-2">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  } ${collapsed ? 'lg:justify-center lg:px-3' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <NavIcon name={item.icon} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Sidebar Footer - User Profile */}
          <div className="border-t border-slate-200 px-3 py-4 dark:border-slate-700">
            <div className={`flex items-center gap-3 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${collapsed ? 'lg:justify-center' : ''}`}>
              <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-white shrink-0">{initials}</div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.role.name}</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {/* Top Navigation */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user?.organization?.name ?? 'TrackWise'}</h1>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                type="button"
                onClick={clearSession}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Page Content */}
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
