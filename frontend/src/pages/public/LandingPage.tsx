import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen px-6 py-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <section className="space-y-6">
            <span className="inline-flex rounded-full border border-ink-200 bg-white/80 px-4 py-2 text-sm font-medium text-ink-700 shadow-soft">
              Flexible OJT, internship, and work-hours tracking
            </span>
            <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight text-ink-900 sm:text-6xl">
              Track work, reports, attendance, and approvals in one system.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              TrackWise supports organizations, roles, DTR logs, daily reports, weekly narrative reports, documentation uploads, approvals, and printable summaries.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="rounded-2xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-ink-700"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-2xl border border-ink-200 bg-white/80 px-5 py-3 text-sm font-semibold text-ink-800 transition hover:bg-white"
              >
                Create account
              </Link>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-2">
              {['Attendance', 'Reports', 'Approvals', 'Documents'].map((item) => (
                <div key={item} className="rounded-2xl bg-ink-50 p-4">
                  <div className="text-sm font-semibold text-ink-600">{item}</div>
                  <div className="mt-2 text-sm text-slate-600">Role-aware workflows and clean printable outputs.</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
