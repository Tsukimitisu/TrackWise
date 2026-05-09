import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}

const tones: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'bg-gray-100 text-black dark:bg-gray-900 dark:text-white',
  success: 'bg-black text-white dark:bg-white dark:text-black',
  warning: 'bg-gray-400 text-black dark:bg-gray-600 dark:text-white',
  danger: 'bg-black text-white dark:bg-white dark:text-black',
  info: 'bg-gray-300 text-black dark:bg-gray-700 dark:text-white',
};

export default function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
