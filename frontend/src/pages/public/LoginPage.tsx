import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import Surface from '../../components/ui/Surface';
import { FieldShell, TextField } from '../../components/ui/TextField';

export default function LoginPage() {
	const navigate = useNavigate();
	const { setSession } = useAuth();
	const [email, setEmail] = useState('admin@trackwise.test');
	const [password, setPassword] = useState('password');
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		try {
			const response = await client.post('/auth/login', { email, password });
			setSession(response.data.user, response.data.token);
			navigate('/app', { replace: true });
		} catch {
			setError('Invalid login credentials.');
		}
	};

	return (
		<div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
			<div className="mx-auto flex max-w-md justify-end">
				<ThemeToggle />
			</div>
			<div className="mx-auto mt-8 max-w-md">
				<Surface className="p-6 sm:p-8">
					<h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
					<form onSubmit={handleSubmit} className="mt-6 space-y-4">
						<FieldShell label="Email">
							<TextField type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
						</FieldShell>
						<FieldShell label="Password">
							<TextField type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
						</FieldShell>
						{error ? <p className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">{error}</p> : null}
						<button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
							Login
						</button>
					</form>
					<div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
						<Link to="/forgot-password" className="hover:text-slate-900 dark:hover:text-slate-100">Forgot password?</Link>
						<Link to="/register" className="hover:text-slate-900 dark:hover:text-slate-100">Create account</Link>
					</div>
				</Surface>
			</div>
		</div>
	);
}

