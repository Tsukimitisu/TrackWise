import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: 5,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await client.post('/auth/register', form);
      setSession(response.data.user, response.data.token);
      navigate('/app', { replace: true });
    } catch {
      setError('Unable to create the account.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-soft backdrop-blur-xl">
        <h1 className="text-3xl font-black tracking-tight text-ink-900">Create account</h1>
        <p className="mt-2 text-sm text-slate-500">Register a TrackWise user account.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            First name
            <input
              type="text"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-ink-400"
              value={form.first_name}
              onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Last name
            <input
              type="text"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-ink-400"
              value={form.last_name}
              onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-ink-400"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-ink-400"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 md:col-span-2">
            Confirm password
            <input
              type="password"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-ink-400"
              value={form.password_confirmation}
              onChange={(event) => setForm((current) => ({ ...current, password_confirmation: event.target.value }))}
            />
          </label>
        </div>

        <input type="hidden" value={form.role_id} readOnly />

        {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <button type="submit" className="mt-6 w-full rounded-2xl bg-ink-900 px-4 py-3 font-semibold text-white transition hover:bg-ink-700">
          Register
        </button>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-ink-700 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
}
