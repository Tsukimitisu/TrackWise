import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getNavigation, type NavIconName } from '../data/navigation';

const iconPaths: Record<NavIconName, string[]> = {
  dashboard: ['M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-13h6V4h-6v3Z'],
  bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9', 'M10 21h4'],
  chart: ['M4 20V10', 'M10 20V4', 'M16 20v-7', 'M22 20H2'],
  spark: ['m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z'],
  building: ['M4 21V5h10v16', 'M14 9h6v12', 'M8 9h2M8 13h2M8 17h2M17 13h1M17 17h1'],
  users: ['M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M2 21a7 7 0 0 1 14 0', 'M16 4a3 3 0 0 1 0 6', 'M17 14a6 6 0 0 1 5 6'],
  layers: ['m12 3 9 5-9 5-9-5 9-5Z', 'm3 12 9 5 9-5', 'm3 16 9 5 9-5'],
  clipboard: ['M9 5h6', 'M9 3h6v4H9V3Z', 'M7 5H5v16h14V5h-2', 'M8 12h8M8 16h6'],
  calendar: ['M7 3v4M17 3v4M4 9h16', 'M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z'],
  file: ['M6 3h8l4 4v14H6V3Z', 'M14 3v5h5', 'M9 13h6M9 17h6'],
  checklist: ['m4 7 2 2 3-4', 'M11 7h9', 'm4 14 2 2 3-4', 'M11 14h9', 'M11 20h9'],
  clock: ['M12 7v5l3 2', 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
  badge: ['M12 3 15 6l4 .5-1 4 2 3.5-3.5 2 .5 4-4-.5L12 22l-2.5-3.5-4 .5.5-4-3.5-2 2-3.5-1-4L9 6l3-3Z'],
  settings: ['M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z', 'M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z'],
  user: ['M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z', 'M4 21a8 8 0 0 1 16 0'],
};

function Icon({ name, className = 'h-5 w-5' }: { name: NavIconName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name].map((path) => <path key={path} d={path} />)}
    </svg>
  );
}

function CloseIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function MenuIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function ChevronRightIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

const roleLabel: Record<string, string> = {
  Student: 'Student workspace',
  Supervisor: 'Supervisor workspace',
  Coordinator: 'School coordinator',
  'Super Admin': 'System administration',
  'Organization Admin': 'System administration',
  Viewer: 'Read-only workspace',
};

export default function AppShell() {
  const { user, clearSession } = useAuth();
  const navigation = getNavigation(user?.role.name);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const initials = useMemo(
    () => `${user?.first_name?.[0] ?? 'T'}${user?.last_name?.[0] ?? 'W'}`.toUpperCase(),
    [user?.first_name, user?.last_name],
  );

  const currentPage = [...navigation]
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => item.to === '/app' ? location.pathname === '/app' : location.pathname.startsWith(item.to));

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-slate-800 bg-[#10233f] text-white transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link to="/app" className="flex items-center gap-3 text-white hover:text-white">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-400 text-[#10233f] shadow-lg shadow-teal-950/20">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12.5 9.2 17 19 7" />
                <path d="M4 4h16v16H4z" />
              </svg>
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight">TrackWise</span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">OJT Management</span>
            </span>
          </Link>
          <button type="button" onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-white/10 lg:hidden" aria-label="Close navigation">
            <CloseIcon />
          </button>
        </div>

        <div className="px-4 pt-6">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
        </div>
        <nav className="mt-3 flex-1 space-y-1 overflow-y-auto px-4">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-teal-400 text-[#10233f] shadow-sm'
                  : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'
              }`}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <Link to="/app/profile" className="flex items-center gap-3 rounded-xl p-3 text-white hover:bg-white/[0.07] hover:text-white">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-bold text-teal-300">{initials}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{user?.first_name} {user?.last_name}</span>
              <span className="block truncate text-xs text-slate-400">{user?.role.name}</span>
            </span>
            <ChevronRightIcon className="h-4 w-4 text-slate-500" />
          </Link>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[272px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setMobileOpen(true)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden" aria-label="Open navigation">
                <MenuIcon />
              </button>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-slate-950">{currentPage?.label ?? 'TrackWise'}</p>
                <p className="hidden text-xs text-slate-500 sm:block">{roleLabel[user?.role.name ?? ''] ?? 'OJT workspace'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/app/notifications" aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                <Icon name="bell" className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-amber-500" />
              </Link>
              <button type="button" onClick={clearSession} className="hidden rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:block">
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
