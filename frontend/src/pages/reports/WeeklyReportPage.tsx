import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import AppShell from '../../components/AppShell';
import { downloadWeeklyReportsCSV } from '../../utils/exportHelper';

interface WeeklyReport {
  id: number;
  user_program_id: number;
  week_number: number;
  start_date: string;
  end_date: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'needs_revision';
  submitted_at?: string;
  reviewed_by?: number;
  review_comment?: string;
  userProgram?: {
    user: { first_name: string; last_name: string };
    program: { name: string };
  };
}

const WeeklyReportPage = () => {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, [filter, search]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filter) params.status = filter;
      if (search) params.search = search;

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/weekly-reports`, { params });
      setReports(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching weekly reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/weekly-reports/${id}`);
      setReports(reports.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'needs_revision':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Weekly Narrative Reports</h1>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                try {
                  await downloadWeeklyReportsCSV({ status: filter, search });
                } catch (error) {
                  alert('Failed to export data');
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              📥 Export CSV
            </button>
            <button
              onClick={() => navigate('/app/reports/weekly/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              New Report
            </button>
          </div>
        </div>

        <div className="mb-4 space-y-3">
          <input
            type="text"
            placeholder="Search by name, email, program, or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2 flex-wrap">
            {['', 'draft', 'submitted', 'approved', 'rejected', 'needs_revision'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status || 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No weekly reports found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Week #</th>
                  <th className="px-4 py-2 text-left">Period</th>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Program</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold">Week {report.week_number}</td>
                    <td className="px-4 py-2 text-sm">
                      {report.start_date} to {report.end_date}
                    </td>
                    <td className="px-4 py-2">
                      {report.userProgram?.user.first_name} {report.userProgram?.user.last_name}
                    </td>
                    <td className="px-4 py-2">{report.userProgram?.program.name}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusBadgeColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => navigate(`/app/reports/weekly/${report.id}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View
                      </button>
                      {report.status === 'draft' && (
                        <>
                          <button
                            onClick={() => navigate(`/app/reports/weekly/${report.id}/edit`)}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(report.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default WeeklyReportPage;
