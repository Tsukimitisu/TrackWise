import { Link } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import Surface from '../../components/ui/Surface';

export default function ForgotPasswordPage() {
	return (
		<div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
			<div className="mx-auto flex max-w-md justify-end">
				<ThemeToggle />
			</div>
			<div className="mx-auto mt-8 max-w-md">
				<Surface className="p-6 sm:p-8">
					<h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
					<p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Not available yet.</p>
					<Link to="/login" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
						Back to login
					</Link>
				</Surface>
			</div>
		</div>
	);
}
