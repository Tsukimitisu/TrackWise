import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

interface FormData {
  name: string;
  required_hours: number;
  description: string;
  status: string;
}

const ProgramFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    required_hours: 0,
    description: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
    } catch (error) {
      console.error('Error fetching program:', error);
      navigate('/app/programs');
    } finally {
      setLoading(false);
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
      if (id) {
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/programs/${id}`, formData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/programs`, formData);
      }
      navigate('/app/programs');
    } catch (error) {
      console.error('Error saving program:', error);
      alert('Error saving program.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{id ? 'Edit' : 'Create'} Program</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Program Name *</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Required Hours *</label>
          <input
            name="required_hours"
            type="number"
            value={formData.required_hours}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="flex-1 px-6 py-2 bg-blue-600 text-white rounded">
            {submitting ? 'Saving...' : 'Save Program'}
          </button>
          <button type="button" onClick={() => navigate('/app/programs')} className="flex-1 px-6 py-2 bg-gray-300 rounded">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProgramFormPage;
