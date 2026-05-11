import type { HTMLAttributes } from 'react';

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
	elevated?: boolean;
}

export default function Surface({ className = '', elevated = true, ...props }: SurfaceProps) {
	return (
		<div
			className={[
				'rounded-lg bg-white dark:bg-slate-950',
				elevated ? 'border border-slate-200 shadow-sm dark:border-slate-800' : 'border border-slate-200 dark:border-slate-800',
				className,
			]
				.filter(Boolean)
				.join(' ')}
			{...props}
		/>
	);
}
