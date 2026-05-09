import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

interface Evaluation {
  id: number;
  attendance_score?: number;
  performance_score?: number;
  communication_score?: number;
  technical_score?: number;
  professionalism_score?: number;
  comments?: string;
  created_at: string;
  userProgram?: { user: { first_name: string; last_name: string }; program: { name: string } };
  supervisor?: { first_name: string; last_name: string };
}

export default function EvaluationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluation().catch(() => {});
  }, [id]);

  const fetchEvaluation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/evaluations/${id}`);
      setEvaluation(response.data);
    } catch {
      navigate('/app/evaluations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this evaluation?')) return;
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/evaluations/${id}`);
    navigate('/app/evaluations');
  };

  const scoreClass = 'bg-gray-100 text-black dark:bg-gray-900 dark:text-white';
  const avg = evaluation
    ? [evaluation.attendance_score, evaluation.performance_score, evaluation.communication_score, evaluation.technical_score, evaluation.professionalism_score]
        .filter((v): v is number => typeof v === 'number')
        .reduce((a, b, _, arr) => a + b / arr.length, 0)
    : 0;

  if (loading) return <div className="py-8 text-center">Loading...</div>;
  if (!evaluation) return <div className="py-8 text-center">Evaluation not found</div>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Evaluation Details</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/app/evaluations/${id}/edit`)} className="rounded bg-black px-4 py-2 text-white hover:bg-gray-900">Edit</button>
          <button onClick={handleDelete} className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-900">Delete</button>
          <button onClick={() => navigate('/app/evaluations')} className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-900">Back</button>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Student</p>
            <p className="text-lg font-semibold">{evaluation.userProgram?.user.first_name} {evaluation.userProgram?.user.last_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Program</p>
            <p className="text-lg font-semibold">{evaluation.userProgram?.program.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Supervisor</p>
            <p className="text-lg font-semibold">{evaluation.supervisor?.first_name} {evaluation.supervisor?.last_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Evaluated On</p>
            <p className="text-lg font-semibold">{new Date(evaluation.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black">
        <h2 className="mb-4 text-xl font-bold">Scores</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            ['Attendance', evaluation.attendance_score],
            ['Performance', evaluation.performance_score],
            ['Communication', evaluation.communication_score],
            ['Technical', evaluation.technical_score],
            ['Professionalism', evaluation.professionalism_score],
            ['Average', avg || undefined],
          ].map(([label, score]) => (
            <div key={String(label)} className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
              <span className="text-sm font-medium">{label}</span>
              <span className={`rounded px-3 py-1 text-sm font-semibold ${scoreClass}`}>{score ? `${Number(score).toFixed(1)}/5` : 'N/A'}</span>
            </div>
          ))}
        </div>
      </div>

      {evaluation.comments ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black">
          <h2 className="mb-4 text-xl font-bold">Comments</h2>
          <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{evaluation.comments}</p>
        </div>
      ) : null}
    </div>
  );
}
