import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getNavigation, type NavIconName } from '../data/navigation';
import ThemeToggle from './ThemeToggle';

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
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      {mobileOpen ? <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden" /> : null}

      <div className="mx-auto flex min-h-screen max-w-[1720px]">
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-slate-200 bg-white p-4 transition-all dark:border-slate-800 dark:bg-slate-950 lg:sticky lg:translate-x-0 ${collapsed ? 'lg:w-24' : 'lg:w-80'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800/80">
            <Link to="/app" className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white dark:bg-slate-100 dark:text-slate-900">TW</div>
              <div className={collapsed ? 'lg:hidden' : 'lg:block'}>
                <div className="text-lg font-black tracking-tight">TrackWise</div>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setCollapsed((s) => !s)} className="hidden rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 lg:inline-flex" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <button type="button" onClick={() => setMobileOpen(false)} className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden" aria-label="Close sidebar">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6 18 18M18 6 6 18" /></svg>
              </button>
            </div>
          </div>

          <nav className="mt-5 flex-1 space-y-1 overflow-y-auto pr-1">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition ${isActive ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'} ${collapsed ? 'lg:justify-center lg:px-3' : ''}`}
              >
                <NavIcon name={item.icon} />
                <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className={`flex items-center gap-3 ${collapsed ? 'lg:justify-center' : ''}`}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white dark:bg-slate-100 dark:text-slate-900">{initials}</div>
              <div className={collapsed ? 'lg:hidden' : 'min-w-0 flex-1'}>
                <div className="truncate text-sm font-semibold">{user?.first_name} {user?.last_name}</div>
                <div className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.role.name}</div>
              </div>
            </div>
            <div className={`mt-4 ${collapsed ? 'lg:hidden' : ''}`}>
              <button type="button" onClick={clearSession} className="w-full rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">Logout</button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-6 pt-4 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
            <button type="button" onClick={() => setMobileOpen(true)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
              Menu
            </button>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">TW</div>
          </div>

          <header className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold tracking-tight">{user?.organization?.name ?? 'TrackWise Workspace'}</h2>
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{user?.role.name}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <ThemeToggle />
                <button type="button" onClick={clearSession} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                  Logout
                </button>
              </div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
