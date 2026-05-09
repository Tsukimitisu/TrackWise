import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
			aria-label="Toggle theme"
		>
			{theme === 'dark' ? (
				<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
					<path d="M12 3v2M12 19v2M4.93 4.93l1.42 1.42M17.66 17.66l1.42 1.42M3 12h2M19 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.42-1.42" />
					<circle cx="12" cy="12" r="4" />
				</svg>
			) : (
				<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
					<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
				</svg>
			)}
			<span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
		</button>
	);
}
