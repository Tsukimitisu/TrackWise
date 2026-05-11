import type { ReactNode } from 'react';

interface EmptyStateProps {
	title: string;
	description?: string;
	action?: ReactNode;
	icon?: ReactNode;
}

export default function EmptyState({ title, description, action, icon }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-16 text-center dark:border-slate-600 dark:bg-slate-900/20">
			{icon ? (
				icon
			) : (
				<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
					<svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
						<path d="M4 7h16M4 12h16M4 17h16" />
					</svg>
				</div>
			)}
			<h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
			{description ? <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">{description}</p> : null}
			{action ? <div className="mt-6">{action}</div> : null}
		</div>
	);
}
