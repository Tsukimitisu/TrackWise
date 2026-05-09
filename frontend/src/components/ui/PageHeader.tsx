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
		<div className="space-y-4">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div className="max-w-3xl">
					<h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">{title}</h1>
				</div>
				{actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
			</div>
			{children ? <div>{children}</div> : null}
		</div>
	);
}
