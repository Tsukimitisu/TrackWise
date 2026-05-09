import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

interface FieldShellProps {
	label: string;
	helperText?: string;
	error?: string;
	children: ReactNode;
}

export function FieldShell({ label, helperText, error, children }: FieldShellProps) {
	return (
		<label className="block space-y-1">
			<div className="flex items-center justify-between gap-3">
				<span className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</span>
				{helperText ? <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span> : null}
			</div>
			{children}
			{error ? <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
		</label>
	);
}

const baseClassName =
	'w-full rounded-md border border-slate-100 bg-white px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-1 focus:ring-slate-200/60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:ring-slate-800/40';

export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
	return <input {...props} className={[baseClassName, props.className ?? ''].filter(Boolean).join(' ')} />;
}

export function TextAreaField(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return <textarea {...props} className={[baseClassName, 'min-h-[120px]', props.className ?? ''].filter(Boolean).join(' ')} />;
}
