import { FormEvent, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import ThemeToggle from '../../components/ThemeToggle';
import Surface from '../../components/ui/Surface';
import { FieldShell, TextField } from '../../components/ui/TextField';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') ?? 'pending';
  const initialEmail = useMemo(() => searchParams.get('email') ?? '', [searchParams]);
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const copy = {
    verified: {
      title: 'Email verified',
      body: 'Your account is ready. You can sign in now.',
    },
    expired: {
      title: 'Verification link expired',
      body: 'Request a new verification email and use the latest link.',
    },
    invalid: {
      title: 'Verification link is invalid',
      body: 'The link could not be verified. Request a new email if the account is still unverified.',
    },
    pending: {
      title: 'Verify your email',
      body: 'Check your inbox for the verification link sent after registration.',
    },
  }[status as 'verified' | 'expired' | 'invalid' | 'pending'] ?? {
    title: 'Verify your email',
    body: 'Check your inbox for the verification link sent after registration.',
  };

  const resend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setSubmitting(true);

    try {
      const response = await client.post('/auth/resend-verification', { email });
      setMessage(response.data.message ?? 'Verification email sent.');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Unable to resend verification email.');
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
          <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{copy.body}</p>
        </div>
        <Surface className="p-6 sm:p-7">
          {status === 'verified' ? (
            <Link to="/login" className="inline-flex w-full justify-center rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
              Sign in
            </Link>
          ) : (
            <form onSubmit={resend} className="space-y-4">
              <FieldShell label="Email">
                <TextField type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </FieldShell>
              {message ? <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200">{message}</p> : null}
              {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">{error}</p> : null}
              <button type="submit" disabled={submitting} className="w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                {submitting ? 'Sending...' : 'Resend verification email'}
              </button>
            </form>
          )}
          <Link to="/login" className="mt-4 inline-flex text-sm font-medium text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            Back to sign in
          </Link>
        </Surface>
      </div>
    </div>
  );
}
