import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

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
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-soft backdrop-blur-xl">
        <h1 className="text-3xl font-black tracking-tight text-ink-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to manage TrackWise.</p>

        <label className="mt-6 block text-sm font-medium text-slate-700">
          Email
          <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-ink-400" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <input type="password" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-ink-400" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>

        {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <button type="submit" className="mt-6 w-full rounded-2xl bg-ink-900 px-4 py-3 font-semibold text-white transition hover:bg-ink-700">
          Login
        </button>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="text-ink-700 hover:underline">Forgot password?</Link>
          <Link to="/register" className="text-ink-700 hover:underline">Create account</Link>
        </div>
      </form>
    </div>
  );
}
