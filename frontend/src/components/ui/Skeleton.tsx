import type { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ variant = 'rectangular', width, height, className = '', ...props }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-slate-200 dark:bg-slate-700';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const styles = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return <div className={[baseClasses, variantClasses[variant], className].filter(Boolean).join(' ')} style={styles} {...props} />;
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={['space-y-2', className].filter(Boolean).join(' ')}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={16} className={i === lines - 1 ? 'w-5/6' : 'w-full'} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={['rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800', className].filter(Boolean).join(' ')}>
      <Skeleton height={24} width="60%" className="mb-3" />
      <SkeletonText lines={3} />
    </div>
  );
}
