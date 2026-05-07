import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

interface Program {
  id: number;
  name: string;
  required_hours: number;
  description?: string;
  status: string;
  created_at?: string;
}

const ProgramDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return navigate('/app/programs');
    fetchProgram();
  }, [id]);

  const fetchProgram = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/programs/${id}`);
      setProgram(response.data);
    } catch (error) {
      console.error('Error fetching program:', error);
      navigate('/app/programs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!program) return <div className="text-center py-8 text-gray-500">Program not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{program.name}</h1>
        <div className="space-x-2">
          <button onClick={() => navigate(`/app/programs/${program.id}/edit`)} className="px-3 py-1 bg-gray-600 text-white rounded">Edit</button>
          <button onClick={() => navigate('/app/programs')} className="px-3 py-1 bg-gray-300 rounded">Back</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm text-gray-600 mb-4">Required Hours: <strong>{program.required_hours}</strong></p>
        <p className="text-sm text-gray-600 mb-4">Status: <span className="capitalize">{program.status}</span></p>
        <div className="prose">
          <h3 className="text-lg font-semibold">Description</h3>
          <p>{program.description || 'No description provided.'}</p>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetailPage;
