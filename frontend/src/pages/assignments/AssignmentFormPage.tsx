import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
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

const AssignmentFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!hasRole(user, ['admin', 'coordinator'])) {
      navigate('/app/assignments');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState<FormDataExtended>({ user_id: '', program_id: '', supervisor_id: '', coordinator_id: '', start_date: '', end_date: '', required_hours: 0 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    fetchLookups();
    if (id) fetchAssignment();
  }, [id]);

  const fetchLookups = async () => {
    try {
      const [uRes, pRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/users`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/programs`),
      ]);
      setUsers(uRes.data.data || uRes.data || []);
      setPrograms(pRes.data.data || pRes.data || []);
    } catch (error) {
      console.error('Error fetching lookups:', error);
    }
  };

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/assignments/${id}`);
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
    } catch (error) {
      console.error('Error fetching assignment:', error);
      navigate('/app/assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    const newVal: any = name.endsWith('_id') ? (value === '' ? '' : Number(value)) : value;
    setFormData(prev => ({ ...prev, [name]: newVal }));

    // If program changed, set required_hours from program
    if (name === 'program_id') {
      const pid = value === '' ? '' : Number(value);
      const prog = programs.find(p => p.id === pid);
      if (prog) setFormData(prev => ({ ...prev, required_hours: prog.required_hours || 0 }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...formData };
      if (id) await axios.put(`${import.meta.env.VITE_API_BASE_URL}/assignments/${id}`, payload);
      else await axios.post(`${import.meta.env.VITE_API_BASE_URL}/assignments`, payload);
      navigate('/app/assignments');
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('Error saving assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={id ? 'Manage' : 'Add'}
        title={`${id ? 'Edit' : 'Create'} Assignment`}
        description={id ? 'Update assignment details' : 'Create a new assignment'}
      />
      
      <Surface className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldShell label="Trainee">
            <select
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:border-gray-800 dark:text-white"
              required
            >
              <option value="">Select trainee</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
            </select>
          </FieldShell>

          <FieldShell label="Program">
            <select
              name="program_id"
              value={formData.program_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:border-gray-800 dark:text-white"
              required
            >
              <option value="">Select program</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </FieldShell>

          <div className="grid grid-cols-2 gap-4">
            <FieldShell label="Supervisor">
              <select
                name="supervisor_id"
                value={formData.supervisor_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:border-gray-800 dark:text-white"
              >
                <option value="">Select supervisor</option>
                {users.filter(u => u.role === 'supervisor' || u.role === 'admin').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </FieldShell>

            <FieldShell label="Coordinator">
              <select
                name="coordinator_id"
                value={formData.coordinator_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:border-gray-800 dark:text-white"
              >
                <option value="">Select coordinator</option>
                {users.filter(u => u.role === 'coordinator' || u.role === 'admin').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </FieldShell>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldShell label="Start Date">
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:border-gray-800 dark:text-white"
              />
            </FieldShell>

            <FieldShell label="End Date">
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:border-gray-800 dark:text-white"
              />
            </FieldShell>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Saving...' : 'Save Assignment'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/assignments')}
              className="flex-1 px-6 py-2 border border-gray-200 text-black rounded-lg hover:bg-gray-50 dark:text-white dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Surface>
    </div>
  );
};

export default AssignmentFormPage;
