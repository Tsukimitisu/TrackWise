import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export default function PageHeader({ eyebrow, title, description, actions, children }: PageHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <div className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">{eyebrow}</div> : null}
          <h1 className="mt-3 text-4xl font-black text-black dark:text-white">{title}</h1>
          {description ? <p className="mt-3 max-w-2xl text-base leading-7 text-gray-700 dark:text-gray-300">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      {children ? <div>{children}</div> : null}
    </div>
  );
}
