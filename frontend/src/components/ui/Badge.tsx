import type { ReactNode } from 'react';

interface BadgeProps {
	children: ReactNode;
	tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}

const tones: Record<NonNullable<BadgeProps['tone']>, string> = {
	neutral: 'border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
	success: 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300',
	warning: 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
	danger: 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300',
	info: 'border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300',
};

export default function Badge({ children, tone = 'neutral' }: BadgeProps) {
	return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
