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
				<span className="text-sm font-semibold text-slate-900 dark:text-slate-50">{label}</span>
				{helperText ? <span className="text-xs text-slate-600 dark:text-slate-300">{helperText}</span> : null}
			</div>
			{children}
			{error ? <p className="mt-1 text-sm font-medium text-rose-700 dark:text-rose-300">{error}</p> : null}
		</label>
	);
}

const baseClassName =
	'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-200/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/20';

export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
	return <input {...props} className={[baseClassName, props.className ?? ''].filter(Boolean).join(' ')} />;
}

export function TextAreaField(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return <textarea {...props} className={[baseClassName, 'min-h-[120px]', props.className ?? ''].filter(Boolean).join(' ')} />;
}
