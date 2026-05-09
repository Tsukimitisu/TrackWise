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
				<span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</span>
				{helperText ? <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span> : null}
			</div>
			{children}
			{error ? <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
		</label>
	);
}

const baseClassName =
	'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20';

export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
	return <input {...props} className={[baseClassName, props.className ?? ''].filter(Boolean).join(' ')} />;
}

export function TextAreaField(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return <textarea {...props} className={[baseClassName, 'min-h-[120px]', props.className ?? ''].filter(Boolean).join(' ')} />;
}
