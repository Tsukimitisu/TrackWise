import type { ReactNode } from 'react';
import Surface from './Surface';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export default function PageHeader({ eyebrow, title, description, actions, children }: PageHeaderProps) {
  return (
    <Surface className="overflow-hidden bg-gradient-to-br from-slate-950 via-ink-900 to-indigo-900 text-white dark:border-slate-800">
      <div className="relative px-6 py-7 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.35),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.16),transparent_24%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">{eyebrow}</div> : null}
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
            {description ? <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {children ? <div className="relative mt-6">{children}</div> : null}
      </div>
    </Surface>
  );
}
