import { FormEvent, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import ThemeToggle from '../../components/ThemeToggle';
import Surface from '../../components/ui/Surface';
import { FieldShell, TextField } from '../../components/ui/TextField';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const defaultEmail = useMemo(() => searchParams.get('email') ?? '', [searchParams]);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setSubmitting(true);

    try {
      const response = await client.post('/auth/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setMessage(response.data.message ?? 'Password reset successfully.');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Unable to reset password.');
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
          <h1 className="text-3xl font-bold tracking-tight">Choose a new password</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Reset links are single-use and expire for account safety.</p>
        </div>
        <Surface className="p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldShell label="Email">
              <TextField type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </FieldShell>
            <FieldShell label="New password">
              <TextField type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </FieldShell>
            <FieldShell label="Confirm password">
              <TextField type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} required />
            </FieldShell>
            {!token ? <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200">This reset link is missing a token. Request a new password reset email.</p> : null}
            {message ? <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200">{message}</p> : null}
            {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">{error}</p> : null}
            <button type="submit" disabled={submitting || !token} className="w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
              {submitting ? 'Saving...' : 'Reset password'}
            </button>
          </form>
          <Link to="/login" className="mt-4 inline-flex text-sm font-medium text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            Back to sign in
          </Link>
        </Surface>
      </div>
    </div>
  );
}
