import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

interface FieldShellProps {
  label: string;
  helperText?: string;
  error?: string;
  children: ReactNode;
}

export function FieldShell({ label, helperText, error, children }: FieldShellProps) {
  return (
    <label className="block space-y-2">
      <div className="flex items-end justify-between gap-3">
        <span className="text-sm font-semibold text-black dark:text-white">{label}</span>
        {helperText ? <span className="text-xs text-gray-600 dark:text-gray-400">{helperText}</span> : null}
      </div>
      {children}
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </label>
  );
}

const baseClassName =
  'w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-black outline-none transition placeholder:text-gray-500 focus:border-black focus:ring-2 focus:ring-black/20 dark:border-gray-800 dark:bg-black dark:text-white dark:placeholder:text-gray-400 dark:focus:border-white dark:focus:ring-white/20';

export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={[baseClassName, props.className ?? ''].filter(Boolean).join(' ')} />;
}

export function TextAreaField(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={[baseClassName, 'min-h-[120px]', props.className ?? ''].filter(Boolean).join(' ')} />;
}
