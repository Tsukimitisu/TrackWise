import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import ThemeToggle from '../../components/ThemeToggle';
import Surface from '../../components/ui/Surface';
import { FieldShell, TextField } from '../../components/ui/TextField';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setSubmitting(true);

    try {
      const response = await client.post('/auth/forgot-password', { email });
      setMessage(response.data.message ?? 'If the email exists, a password reset link has been sent.');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Unable to send a password reset link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-md justify-end">
        <ThemeToggle />
      </div>

      <div className="mx-auto mt-10 max-w-md">
        <div className="mb-6 text-center">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            Account recovery
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Reset password</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">Enter your email and we will send a reset link.</p>
        </div>

        <Surface className="border border-blue-100 bg-white/95 p-6 shadow-[0_20px_60px_rgba(59,130,246,0.12)] sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldShell label="Email">
              <TextField type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </FieldShell>

            {message ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
            {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

            <button type="submit" disabled={submitting} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <Link to="/login" className="mt-4 inline-flex text-sm font-medium text-blue-700 transition-colors hover:text-blue-800">
            Back to sign in
          </Link>
        </Surface>
      </div>
    </div>
  );
}
