import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import { hasRole } from '../../utils/roleHelper';
import PageHeader from '../../components/ui/PageHeader';
import Surface from '../../components/ui/Surface';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

interface Program {
  id: number;
  name: string;
  required_hours: number;
  description?: string;
  status: string;
  created_at?: string;
}

const ProgramsPage = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = hasRole(user, ['admin', 'coordinator']);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/programs`);
      const data = response.data.data || response.data;
      setPrograms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching programs:', error);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Programs"
        description="Manage training programs"
        actions={
          canManage && (
            <button
              onClick={() => navigate('/app/programs/create')}
              className="px-4 py-2 bg-ink-900 text-white rounded-lg hover:bg-ink-800 dark:hover:bg-ink-700 transition-colors text-sm font-medium"
            >
              + New
            </button>
          )
        }
      />

      {loading ? (
        <Surface className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-3 border-ink-200 border-t-ink-900 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-ink-600">Loading programs...</p>
          </div>
        </Surface>
      ) : programs.length === 0 ? (
        <EmptyState
          title="No programs yet"
          description="Create your first program to get started"
        />
      ) : (
        <Surface className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900">
                <th className="px-6 py-3 text-left text-sm font-semibold text-ink-900 dark:text-white">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-ink-900 dark:text-white">Required Hours</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-ink-900 dark:text-white">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-ink-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200 dark:divide-ink-700">
              {programs.map(p => (
                <tr key={p.id} className="hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-ink-900 dark:text-white">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-ink-600 dark:text-ink-300">{p.required_hours} hrs</td>
                  <td className="px-6 py-4 text-sm">
                    <Badge tone={p.status === 'active' ? 'success' : 'neutral'}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      onClick={() => navigate(`/app/programs/${p.id}`)}
                      className="px-3 py-1 text-sm bg-ink-900 text-white rounded-lg hover:bg-ink-800 transition-colors"
                    >
                      View
                    </button>
                    {canManage && (
                      <button
                        onClick={() => navigate(`/app/programs/${p.id}/edit`)}
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

export default ProgramsPage;
