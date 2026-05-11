import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import Button from '../../components/ui/Button';
import { Field, Input } from '../../components/ui/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [email, setEmail] = useState('superadmin@trackwise.test');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await client.post('/auth/login', { email, password });
      setSession(response.data.user, response.data.token);
      navigate('/app', { replace: true });
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-100 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden overflow-hidden border-r border-blue-100 bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute left-[-6rem] top-24 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-16 right-[-4rem] h-72 w-72 rounded-full bg-sky-100/20 blur-3xl" />
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold text-white backdrop-blur-sm">TW</div>
            <div>
              <p className="text-sm font-medium text-blue-50/90">TrackWise</p>
              <h2 className="text-2xl font-bold text-white">Track work with clarity</h2>
            </div>
          </div>

          <div className="relative z-10 max-w-xl text-white">
            <span className="mb-5 inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-50/90 backdrop-blur-sm">
              Secure workspace access
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Sign in to a cleaner, calmer tracking dashboard.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-blue-50/90">
              Manage attendance, reports, approvals, and progress from a single system built for organizations of every size.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                'Role-based access',
                'Attendance approvals',
                'Printable reports',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-sm font-medium text-white backdrop-blur-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-sm text-blue-50/80">© 2026 TrackWise. All rights reserved.</p>
        </aside>

        <main className="relative flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="absolute right-4 top-4 sm:right-6 sm:top-6 lg:hidden">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-xl">
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-sm font-bold text-white shadow-sm">TW</div>
                <div>
                  <p className="text-sm font-medium text-slate-500">TrackWise</p>
                  <p className="font-semibold text-slate-900">Work tracking system</p>
                </div>
              </Link>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_20px_60px_rgba(59,130,246,0.12)] backdrop-blur-sm sm:p-10">
              <div className="mb-8">
                <div className="mb-4 hidden lg:block">
                  <Link to="/" className="inline-flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-sm font-bold text-white shadow-sm">TW</div>
                    <span className="text-lg font-bold tracking-tight text-slate-900">TrackWise</span>
                  </Link>
                </div>

                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                  Welcome back
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Sign in</h1>
                <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
                  Enter your credentials to access your dashboard, reports, and approval workflows.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Field label="Email address" required>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </Field>

                <Field label="Password" required>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-blue-700"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </Field>

                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                    <p className="text-sm font-medium text-rose-700">{error}</p>
                  </div>
                )}

                <Button type="submit" size="lg" variant="primary" fullWidth isLoading={submitting}>
                  {submitting ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="mt-8 flex flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <Link to="/forgot-password" className="font-medium text-slate-600 transition-colors hover:text-blue-700">
                  Forgot password?
                </Link>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>Don't have an account?</span>
                  <Link to="/register" className="font-semibold text-blue-700 transition-colors hover:text-blue-800">
                    Create account
                  </Link>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Demo account</p>
                <p className="mt-2 text-sm text-slate-600">Use the seeded credentials above. Password for all demo users: <span className="font-semibold text-slate-900">Password123!</span></p>
              </div>
            </div>
          </div>

          <div className="absolute right-6 top-6 hidden lg:block">
            <ThemeToggle />
          </div>
        </main>
      </div>
    </div>
  );
}
