import { Link } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';

const features = [
  ['Personal DTR', 'Log time in, time out, breaks, activities, and signatures for your own OJT hours.'],
  ['Hour progress', 'Set the required hours once and see completed and remaining hours every day.'],
  ['Narrative maker', 'Turn DTR activities into narrative reports for weekly or final requirements.'],
  ['Documentation log', 'Track photos, certificates, memos, and other OJT evidence in one place.'],
  ['Printable output', 'Print a clean DTR table with signature lines for submission.'],
  ['No organization setup', 'Start as one student without creating departments, teams, or organization accounts.'],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">TW</div>
            <div>
              <span className="block font-bold text-slate-900">TrackWise</span>
              <span className="block text-xs text-slate-500">Student OJT tracker</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login" className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:inline-flex">
              Sign in
            </Link>
            <Link to="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Start tracking
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Solo student OJT tracker</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Track your OJT hours, DTR, reports, and documentation without organization setup.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              TrackWise is set up for a student who simply needs to know how many hours are required, how many hours are done, and what documents are ready for submission.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                Create student account
              </Link>
              <Link to="/login" className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                Sign in
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">OJT Progress</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Metric label="Required" value="486" />
                <Metric label="Done" value="128" />
                <Metric label="Left" value="358" />
              </div>
              <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[26%] rounded-full bg-blue-600" />
              </div>
              <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
                {['Time In / Time Out', 'Printable DTR', 'Narrative Report', 'Documentation Log'].map((item) => (
                  <div key={item} className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 last:border-b-0">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-slate-950">Built for student OJT requirements</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map(([title, description]) => (
                <article key={title} className="rounded-lg border border-slate-200 bg-white p-5">
                  <h3 className="font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
        Copyright 2026 TrackWise. All rights reserved.
      </footer>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
