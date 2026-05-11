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
      setMessage(response.data.message ?? 'Account created. Check your email to verify your account before signing in.');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Unable to create the account.');
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
          <h2 className="text-4xl font-bold mb-4">Join us today</h2>
          <p className="text-lg text-primary-100 mb-8 max-w-md">
            Start tracking your work, managing time, and collaborating with ease.
          </p>
          <div className="space-y-4">
            {[
              { icon: '🚀', text: 'Get started in minutes' },
              { icon: '🔒', text: 'Enterprise-grade security' },
              { icon: '📱', text: 'Works on all devices' },
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Create account</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Create a new account to get started. Accounts require email verification.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Messages */}
            {message && (
              <div className="rounded-lg border border-success/30 bg-success/10 dark:border-success/40 dark:bg-success/5 px-4 py-3">
                <p className="text-sm font-medium text-success dark:text-emerald-400">{message}</p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 dark:border-danger/40 dark:bg-danger/5 px-4 py-3">
                <p className="text-sm font-medium text-danger dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" size="lg" variant="primary" fullWidth isLoading={submitting}>
              {submitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-8 text-center">
            <span className="text-slate-600 dark:text-slate-400">Already have an account? </span>
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
              Sign in
            </Link>
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
