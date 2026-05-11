import type { HTMLAttributes } from 'react';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function Progress({ value, max = 100, color = 'primary', size = 'md', showLabel = true, className = '', ...props }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  };

  return (
    <div className={className} {...props}>
      <div className={['w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden', sizeClasses[size]].filter(Boolean).join(' ')}>
        <div
          className={['h-full rounded-full transition-all duration-500 ease-out', colorClasses[color]].filter(Boolean).join(' ')}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && <div className="mt-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">{Math.round(percentage)}%</div>}
    </div>
  );
}

interface ProgressRingProps extends HTMLAttributes<SVGElement> {
  value: number;
  max?: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function ProgressRing({ value, max = 100, color = 'primary', size = 120, strokeWidth = 8, showLabel = true, ...props }: ProgressRingProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    primary: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  };

  return (
    <div className="flex items-center justify-center relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} {...props}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-200 dark:text-slate-700" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-slate-900 dark:text-slate-50">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}

interface LinearProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  animated?: boolean;
}

export function LinearProgress({ value, max = 100, animated = false, className = '', ...props }: LinearProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={[
        'h-1 w-full rounded-full bg-slate-200 overflow-hidden dark:bg-slate-700',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <div
        className={[
          'h-full bg-primary-500 transition-all duration-500',
          animated ? 'animate-pulse' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
