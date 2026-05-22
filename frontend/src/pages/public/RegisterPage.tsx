import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import ThemeToggle from '../../components/ThemeToggle';
import Button from '../../components/ui/Button';
import { Field, Input } from '../../components/ui/Input';

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      const response = await client.post('/auth/register', form);
      setMessage(response.data.message ?? 'Account created. Check your Gmail and click "Verify my account" to sign in automatically.');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Unable to create the account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-100 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative hidden overflow-hidden border-r border-blue-100 bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute left-[-5rem] top-24 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-16 right-[-4rem] h-72 w-72 rounded-full bg-sky-100/20 blur-3xl" />
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold text-white backdrop-blur-sm">TW</div>
            <div>
              <p className="text-sm font-medium text-blue-50/90">TrackWise</p>
              <h2 className="text-2xl font-bold text-white">Start your OJT tracker</h2>
            </div>
          </div>

          <div className="relative z-10 max-w-xl text-white">
            <span className="mb-5 inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-50/90 backdrop-blur-sm">
              Create your account
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Track your student OJT without organization setup.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-blue-50/90">
              Create a student account, set your required hours, then manage your DTR, narrative reports, and documentation in one workspace.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {['No organization needed', 'Printable DTR', 'Report maker'].map((item) => (
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
                  <p className="font-semibold text-slate-900">Student OJT tracker</p>
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
                  Create account
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Register</h1>
                <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
                  Create your student account, then verify it from Gmail before accessing your OJT tracker.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="First name" required>
                    <Input
                      type="text"
                      value={form.first_name}
                      onChange={(e) => setForm((current) => ({ ...current, first_name: e.target.value }))}
                      placeholder="John"
                      required
                    />
                  </Field>
                  <Field label="Last name" required>
                    <Input
                      type="text"
                      value={form.last_name}
                      onChange={(e) => setForm((current) => ({ ...current, last_name: e.target.value }))}
                      placeholder="Doe"
                      required
                    />
                  </Field>
                </div>

                <Field label="Email address" required>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                    placeholder="you@example.com"
                    required
                  />
                </Field>

                <Field label="Password" helperText="At least 8 characters" required>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                  />
                </Field>

                <Field label="Confirm password" required>
                  <Input
                    type="password"
                    value={form.password_confirmation}
                    onChange={(e) => setForm((current) => ({ ...current, password_confirmation: e.target.value }))}
                    placeholder="••••••••"
                    required
                  />
                </Field>

                {message && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <p className="text-sm font-medium text-emerald-700">{message}</p>
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                    <p className="text-sm font-medium text-rose-700">{error}</p>
                  </div>
                )}

                <Button type="submit" size="lg" variant="primary" fullWidth isLoading={submitting}>
                  {submitting ? 'Creating account...' : 'Create account'}
                </Button>
              </form>

              <div className="mt-8 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-blue-700 transition-colors hover:text-blue-800">
                  Sign in
                </Link>
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
