import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import Surface from '../../components/ui/Surface';
import { FieldShell, TextField } from '../../components/ui/TextField';

const proofPoints = [
  'Role-aware dashboards for students, coordinators, and admins',
  'Attendance, reports, evaluations, and documents in one place',
  'Responsive layouts with a clean SaaS-style interface',
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [email, setEmail] = useState('admin@trackwise.test');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await client.post('/auth/login', { email, password });
      setSession(response.data.user, response.data.token);
      navigate('/app', { replace: true });
    } catch {
      setError('Invalid login credentials.');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <ThemeToggle />
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/65 shadow-[0_24px_100px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-950/70 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative flex items-center overflow-hidden bg-gradient-to-br from-slate-950 via-ink-900 to-indigo-900 px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.35),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_26%)]" />
          <div className="relative max-w-2xl">
            <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
              TrackWise platform
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Track work, reports, attendance, and approvals without the clutter.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/72 sm:text-lg">
              TrackWise gives every role a clear workspace for OJT students, interns, employees, freelancers, trainees, and organizations.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {proofPoints.map((point) => (
                <div key={point} className="rounded-3xl border border-white/10 bg-white/8 p-4 text-sm leading-6 text-white/82 backdrop-blur-md">
                  {point}
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-md">
                <div className="text-2xl font-black">24/7</div>
                <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/60">Availability</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-md">
                <div className="text-2xl font-black">5 roles</div>
                <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/60">Access layers</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-md">
                <div className="text-2xl font-black">1 workflow</div>
                <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/60">Unified tracking</div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-10">
          <Surface className="w-full max-w-md p-8 sm:p-10">
            <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200">
              Sign in
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Continue to the TrackWise workspace.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <FieldShell label="Email">
                <TextField type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </FieldShell>

              <FieldShell label="Password">
                <TextField type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </FieldShell>

              {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">{error}</p> : null}

              <button type="submit" className="w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                Login
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <Link to="/forgot-password" className="font-semibold text-ink-700 hover:text-ink-600 dark:text-indigo-300">Forgot password?</Link>
              <Link to="/register" className="font-semibold text-ink-700 hover:text-ink-600 dark:text-indigo-300">Create account</Link>
            </div>
          </Surface>
        </section>
      </div>
    </div>
  );
}
