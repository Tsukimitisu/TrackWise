import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import Surface from '../../components/ui/Surface';
import { FieldShell, TextField } from '../../components/ui/TextField';

export default function VerifyEmailPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') ?? 'pending';
  const token = searchParams.get('token');
  const initialEmail = useMemo(() => searchParams.get('email') ?? '', [searchParams]);
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [autoSigningIn, setAutoSigningIn] = useState(status === 'verified' && Boolean(token));

  const copy = {
    verified: {
      title: 'Email verified',
      body: token ? 'Your Gmail is verified. Signing you in now...' : 'Your account is ready. You can sign in now.',
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

  useEffect(() => {
    if (status !== 'verified' || !token) return;

    const finishAutoLogin = async () => {
      setAutoSigningIn(true);
      setError(null);

      try {
        localStorage.setItem('trackwise_token', token);
        const response = await client.get('/auth/me');
        setSession(response.data, token);
        navigate('/app', { replace: true });
      } catch {
        localStorage.removeItem('trackwise_token');
        setError('Your email is verified, but automatic sign-in failed. Please sign in manually.');
        setAutoSigningIn(false);
      }
    };

    void finishAutoLogin();
  }, [navigate, setSession, status, token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-md justify-end">
        <ThemeToggle />
      </div>

      <div className="mx-auto mt-10 max-w-md">
        <div className="mb-6 text-center">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            Verification
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{copy.title}</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">{copy.body}</p>
        </div>

        <Surface className="border border-blue-100 bg-white/95 p-6 shadow-[0_20px_60px_rgba(59,130,246,0.12)] sm:p-7">
          {status === 'verified' ? (
            autoSigningIn ? (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                Signing you in automatically...
              </div>
            ) : (
              <Link to="/login" className="inline-flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                Sign in
              </Link>
            )
          ) : (
            <form onSubmit={resend} className="space-y-4">
              <FieldShell label="Email">
                <TextField type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </FieldShell>
              {message ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
              {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
              <button type="submit" disabled={submitting} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? 'Sending...' : 'Resend verification email'}
              </button>
            </form>
          )}

          {status === 'verified' && error ? <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

          <Link to="/login" className="mt-4 inline-flex text-sm font-medium text-blue-700 transition-colors hover:text-blue-800">
            Back to sign in
          </Link>
        </Surface>
      </div>
    </div>
  );
}
