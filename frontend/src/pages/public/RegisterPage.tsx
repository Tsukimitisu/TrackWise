import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import ThemeToggle from '../../components/ThemeToggle';
import Surface from '../../components/ui/Surface';
import { FieldShell, TextField } from '../../components/ui/TextField';

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
      setMessage(response.data.message ?? 'Account created. Check your email to verify your account before signing in.');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Unable to create the account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-xl justify-end">
        <ThemeToggle />
      </div>
      <div className="mx-auto mt-10 max-w-xl">
        <div className="mb-6">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Student registration</div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Create account</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">New public accounts are created as Student accounts and require email verification.</p>
        </div>

        <Surface className="p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldShell label="First name">
                <TextField type="text" value={form.first_name} onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))} required />
              </FieldShell>
              <FieldShell label="Last name">
                <TextField type="text" value={form.last_name} onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))} required />
              </FieldShell>
            </div>
            <FieldShell label="Email">
              <TextField type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
            </FieldShell>
            <FieldShell label="Password" helperText="At least 8 characters">
              <TextField type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
            </FieldShell>
            <FieldShell label="Confirm password">
              <TextField type="password" value={form.password_confirmation} onChange={(event) => setForm((current) => ({ ...current, password_confirmation: event.target.value }))} required />
            </FieldShell>
            {message ? <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200">{message}</p> : null}
            {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">{error}</p> : null}
            <button type="submit" disabled={submitting} className="w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Already verified? <Link to="/login" className="font-medium text-slate-950 hover:underline dark:text-white">Sign in</Link>
          </p>
        </Surface>
      </div>
    </div>
  );
}
