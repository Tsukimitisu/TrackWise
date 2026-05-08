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

interface WeeklyReport {
  id?: number;
  user_program_id: number;
  week_number: number;
  start_date: string;
  end_date: string;
  summary: string;
  skills_learned: string;
  challenges: string;
  reflection: string;
  status: string;
}

const WeeklyReportFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const [userPrograms, setUserPrograms] = useState<UserProgram[]>([]);
  const [formData, setFormData] = useState<WeeklyReport>({
    user_program_id: 0,
    week_number: 1,
    start_date: '',
    end_date: '',
    summary: '',
    skills_learned: '',
    challenges: '',
    reflection: '',
    status: 'draft',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateMode, setGenerateMode] = useState(false);
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
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/weekly-reports/${id}`);
      const report = response.data;
      setFormData({
        user_program_id: report.user_program_id,
        week_number: report.week_number,
        start_date: report.start_date,
        end_date: report.end_date,
        summary: report.summary,
        skills_learned: report.skills_learned || '',
        challenges: report.challenges || '',
        reflection: report.reflection || '',
        status: report.status,
      });
    } catch (error) {
      console.error('Error fetching report:', error);
      navigate('/app/reports/weekly');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'week_number' ? parseInt(value) : value,
    }));
  };

  const handleGenerateDraft = async () => {
    if (!formData.user_program_id || !formData.week_number || !formData.start_date || !formData.end_date) {
      alert('Please fill in program, week number, and dates first');
      return;
    }

    try {
      setGenerating(true);
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/weekly-reports/generate-draft`, {
        user_program_id: formData.user_program_id,
        week_number: formData.week_number,
        start_date: formData.start_date,
        end_date: formData.end_date,
      });

      const report = response.data;
      setFormData({
        user_program_id: report.user_program_id,
        week_number: report.week_number,
        start_date: report.start_date,
        end_date: report.end_date,
        summary: report.summary,
        skills_learned: report.skills_learned || '',
        challenges: report.challenges || '',
        reflection: report.reflection || '',
        status: report.status,
      });

      setGenerateMode(false);
      alert('Weekly report draft generated from approved daily reports!');
    } catch (error: any) {
      console.error('Error generating draft:', error);
      alert(error.response?.data?.message || 'Error generating weekly report draft');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      if (id) {
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/weekly-reports/${id}`, formData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/weekly-reports`, formData);
      }

      navigate('/app/reports/weekly');
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
          {id ? 'Edit Weekly Report' : 'Create Weekly Report'}
        </h1>

        {!id && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900 mb-3">
              💡 You can auto-generate a draft from your approved daily reports for the week.
            </p>
            {!generateMode ? (
              <button
                type="button"
                onClick={() => setGenerateMode(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Generate from Daily Reports
              </button>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                    <select
                      value={formData.user_program_id}
                      onChange={e => setFormData(prev => ({ ...prev, user_program_id: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a program</option>
                      {userPrograms.map(up => (
                        <option key={up.id} value={up.id}>
                          {up.program.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Week #</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.week_number}
                      onChange={e => setFormData(prev => ({ ...prev, week_number: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={e => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={e => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateDraft}
                    disabled={generating}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 text-sm"
                  >
                    {generating ? 'Generating...' : 'Generate Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenerateMode(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {!generateMode && (
            <>
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

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Week Number</label>
                  <input
                    type="number"
                    name="week_number"
                    min="1"
                    value={formData.week_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary of Activities *</label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  placeholder="Summarize the week's activities and accomplishments..."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills Learned</label>
                <textarea
                  name="skills_learned"
                  value={formData.skills_learned}
                  onChange={handleChange}
                  placeholder="What new skills or knowledge did you acquire this week?..."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Challenges Encountered</label>
                <textarea
                  name="challenges"
                  value={formData.challenges}
                  onChange={handleChange}
                  placeholder="Describe challenges or obstacles faced during the week..."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reflection & Insights</label>
                <textarea
                  name="reflection"
                  value={formData.reflection}
                  onChange={handleChange}
                  placeholder="Your personal reflection on the week's experience and insights..."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
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
                  onClick={() => navigate('/app/reports/weekly')}
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      </div>
  );
};

export default WeeklyReportFormPage;
