import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-soft backdrop-blur-xl">
        <h1 className="text-3xl font-black tracking-tight text-ink-900">Reset password</h1>
        <p className="mt-2 text-sm text-slate-500">Password recovery can be connected to the backend mail flow next.</p>
        <Link to="/login" className="mt-6 inline-flex rounded-2xl bg-ink-900 px-4 py-3 font-semibold text-white transition hover:bg-ink-700">
          Back to login
        </Link>
      </div>
    </div>
  );
}
