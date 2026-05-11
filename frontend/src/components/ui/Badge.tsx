import type { ReactNode } from 'react';

interface BadgeProps {
	children: ReactNode;
	tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}

const tones: Record<NonNullable<BadgeProps['tone']>, string> = {
	neutral: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
	success: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200',
	warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200',
	danger: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200',
	info: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-200',
};

export default function Badge({ children, tone = 'neutral' }: BadgeProps) {
	return (
		<span
			className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium tracking-tight ${
				tones[tone]
			}`}
		>
			{children}
		</span>
	);
}
