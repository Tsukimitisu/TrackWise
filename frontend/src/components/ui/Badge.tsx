import type { ReactNode } from 'react';

interface BadgeProps {
	children: ReactNode;
	tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}

const tones: Record<NonNullable<BadgeProps['tone']>, string> = {
	neutral: 'border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
	success: 'border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
	warning: 'border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
	danger: 'border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
	info: 'border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
};

export default function Badge({ children, tone = 'neutral' }: BadgeProps) {
	return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
