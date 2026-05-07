import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { hasRole } from '../../utils/roleHelper';

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

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{id ? 'Edit' : 'Create'} Assignment</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Trainee *</label>
          <select name="user_id" value={formData.user_id} onChange={handleChange} className="w-full px-3 py-2 border rounded" required>
            <option value="">Select trainee</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Program *</label>
          <select name="program_id" value={formData.program_id} onChange={handleChange} className="w-full px-3 py-2 border rounded" required>
            <option value="">Select program</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor</label>
            <select name="supervisor_id" value={formData.supervisor_id} onChange={handleChange} className="w-full px-3 py-2 border rounded">
              <option value="">Select supervisor</option>
              {users.filter(u => u.role === 'supervisor' || u.role === 'admin').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Coordinator</label>
            <select name="coordinator_id" value={formData.coordinator_id} onChange={handleChange} className="w-full px-3 py-2 border rounded">
              <option value="">Select coordinator</option>
              {users.filter(u => u.role === 'coordinator' || u.role === 'admin').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="flex-1 px-6 py-2 bg-blue-600 text-white rounded">{submitting ? 'Saving...' : 'Save Assignment'}</button>
          <button type="button" onClick={() => navigate('/app/assignments')} className="flex-1 px-6 py-2 bg-gray-300 rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AssignmentFormPage;
