import type { HTMLAttributes } from 'react';

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
	elevated?: boolean;
}

export default function Surface({ className = '', elevated = true, ...props }: SurfaceProps) {
	return (
		<div
			className={[
				'rounded-lg bg-white dark:bg-slate-950',
				elevated ? 'shadow-sm ring-1 ring-slate-50 dark:ring-slate-800' : '',
				className,
			]
				.filter(Boolean)
				.join(' ')}
			{...props}
		/>
	);
}
