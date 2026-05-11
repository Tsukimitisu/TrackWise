import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Surface from '../../components/ui/Surface';
import { FieldShell, TextField } from '../../components/ui/TextField';
import { hasRole } from '../../utils/roleHelper';

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  password: string;
  status: string;
}

const roleOptions = ['Student', 'Supervisor', 'Coordinator', 'Organization Admin', 'Super Admin', 'Viewer'];

export default function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    role: 'Student',
    password: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!hasRole(user, ['admin', 'coordinator'])) {
      navigate('/app/users');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (id) void fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await client.get(`/users/${id}`);
      const item = response.data;
      setFormData({
        first_name: item.first_name || '',
        last_name: item.last_name || '',
        email: item.email || '',
        role: item.role?.name || 'Student',
        password: '',
        status: item.status || 'active',
      });
    } catch (requestError) {
      console.error('Error fetching user:', requestError);
      navigate('/app/users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      setSubmitting(true);
      const payload: Record<string, string> = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
      };
      if (formData.password) payload.password = formData.password;
      if (id) await client.put(`/users/${id}`, payload);
      else await client.post('/users', payload);
      navigate('/app/users');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Error saving user.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Surface className="p-10 text-center text-slate-500 dark:text-slate-400">Loading user...</Surface>;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={id ? 'Manage' : 'Add'} title={`${id ? 'Edit' : 'Create'} User`} description="Admin-created accounts are marked verified and can sign in immediately." />
      <Surface className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldShell label="First name">
              <TextField value={formData.first_name} onChange={(event) => setFormData((current) => ({ ...current, first_name: event.target.value }))} required />
            </FieldShell>
            <FieldShell label="Last name">
              <TextField value={formData.last_name} onChange={(event) => setFormData((current) => ({ ...current, last_name: event.target.value }))} required />
            </FieldShell>
          </div>
          <FieldShell label="Email">
            <TextField type="email" value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} required />
          </FieldShell>
          <FieldShell label={id ? 'New password' : 'Password'} helperText={id ? 'Leave blank to keep current password' : 'Required'}>
            <TextField type="password" value={formData.password} onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))} required={!id} />
          </FieldShell>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldShell label="Role">
              <select value={formData.role} onChange={(event) => setFormData((current) => ({ ...current, role: event.target.value }))} className="w-full rounded-md border border-slate-100 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-slate-300 focus:ring-1 focus:ring-slate-200/60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </FieldShell>
            <FieldShell label="Status">
              <select value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-md border border-slate-100 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-slate-300 focus:ring-1 focus:ring-slate-200/60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </FieldShell>
          </div>
          {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">{error}</p> : null}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
              {submitting ? 'Saving...' : 'Save user'}
            </button>
            <button type="button" onClick={() => navigate('/app/users')} className="rounded-md border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
              Cancel
            </button>
          </div>
        </form>
      </Surface>
    </div>
  );
}
