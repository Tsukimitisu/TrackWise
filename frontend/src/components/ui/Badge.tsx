import type { ReactNode } from 'react';

interface BadgeProps {
	children: ReactNode;
	tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}

const tones: Record<NonNullable<BadgeProps['tone']>, string> = {
	neutral: 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-transparent',
	success: 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-transparent',
	warning: 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-transparent',
	danger: 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-transparent',
	info: 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-transparent',
};

export default function Badge({ children, tone = 'neutral' }: BadgeProps) {
	return (
		<span
			className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-tight ${
				tones[tone]
			}`}
		>
			{children}
		</span>
	);
}
