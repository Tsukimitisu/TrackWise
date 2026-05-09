import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import { hasRole } from '../../utils/roleHelper';
import PageHeader from '../../components/ui/PageHeader';
import Surface from '../../components/ui/Surface';
import { FieldShell } from '../../components/ui/TextField';

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
  const { user } = useAuth();

  useEffect(() => {
    if (!hasRole(user, ['admin', 'coordinator'])) {
      navigate('/app/users');
    }
  }, [user, navigate]);

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
        title={`${id ? 'Edit' : 'Create'} User`}
        description={id ? 'Update user information and permissions' : 'Create a new user account'}
      />
      
      <Surface className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldShell label="Name">
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:border-gray-800 dark:text-white"
              required
            />
          </FieldShell>

          <FieldShell label="Email">
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:border-gray-800 dark:text-white"
              required
            />
          </FieldShell>

          {!id && (
            <FieldShell label="Password">
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:border-gray-800 dark:text-white"
              />
            </FieldShell>
          )}

          <FieldShell label="Role">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:border-gray-800 dark:text-white"
            >
              <option value="student">Student</option>
              <option value="supervisor">Supervisor</option>
              <option value="coordinator">Coordinator</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </FieldShell>

          <FieldShell label="Status">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:border-gray-800 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FieldShell>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Saving...' : 'Save User'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/users')}
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

export default UserFormPage;
