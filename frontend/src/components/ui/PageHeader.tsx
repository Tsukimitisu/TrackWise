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
		<div className="space-y-5">
			<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
				<div className="max-w-3xl">
					{eyebrow ? <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{eyebrow}</div> : null}
					<h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">{title}</h1>
					{description ? <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">{description}</p> : null}
				</div>
				{actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
			</div>
			{children ? <div>{children}</div> : null}
		</div>
	);
}
