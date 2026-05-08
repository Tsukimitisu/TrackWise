import { Link } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import Surface from '../../components/ui/Surface';

const featureCards = [
  { title: 'Attendance', description: 'Capture daily presence and hours with less friction.' },
  { title: 'Reports', description: 'Daily, weekly, and narrative reporting in one flow.' },
  { title: 'Approvals', description: 'Clear review queues and role-aware decisions.' },
  { title: 'Documentation', description: 'Upload files and maintain a polished audit trail.' },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <ThemeToggle />
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/60 shadow-[0_24px_100px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-950/70 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-ink-900 to-indigo-900 px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.35),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.16),transparent_24%)]" />
          <div className="relative max-w-3xl">
            <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
              TrackWise
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              A modern tracking and management platform for real teams.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
              Built for OJT students, interns, employees, freelancers, trainees, and organizations that need a clean workflow for attendance, reports, approvals, and progress.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100">
                Sign in
              </Link>
              <Link to="/register" className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15">
                Create account
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-md">
                <div className="text-2xl font-black">SaaS-ready</div>
                <div className="mt-1 text-xs uppercase tracking-[0.24em] text-white/60">Professional UI</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-md">
                <div className="text-2xl font-black">Responsive</div>
                <div className="mt-1 text-xs uppercase tracking-[0.24em] text-white/60">Desktop to mobile</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-md">
                <div className="text-2xl font-black">Role-aware</div>
                <div className="mt-1 text-xs uppercase tracking-[0.24em] text-white/60">Built for access layers</div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center px-4 py-10 sm:px-8 lg:px-10">
          <div className="grid w-full gap-5">
            {featureCards.map((card) => (
              <Surface key={card.title} className="p-6 transition duration-300 hover:-translate-y-1">
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{card.title}</div>
                <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-300">{card.description}</p>
              </Surface>
            ))}

            <Surface className="p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Platform focus</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {['Dashboard clarity', 'Clean forms', 'Polished tables', 'Smooth mobile navigation'].map((item) => (
                  <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </Surface>
          </div>
        </section>
      </div>
    </div>
  );
}
