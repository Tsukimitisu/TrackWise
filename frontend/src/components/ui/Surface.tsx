import type { HTMLAttributes } from 'react';

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
	elevated?: boolean;
}

export default function Surface({ className = '', elevated = true, ...props }: SurfaceProps) {
	return (
		<div
			className={[
				'rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-950/85',
				elevated ? 'shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)]' : '',
				className,
			]
				.filter(Boolean)
				.join(' ')}
			{...props}
		/>
	);
}
