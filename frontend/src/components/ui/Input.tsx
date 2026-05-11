import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

interface FieldProps {
  label: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, helperText, error, required, children }: FieldProps) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </span>
        {helperText && <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span>}
      </div>
      {children}
      {error && <p className="text-sm text-danger">{error}</p>}
    </label>
  );
}

const baseInputClasses =
  'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all duration-200 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-primary-400 dark:focus:ring-primary-400/10';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={[baseInputClasses, props.className ?? ''].filter(Boolean).join(' ')} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={[baseInputClasses, 'min-h-[120px] resize-none', props.className ?? ''].filter(Boolean).join(' ')} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={[baseInputClasses, 'appearance-none pr-10', props.className ?? ''].filter(Boolean).join(' ')} />
      <svg className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  );
}

export function Checkbox(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      {...props}
      className={['h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-2 focus:ring-primary-500/10 cursor-pointer', props.className ?? ''].filter(Boolean).join(' ')}
    />
  );
}

export function Radio(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="radio"
      {...props}
      className={['h-4 w-4 border-slate-300 text-primary-500 focus:ring-2 focus:ring-primary-500/10 cursor-pointer', props.className ?? ''].filter(Boolean).join(' ')}
    />
  );
}
