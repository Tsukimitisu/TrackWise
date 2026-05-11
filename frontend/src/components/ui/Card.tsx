import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  gradient?: boolean;
}

export default function Card({
  interactive = false,
  hoverable = true,
  padding = 'md',
  gradient = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const paddingClasses = {
    sm: 'p-3.5',
    md: 'p-5',
    lg: 'p-6',
  };

  const allClasses = [
    'rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
    gradient ? 'bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-750 dark:to-slate-700' : '',
    hoverable ? 'transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600' : '',
    interactive ? 'cursor-pointer' : '',
    paddingClasses[padding],
    'shadow-sm',
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

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ title, description, action, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={['flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700', className].filter(Boolean).join(' ')} {...props}>
      <div className="min-w-0 flex-1">
        {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
        {description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export function CardBody({ className = '', ...props }: CardBodyProps) {
  return <div className={['py-4', className].filter(Boolean).join(' ')} {...props} />;
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className = '', ...props }: CardFooterProps) {
  return (
    <div className={['flex items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-700', className].filter(Boolean).join(' ')} {...props} />
  );
}
