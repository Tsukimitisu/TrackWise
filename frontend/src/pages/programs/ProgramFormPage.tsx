import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import { hasRole } from '../../utils/roleHelper';
import PageHeader from '../../components/ui/PageHeader';
import Surface from '../../components/ui/Surface';
import { FieldShell, TextAreaField } from '../../components/ui/TextField';

interface FormData {
  name: string;
  required_hours: number;
  description: string;
  status: string;
}

const ProgramFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!hasRole(user, ['admin', 'coordinator'])) {
      navigate('/app/programs');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    required_hours: 0,
    description: '',
    status: 'active',
  });
  const [organizationId, setOrganizationId] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportFrequency, setReportFrequency] = useState<string>('weekly');
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrganizations();
    if (id) fetchProgram();
  }, [id]);

  const fetchProgram = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/programs/${id}`);
      const p = response.data;
      setFormData({
        name: p.name || '',
        required_hours: p.required_hours || 0,
        description: p.description || '',
        status: p.status || 'active',
      });
      setOrganizationId(p.organization_id || '');
      setStartDate(p.start_date || '');
      setEndDate(p.end_date || '');
      setReportFrequency(p.report_frequency || 'weekly');
    } catch (error) {
      console.error('Error fetching program:', error);
      navigate('/app/programs');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/organizations`);
      setOrganizations(res.data.data || res.data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'required_hours' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Program name is required');

    try {
      setSubmitting(true);
      const payload: any = {
        ...formData,
        organization_id: organizationId,
        start_date: startDate || null,
        end_date: endDate || null,
        report_frequency: reportFrequency,
      };

      if (id) await axios.put(`${import.meta.env.VITE_API_BASE_URL}/programs/${id}`, payload);
      else await axios.post(`${import.meta.env.VITE_API_BASE_URL}/programs`, payload);
      navigate('/app/programs');
    } catch (error) {
      console.error('Error saving program:', error);
      alert('Error saving program.');
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
        title={`${id ? 'Edit' : 'Create'} Program`}
        description={id ? 'Update program information' : 'Create a new training program'}
      />
      
      <Surface className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldShell label="Program Name">
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:border-gray-800 dark:text-white"
              required
            />
          </FieldShell>

          <FieldShell label="Required Hours">
            <input
              name="required_hours"
              type="number"
              value={formData.required_hours}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:border-gray-800 dark:text-white"
              required
            />
          </FieldShell>

          <FieldShell label="Organization">
            <select
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:border-gray-800 dark:text-white"
              required
            >
              <option value="">Select organization</option>
              {organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </FieldShell>

          <div className="grid grid-cols-2 gap-4">
            <FieldShell label="Start Date">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:border-gray-800 dark:text-white"
              />
            </FieldShell>

            <FieldShell label="End Date">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:border-gray-800 dark:text-white"
              />
            </FieldShell>
          </div>

          <FieldShell label="Report Frequency">
            <select
              value={reportFrequency}
              onChange={(e) => setReportFrequency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:border-gray-800 dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </FieldShell>

          <FieldShell label="Description">
            <TextAreaField
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
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
              {submitting ? 'Saving...' : 'Save Program'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/programs')}
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

export default ProgramFormPage;
