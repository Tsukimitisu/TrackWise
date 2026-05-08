import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';

interface UserProgram {
  id: number;
  user_id: number;
  program_id: number;
  user: { first_name: string; last_name: string };
  program: { name: string };
}

interface DailyReport {
  id?: number;
  user_program_id: number;
  report_date: string;
  tasks_done: string;
  tools_used: string;
  problems_encountered: string;
  learnings: string;
  status: string;
}

const DailyReportFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const [userPrograms, setUserPrograms] = useState<UserProgram[]>([]);
  const [formData, setFormData] = useState<DailyReport>({
    user_program_id: 0,
    report_date: new Date().toISOString().split('T')[0],
    tasks_done: '',
    tools_used: '',
    problems_encountered: '',
    learnings: '',
    status: 'draft',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserPrograms();
    if (id) {
      fetchReport();
    }
  }, [id]);

  const fetchUserPrograms = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/assignments`);
      const programs = response.data.data || response.data;
      setUserPrograms(programs);
      if (programs.length > 0 && !id) {
        setFormData(prev => ({ ...prev, user_program_id: programs[0].id }));
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/daily-reports/${id}`);
      const report = response.data;
      setFormData({
        user_program_id: report.user_program_id,
        report_date: report.report_date,
        tasks_done: report.tasks_done,
        tools_used: report.tools_used || '',
        problems_encountered: report.problems_encountered || '',
        learnings: report.learnings || '',
        status: report.status,
      });
    } catch (error) {
      console.error('Error fetching report:', error);
      navigate('/app/reports/daily');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      if (id) {
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/daily-reports/${id}`, formData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/daily-reports`, formData);
      }

      navigate('/app/reports/daily');
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Error saving report. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-8 text-center text-slate-500 dark:text-slate-400">Loading...</div>;

  return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {id ? 'Edit Daily Report' : 'Create Daily Report'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Program/Assignment</label>
            <select
              name="user_program_id"
              value={formData.user_program_id}
              onChange={handleChange}
              disabled={!!id}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a program</option>
              {userPrograms.map(up => (
                <option key={up.id} value={up.id}>
                  {up.program.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Date</label>
            <input
              type="date"
              name="report_date"
              value={formData.report_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tasks Done *</label>
            <textarea
              name="tasks_done"
              value={formData.tasks_done}
              onChange={handleChange}
              placeholder="Describe the tasks you completed today..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tools Used</label>
            <textarea
              name="tools_used"
              value={formData.tools_used}
              onChange={handleChange}
              placeholder="List the tools, software, or equipment used..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Problems Encountered</label>
            <textarea
              name="problems_encountered"
              value={formData.problems_encountered}
              onChange={handleChange}
              placeholder="Describe any challenges or issues you faced..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Learnings & Insights</label>
            <textarea
              name="learnings"
              value={formData.learnings}
              onChange={handleChange}
              placeholder="What did you learn today? Any insights or key takeaways..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : id ? 'Update Report' : 'Create Report'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/reports/daily')}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
  );
};

export default DailyReportFormPage;
