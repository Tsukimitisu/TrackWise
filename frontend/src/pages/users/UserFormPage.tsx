import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

interface FormData {
  name: string;
  email: string;
  role: string;
  password?: string;
  status: string;
}

const UserFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', role: 'student', password: '', status: 'active' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/${id}`);
      const u = response.data;
      setFormData({ name: u.name || '', email: u.email || '', role: u.role || 'student', status: u.status || 'active' });
    } catch (error) {
      console.error('Error fetching user:', error);
      navigate('/app/users');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return alert('Name and email required');

    try {
      setSubmitting(true);
      const payload: any = { name: formData.name, email: formData.email, role: formData.role, status: formData.status };
      if (!id && formData.password) payload.password = formData.password;
      if (id) await axios.put(`${import.meta.env.VITE_API_BASE_URL}/users/${id}`, payload);
      else await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users`, payload);
      navigate('/app/users');
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{id ? 'Edit' : 'Create'} User</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
          <input name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
        </div>
        {!id && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border rounded">
            <option value="student">Student</option>
            <option value="supervisor">Supervisor</option>
            <option value="coordinator">Coordinator</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="flex-1 px-6 py-2 bg-blue-600 text-white rounded">
            {submitting ? 'Saving...' : 'Save User'}
          </button>
          <button type="button" onClick={() => navigate('/app/users')} className="flex-1 px-6 py-2 bg-gray-300 rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default UserFormPage;
