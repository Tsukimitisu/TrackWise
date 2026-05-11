import type { HTMLAttributes } from 'react';

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
	elevated?: boolean;
	hoverable?: boolean;
}

export default function Surface({ className = '', elevated = true, hoverable = false, ...props }: SurfaceProps) {
	return (
		<div
			className={[
				'rounded-2xl bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100',
				elevated ? 'border border-slate-200 shadow-sm dark:border-slate-700 shadow-slate-100 dark:shadow-black/20' : 'border border-slate-200 dark:border-slate-700',
				hoverable ? 'transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600' : '',
				className,
			]
				.filter(Boolean)
				.join(' ')}
			{...props}
		/>
	);
}
