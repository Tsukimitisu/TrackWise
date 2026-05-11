import { Link } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import Surface from '../../components/ui/Surface';

export default function LandingPage() {
	return (
		<div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
			<div className="mx-auto flex max-w-5xl justify-end">
				<ThemeToggle />
			</div>

			<div className="mx-auto mt-8 max-w-5xl">
				<Surface className="p-8 sm:p-12">
					<div className="space-y-6 text-center">
						<div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">TrackWise</div>
						<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple Work Tracking</h1>
						<div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
							<Link to="/login" className="w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 sm:w-auto">
								Sign in
							</Link>
							<Link to="/register" className="w-full rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto">
								Create account
							</Link>
						</div>
					</div>
				</Surface>
			</div>
		</div>
	);
}

