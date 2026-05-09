import type { HTMLAttributes } from 'react';

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
	elevated?: boolean;
}

export default function Surface({ className = '', elevated = true, ...props }: SurfaceProps) {
	return (
		<div
			className={[
				'rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950',
				elevated ? 'shadow-sm' : '',
				className,
			]
				.filter(Boolean)
				.join(' ')}
			{...props}
		/>
	);
}
