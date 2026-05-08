import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

interface Assignment {
  id: number;
  user?: { id: number; name: string; email: string };
  program?: { id: number; name: string };
  supervisor?: { id: number; name: string };
  coordinator?: { id: number; name: string };
  start_date?: string;
  end_date?: string;
}

const AssignmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      navigate('/app/assignments');
      return;
    }
    fetchAssignment().catch(() => {});
  }, [id]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/assignments/${id}`);
      setAssignment(res.data);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      navigate('/app/assignments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!assignment) return <div className="text-center py-8 text-gray-500">Assignment not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Assignment Details</h1>
        <div className="space-x-2">
          <button onClick={() => navigate(`/app/assignments/${assignment.id}/edit`)} className="px-3 py-1 bg-gray-600 text-white rounded">Edit</button>
          <button onClick={() => navigate('/app/assignments')} className="px-3 py-1 bg-gray-300 rounded">Back</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="mb-2">Trainee: <strong>{assignment.user?.name || '-'}</strong> ({assignment.user?.email || '-'})</p>
        <p className="mb-2">Program: <strong>{assignment.program?.name || '-'}</strong></p>
        <p className="mb-2">Supervisor: <strong>{assignment.supervisor?.name || '-'}</strong></p>
        <p className="mb-2">Coordinator: <strong>{assignment.coordinator?.name || '-'}</strong></p>
        <p className="mb-2">Dates: <strong>{assignment.start_date || '-'}{assignment.end_date ? ' — ' + assignment.end_date : ''}</strong></p>
      </div>
    </div>
  );
};

export default AssignmentDetailPage;
