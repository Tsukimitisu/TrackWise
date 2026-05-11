import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  status?: 'approved' | 'pending' | 'rejected' | 'draft' | 'warning' | 'success' | 'error' | 'info';
  variant?: 'solid' | 'subtle' | 'outline';
  size?: 'sm' | 'md';
}

export default function Badge({ status = 'info', variant = 'subtle', size = 'md', className = '', children, ...props }: BadgeProps) {
  const statusClasses = {
    approved: {
      solid: 'bg-success text-white',
      subtle: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
      outline: 'border border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300',
    },
    pending: {
      solid: 'bg-pending text-white',
      subtle: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300',
      outline: 'border border-indigo-300 text-indigo-700 dark:border-indigo-700 dark:text-indigo-300',
    },
    rejected: {
      solid: 'bg-danger text-white',
      subtle: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
      outline: 'border border-red-300 text-red-700 dark:border-red-700 dark:text-red-300',
    },
    draft: {
      solid: 'bg-slate-400 text-white',
      subtle: 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-300',
      outline: 'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300',
    },
    warning: {
      solid: 'bg-warning text-white',
      subtle: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
      outline: 'border border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300',
    },
    success: {
      solid: 'bg-success text-white',
      subtle: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
      outline: 'border border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300',
    },
    error: {
      solid: 'bg-danger text-white',
      subtle: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
      outline: 'border border-red-300 text-red-700 dark:border-red-700 dark:text-red-300',
    },
    info: {
      solid: 'bg-blue-500 text-white',
      subtle: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
      outline: 'border border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300',
    },
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs font-medium rounded-md',
    md: 'px-3 py-1.5 text-sm font-medium rounded-lg',
  };

  const allClasses = [
    'inline-flex items-center gap-1.5 font-medium transition-all duration-200',
    statusClasses[status][variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={allClasses} {...props}>
      {children}
    </div>
  );
}
