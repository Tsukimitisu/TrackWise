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
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600 p-12 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg font-bold text-white">TW</div>
          <span className="text-2xl font-bold text-white">TrackWise</span>
        </Link>

        {/* Content */}
        <div className="text-white">
          <h2 className="text-4xl font-bold mb-4">Welcome back</h2>
          <p className="text-lg text-primary-100 mb-8 max-w-md">
            Manage your work, track time, and collaborate with your team all in one place.
          </p>
          <div className="space-y-4">
            {[
              { icon: '⏱️', text: 'Real-time time tracking' },
              { icon: '📊', text: 'Smart reporting & analytics' },
              { icon: '✅', text: 'Approval workflows' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-primary-100">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-primary-100">© 2026 TrackWise. All rights reserved.</p>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-12">
        {/* Top navigation */}
        <div className="absolute top-6 right-6 lg:hidden">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm mx-auto lg:max-w-none lg:ml-0">
          {/* Header */}
          <div className="mb-8">
            <div className="lg:hidden mb-6">
              <Link to="/" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center text-sm font-bold text-white">TW</div>
                <span className="font-bold text-lg text-slate-900 dark:text-slate-100">TrackWise</span>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Sign in</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Enter your credentials to access your workspace
            </p>
          </div>

          {/* Form */}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
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

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 dark:border-danger/40 dark:bg-danger/5 px-4 py-3">
                <p className="text-sm font-medium text-danger dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" size="lg" variant="primary" fullWidth isLoading={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <Link to="/forgot-password" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
              Forgot password?
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400">Don't have an account?</span>
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                Create account
              </Link>
            </div>
          </div>

          {/* Demo Info */}
          <div className="mt-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              <span className="font-semibold">Demo Account:</span> Use the credentials above
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Password for all seeded accounts: <span className="font-mono font-semibold">Password123!</span>
            </p>
          </div>
        </div>
      </div>

      {/* Theme Toggle for Desktop */}
      <div className="absolute top-6 right-6 hidden lg:block">
        <ThemeToggle />
      </div>
    </div>
  );
}
