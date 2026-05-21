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
    'rounded-2xl border border-blue-100 bg-white/75 text-slate-900 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100',
    gradient ? 'bg-gradient-to-br from-white/90 via-blue-50/80 to-sky-50/80 dark:from-slate-800 dark:via-slate-750 dark:to-slate-700' : '',
    hoverable ? 'transition-all duration-200 hover:border-blue-200 dark:hover:border-slate-600' : '',
    interactive ? 'cursor-pointer' : '',
    paddingClasses[padding],
    'shadow-none',
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

interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ title, description, action, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={['flex items-start justify-between gap-4 pb-4 border-b border-blue-100 dark:border-slate-700', className].filter(Boolean).join(' ')} {...props}>
      <div className="min-w-0 flex-1">
        {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>}
        {description && <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{description}</p>}
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
    <div className={['flex items-center justify-between gap-3 border-t border-blue-100 pt-4 dark:border-slate-700', className].filter(Boolean).join(' ')} {...props} />
  );
}
