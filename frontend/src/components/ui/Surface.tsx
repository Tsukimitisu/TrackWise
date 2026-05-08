import type { HTMLAttributes } from 'react';

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export default function Surface({ className = '', elevated = true, ...props }: SurfaceProps) {
  return (
    <div
      className={[
        'rounded-[1.75rem] border border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80',
        elevated ? 'shadow-[0_18px_50px_rgba(15,23,42,0.10)]' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}
