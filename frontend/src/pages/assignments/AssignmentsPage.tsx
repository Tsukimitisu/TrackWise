import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import { hasRole } from '../../utils/roleHelper';
import { downloadAssignmentsCSV } from '../../utils/exportHelper';
import PageHeader from '../../components/ui/PageHeader';
import Surface from '../../components/ui/Surface';
import EmptyState from '../../components/ui/EmptyState';

interface Assignment {
  id: number;
  user: { id: number; name: string } | null;
  program: { id: number; name: string } | null;
  supervisor: { id: number; name: string } | null;
  coordinator: { id: number; name: string } | null;
  start_date?: string;
  end_date?: string;
  status?: string;
}

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = hasRole(user, ['admin', 'coordinator']);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/assignments`);
      const data = response.data.data || response.data;
      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Assignments"
        description="Manage trainee assignments to programs"
        actions={
          <div className="flex gap-2">
            <button
              onClick={async () => {
                try {
                  await downloadAssignmentsCSV();
                } catch (error) {
                  alert('Failed to export data');
                }
              }}
              className="px-4 py-2 bg-ink-100 text-ink-900 rounded-lg hover:bg-ink-200 dark:bg-ink-800 dark:text-white dark:hover:bg-ink-700 transition-colors text-sm font-medium"
            >
              📥 Export
            </button>
            {canManage && (
              <button
                onClick={() => navigate('/app/assignments/create')}
                className="px-4 py-2 bg-ink-900 text-white rounded-lg hover:bg-ink-800 dark:hover:bg-ink-700 transition-colors text-sm font-medium"
              >
                + New
              </button>
            )}
          </div>
        }
      />

      {loading ? (
        <Surface className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-3 border-ink-200 border-t-ink-900 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-ink-600">Loading assignments...</p>
          </div>
        </Surface>
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="Create your first assignment to get started"
        />
      ) : (
        <Surface className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900">
                <th className="px-6 py-3 text-left text-sm font-semibold text-ink-900 dark:text-white">Trainee</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-ink-900 dark:text-white">Program</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-ink-900 dark:text-white">Supervisor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-ink-900 dark:text-white">Coordinator</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-ink-900 dark:text-white">Dates</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-ink-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200 dark:divide-ink-700">
              {assignments.map(a => (
                <tr key={a.id} className="hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-ink-900 dark:text-white">{a.user?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-ink-600 dark:text-ink-300">{a.program?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-ink-600 dark:text-ink-300">{a.supervisor?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-ink-600 dark:text-ink-300">{a.coordinator?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-ink-600 dark:text-ink-300">{a.start_date ? `${a.start_date}${a.end_date ? ' — ' + a.end_date : ''}` : '-'}</td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      onClick={() => navigate(`/app/assignments/${a.id}`)}
                      className="px-3 py-1 text-sm bg-ink-900 text-white rounded-lg hover:bg-ink-800 transition-colors"
                    >
                      View
                    </button>
                    {canManage && (
                      <button
                        onClick={() => navigate(`/app/assignments/${a.id}/edit`)}
                        className="px-3 py-1 text-sm bg-ink-100 text-ink-900 rounded-lg hover:bg-ink-200 dark:bg-ink-800 dark:text-white dark:hover:bg-ink-700 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Surface>
      )}
    </div>
  );
};

export default AssignmentsPage;
