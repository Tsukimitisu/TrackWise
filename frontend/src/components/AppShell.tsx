import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getNavigation } from '../data/navigation';

export default function AppShell() {
  const { user, clearSession } = useAuth();
  const navigation = getNavigation(user?.role.name);

  return (
    <div className="min-h-screen bg-transparent text-ink-900">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-white/60 bg-white/70 px-5 py-6 backdrop-blur-xl">
          <Link to="/app" className="mb-8 block">
            <div className="text-2xl font-black tracking-tight text-ink-900">TrackWise</div>
            <div className="text-sm text-slate-500">Work-hour tracking system</div>
          </Link>

          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'block rounded-2xl px-4 py-3 text-sm font-medium transition',
                    isActive ? 'bg-ink-900 text-white shadow-soft' : 'text-slate-600 hover:bg-ink-50 hover:text-ink-900',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <header className="mb-6 rounded-3xl border border-white/70 bg-white/80 px-5 py-4 shadow-soft backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm text-slate-500">Signed in as</div>
                <div className="text-lg font-semibold text-ink-900">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-sm text-slate-500">{user?.role.name}</div>
              </div>
              <button
                type="button"
                onClick={clearSession}
                className="rounded-2xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink-700"
              >
                Logout
              </button>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
