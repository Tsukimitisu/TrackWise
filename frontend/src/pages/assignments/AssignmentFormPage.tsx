import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client'; import { useAuth } from '../../auth/AuthContext';
import { hasRole } from '../../utils/roleHelper';
import PageHeader from '../../components/ui/PageHeader';
import Surface from '../../components/ui/Surface';
import { FieldShell } from '../../components/ui/TextField';

interface FormData {
  user_id: number | '';
  program_id: number | '';
  supervisor_id: number | '';
  coordinator_id: number | '';
  start_date: string;
  end_date: string;
}

interface FormDataExtended extends FormData {
  required_hours: number;
}

export default function AssignmentFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormDataExtended>({
    user_id: '',
    program_id: '',
    supervisor_id: '',
    coordinator_id: '',
    start_date: '',
    end_date: '',
    required_hours: 0,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    if (!hasRole(user, ['admin', 'coordinator'])) navigate('/app/assignments');
  }, [user, navigate]);

  useEffect(() => {
    fetchLookups().catch(() => {});
    if (id) fetchAssignment().catch(() => {});
  }, [id]);

  const fetchLookups = async () => {
    const [uRes, pRes] = await Promise.all([
      client.get(`/users`),
      client.get(`/programs`),
    ]);
    setUsers(uRes.data.data || uRes.data || []);
    setPrograms(pRes.data.data || pRes.data || []);
  };

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/assignments/${id}`);
      const a = res.data;
      setFormData({
        user_id: a.user?.id || '',
        program_id: a.program?.id || '',
        supervisor_id: a.supervisor?.id || '',
        coordinator_id: a.coordinator?.id || '',
        start_date: a.start_date || '',
        end_date: a.end_date || '',
        required_hours: a.required_hours || 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextValue: any = name.endsWith('_id') ? (value === '' ? '' : Number(value)) : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));

    if (name === 'program_id') {
      const pid = value === '' ? '' : Number(value);
      const selected = programs.find((p) => p.id === pid);
      if (selected) {
        setFormData((prev) => ({ ...prev, required_hours: selected.required_hours || 0 }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (id) {
        await client.put(`/assignments/${id}`, formData);
      } else {
        await client.post(`/assignments`, formData);
      }
      navigate('/app/assignments');
    } catch {
      alert('Error saving assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={id ? 'Manage' : 'Add'}
        title={`${id ? 'Edit' : 'Create'} Assignment`}
        description={id ? 'Update assignment details' : 'Create a new assignment'}
      />

      <Surface className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldShell label="Trainee">
            <select
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-800 dark:bg-black dark:text-white"
              required
            >
              <option value="">Select trainee</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} - {u.email}</option>
              ))}
            </select>
          </FieldShell>

          <FieldShell label="Program">
            <select
              name="program_id"
              value={formData.program_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-800 dark:bg-black dark:text-white"
              required
            >
              <option value="">Select program</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </FieldShell>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldShell label="Supervisor">
              <select
                name="supervisor_id"
                value={formData.supervisor_id}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-800 dark:bg-black dark:text-white"
              >
                <option value="">Select supervisor</option>
                {users.filter((u) => u.role === 'supervisor' || u.role === 'admin').map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </FieldShell>

            <FieldShell label="Coordinator">
              <select
                name="coordinator_id"
                value={formData.coordinator_id}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-800 dark:bg-black dark:text-white"
              >
                <option value="">Select coordinator</option>
                {users.filter((u) => u.role === 'coordinator' || u.role === 'admin').map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </FieldShell>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldShell label="Start Date">
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-800 dark:bg-black dark:text-white"
              />
            </FieldShell>

            <FieldShell label="End Date">
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-800 dark:bg-black dark:text-white"
              />
            </FieldShell>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-black px-6 py-2 text-white hover:bg-gray-900 disabled:opacity-50">
              {submitting ? 'Saving...' : 'Save Assignment'}
            </button>
            <button type="button" onClick={() => navigate('/app/assignments')} className="flex-1 rounded-lg border border-gray-300 px-6 py-2 text-black hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-900">
              Cancel
            </button>
          </div>
        </form>
      </Surface>
    </div>
  );
}
