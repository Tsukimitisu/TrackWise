import type { HTMLAttributes } from 'react';

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
	elevated?: boolean;
	hoverable?: boolean;
}

export default function Surface({ className = '', elevated = true, hoverable = false, ...props }: SurfaceProps) {
	return (
		<div
			className={[
				'rounded-2xl bg-white/75 text-slate-900 backdrop-blur-sm dark:bg-slate-800/70 dark:text-slate-100',
				elevated ? 'border border-blue-100 shadow-none dark:border-slate-700' : 'border border-blue-100/70 dark:border-slate-700',
				hoverable ? 'transition-all duration-200 hover:border-blue-200 dark:hover:border-slate-600' : '',
				className,
			]
				.filter(Boolean)
				.join(' ')}
			{...props}
		/>
	);
}
