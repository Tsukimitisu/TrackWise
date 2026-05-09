import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import Surface from '../../components/ui/Surface';
import { FieldShell, TextField } from '../../components/ui/TextField';

export default function RegisterPage() {
	const navigate = useNavigate();
	const { setSession } = useAuth();
	const [form, setForm] = useState({
		first_name: '',
		last_name: '',
		email: '',
		password: '',
		password_confirmation: '',
		role_id: 5,
	});
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		try {
			const response = await client.post('/auth/register', form);
			setSession(response.data.user, response.data.token);
			navigate('/app', { replace: true });
		} catch {
			setError('Unable to create the account.');
		}
	};

	return (
		<div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
			<div className="mx-auto flex max-w-xl justify-end">
				<ThemeToggle />
			</div>
			<div className="mx-auto mt-8 max-w-xl">
				<Surface className="p-6 sm:p-8">
					<h1 className="text-2xl font-bold tracking-tight">Create account</h1>
					<form onSubmit={handleSubmit} className="mt-6 space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<FieldShell label="First name">
								<TextField type="text" value={form.first_name} onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))} />
							</FieldShell>
							<FieldShell label="Last name">
								<TextField type="text" value={form.last_name} onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))} />
							</FieldShell>
						</div>
						<FieldShell label="Email">
							<TextField type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
						</FieldShell>
						<FieldShell label="Password">
							<TextField type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
						</FieldShell>
						<FieldShell label="Confirm password">
							<TextField
								type="password"
								value={form.password_confirmation}
								onChange={(event) => setForm((current) => ({ ...current, password_confirmation: event.target.value }))}
							/>
						</FieldShell>
						<input type="hidden" value={form.role_id} readOnly />
						{error ? <p className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">{error}</p> : null}
						<button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
							Register
						</button>
					</form>
					<p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
						Already have an account?{' '}
						<Link to="/login" className="hover:text-slate-900 dark:hover:text-slate-100">
							Login
						</Link>
					</p>
				</Surface>
			</div>
		</div>
	);
}

