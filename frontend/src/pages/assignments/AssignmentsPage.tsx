import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { hasRole } from '../../utils/roleHelper';

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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        {canManage && (
          <button onClick={() => navigate('/app/assignments/create')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ New Assignment</button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No assignments found.</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Trainee</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Program</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Supervisor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Coordinator</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Dates</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {assignments.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{a.user?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.program?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.supervisor?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.coordinator?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.start_date ? `${a.start_date}${a.end_date ? ' — ' + a.end_date : ''}` : '-'}</td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button onClick={() => navigate(`/app/assignments/${a.id}`)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">View</button>
                    {canManage && (
                      <button onClick={() => navigate(`/app/assignments/${a.id}/edit`)} className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
