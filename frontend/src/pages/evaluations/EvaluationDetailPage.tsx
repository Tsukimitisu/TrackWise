import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';

interface Evaluation {
  id: number;
  user_program_id: number;
  supervisor_id: number;
  attendance_score?: number;
  performance_score?: number;
  communication_score?: number;
  technical_score?: number;
  professionalism_score?: number;
  comments?: string;
  created_at: string;
  updated_at: string;
  userProgram?: {
    user: { first_name: string; last_name: string };
    program: { name: string };
  };
  supervisor?: {
    first_name: string;
    last_name: string;
  };
}

const EvaluationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [averageScore, setAverageScore] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvaluation();
  }, [id]);

  const fetchEvaluation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/evaluations/${id}`);
      const evaluation_data = response.data;
      setEvaluation(evaluation_data);

      // Calculate average
      const scores = [
        evaluation_data.attendance_score,
        evaluation_data.performance_score,
        evaluation_data.communication_score,
        evaluation_data.technical_score,
        evaluation_data.professionalism_score,
      ];
      const validScores = scores.filter(s => s !== null && s !== undefined);
      const avg = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;
      setAverageScore(avg);
    } catch (error) {
      console.error('Error fetching evaluation:', error);
      navigate('/app/evaluations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this evaluation?')) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/evaluations/${id}`);
      navigate('/app/evaluations');
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      alert('Error deleting evaluation');
    }
  };

  const getScoreBadge = (score?: number): string => {
    if (!score) return 'bg-gray-100 text-gray-600';
    if (score >= 4.5) return 'bg-green-100 text-green-700';
    if (score >= 3.5) return 'bg-blue-100 text-blue-700';
    if (score >= 2.5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const ScoreDisplay = ({ label, score }: { label: string; score?: number }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className={`px-3 py-1 rounded font-semibold text-sm ${getScoreBadge(score)}`}>
        {score ? `${score}/5` : 'N/A'}
      </span>
    </div>
  );

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!evaluation) return <div className="text-center py-8 text-red-600">Evaluation not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Evaluation Details</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/app/evaluations/${id}/edit`)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={() => navigate('/app/evaluations')}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Back
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Student</p>
            <p className="text-lg font-semibold text-gray-900">
              {evaluation.userProgram?.user.first_name} {evaluation.userProgram?.user.last_name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Program</p>
            <p className="text-lg font-semibold text-gray-900">{evaluation.userProgram?.program.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Supervisor</p>
            <p className="text-lg font-semibold text-gray-900">
              {evaluation.supervisor?.first_name} {evaluation.supervisor?.last_name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Evaluated On</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(evaluation.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Scores</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <ScoreDisplay label="Attendance" score={evaluation.attendance_score} />
          <ScoreDisplay label="Performance" score={evaluation.performance_score} />
          <ScoreDisplay label="Communication" score={evaluation.communication_score} />
          <ScoreDisplay label="Technical" score={evaluation.technical_score} />
          <ScoreDisplay label="Professionalism" score={evaluation.professionalism_score} />
          <div className={`flex items-center justify-between p-3 rounded border-2 font-semibold text-lg ${getScoreBadge(averageScore)}`}>
            <span>Average Score</span>
            <span>{averageScore > 0 ? averageScore.toFixed(1) : 'N/A'}/5</span>
          </div>
        </div>
      </div>

      {evaluation.comments && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Comments</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{evaluation.comments}</p>
        </div>
      )}
    </div>
  );
};

export default EvaluationDetailPage;
