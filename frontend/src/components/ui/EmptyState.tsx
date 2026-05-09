import type { ReactNode } from 'react';
import Surface from './Surface';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Surface className="px-6 py-10 text-center sm:px-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-black dark:bg-gray-900 dark:text-white">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </div>
      <h3 className="mt-5 text-lg font-bold text-black dark:text-white">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-700 dark:text-gray-300">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </Surface>
  );
}
