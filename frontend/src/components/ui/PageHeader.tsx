import type { ReactNode } from 'react';

interface PageHeaderProps {
	eyebrow?: string;
	title: string;
	description?: string;
	actions?: ReactNode;
	children?: ReactNode;
}

export default function PageHeader({ eyebrow, title, description, actions, children }: PageHeaderProps) {
	return (
		<div className="space-y-6 animate-fade-in">
			<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
				<div className="flex-1 min-w-0">
					{eyebrow && (
						<div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-50 dark:bg-primary-950/30 px-3 py-1">
							<span className="h-1.5 w-1.5 rounded-full bg-primary-500"></span>
							<span className="text-xs font-semibold uppercase tracking-wider text-primary-800 dark:text-primary-200">{eyebrow}</span>
						</div>
					)}
					<h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
						{title}
					</h1>
					{description && (
						<p className="text-base text-slate-700 dark:text-slate-300 max-w-2xl">
							{description}
						</p>
					)}
				</div>
				{actions && (
					<div className="flex flex-wrap gap-3 shrink-0">
						{actions}
					</div>
				)}
			</div>
			{children && <div>{children}</div>}
		</div>
	);
}
