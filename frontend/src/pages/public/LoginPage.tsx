import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import Surface from '../../components/ui/Surface';
import { FieldShell, TextField } from '../../components/ui/TextField';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [email, setEmail] = useState('superadmin@trackwise.test');
  const [password, setPassword] = useState('Password123!');
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
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-md justify-end">
        <ThemeToggle />
      </div>
      <div className="mx-auto mt-10 max-w-md">
        <div className="mb-6">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">TrackWise</div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Use a verified email account to access your workspace.</p>
        </div>

        <Surface className="p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldShell label="Email">
              <TextField type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            </FieldShell>
            <FieldShell label="Password">
              <TextField type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
            </FieldShell>
            {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">{error}</p> : null}
            <button type="submit" disabled={submitting} className="w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
            <Link to="/forgot-password" className="hover:text-slate-950 dark:hover:text-white">Forgot password?</Link>
            <Link to="/register" className="font-medium hover:text-slate-950 dark:hover:text-white">Create account</Link>
          </div>
        </Surface>

        <Surface className="mt-4 p-4 text-sm text-slate-600 dark:text-slate-300" elevated={false}>
          Demo password for seeded accounts: <span className="font-semibold text-slate-900 dark:text-white">Password123!</span>
        </Surface>
      </div>
    </div>
  );
}
