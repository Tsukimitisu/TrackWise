import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';

interface WeeklyReport {
  id: number;
  user_program_id: number;
  week_number: number;
  start_date: string;
  end_date: string;
  summary: string;
  skills_learned?: string;
  challenges?: string;
  reflection?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'needs_revision';
  submitted_at?: string;
  reviewed_by?: number;
  review_comment?: string;
  userProgram?: {
    user: { id: number; first_name: string; last_name: string };
    program: { name: string };
  };
  files?: any[];
}

const WeeklyReportDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/weekly-reports/${id}`);
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      navigate('/app/reports/weekly');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/weekly-reports/${id}/submit`);
      setReport(response.data);
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  const handleApprove = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/weekly-reports/${id}/approve`, {
        review_comment: reviewComment,
      });
      setReport(response.data);
      setReviewComment('');
      setReviewing(false);
    } catch (error) {
      console.error('Error approving report:', error);
    }
  };

  const handleReject = async () => {
    if (!reviewComment.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/weekly-reports/${id}/reject`, {
        review_comment: reviewComment,
      });
      setReport(response.data);
      setReviewComment('');
      setReviewing(false);
    } catch (error) {
      console.error('Error rejecting report:', error);
    }
  };

  const handleRequestRevision = async () => {
    if (!reviewComment.trim()) {
      alert('Please provide feedback for revision');
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/weekly-reports/${id}/request-revision`, {
        review_comment: reviewComment,
      });
      setReport(response.data);
      setReviewComment('');
      setReviewing(false);
    } catch (error) {
      console.error('Error requesting revision:', error);
    }
  };

  if (loading) return <div className="py-8 text-center text-slate-500 dark:text-slate-400">Loading...</div>;
  if (!report) return <div className="py-8 text-center text-rose-600 dark:text-rose-300">Report not found</div>;

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
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Week {report.week_number} Narrative Report</h1>
          <button
            onClick={() => navigate('/app/reports/weekly')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Student</p>
              <p className="text-lg font-semibold">
                {report.userProgram?.user.first_name} {report.userProgram?.user.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Program</p>
              <p className="text-lg font-semibold">{report.userProgram?.program.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Period</p>
              <p className="text-lg font-semibold">
                {report.start_date} to {report.end_date}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusBadgeColor(report.status)}`}>
                {report.status}
              </span>
            </div>
            {report.submitted_at && (
              <div>
                <p className="text-sm text-gray-500">Submitted At</p>
                <p className="text-lg font-semibold">{new Date(report.submitted_at).toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-xl font-semibold mb-4">Report Details</h3>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Summary of Activities</p>
              <p className="text-gray-900 whitespace-pre-wrap">{report.summary}</p>
            </div>

            {report.skills_learned && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Skills Learned</p>
                <p className="text-gray-900 whitespace-pre-wrap">{report.skills_learned}</p>
              </div>
            )}

            {report.challenges && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Challenges Encountered</p>
                <p className="text-gray-900 whitespace-pre-wrap">{report.challenges}</p>
              </div>
            )}

            {report.reflection && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Reflection & Insights</p>
                <p className="text-gray-900 whitespace-pre-wrap">{report.reflection}</p>
              </div>
            )}
          </div>

          {report.review_comment && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Review Comment</h3>
              <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded">{report.review_comment}</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 justify-center flex-wrap">
          {report.status === 'draft' && (
            <>
              <button
                onClick={() => navigate(`/app/reports/weekly/${id}/edit`)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Edit
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit Report
              </button>
            </>
          )}

          {report.status === 'submitted' && ['supervisor', 'coordinator', 'admin'].includes((user?.role as any)?.name || user?.role) && (
            <>
              <button
                onClick={() => setReviewing(!reviewing)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {reviewing ? 'Cancel' : 'Review'}
              </button>
            </>
          )}

          {report.status === 'needs_revision' && (
            <>
              <button
                onClick={() => navigate(`/app/reports/weekly/${id}/edit`)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Edit for Revision
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Resubmit
              </button>
            </>
          )}
        </div>

        {reviewing && report.status === 'submitted' && ['supervisor', 'coordinator', 'admin'].includes((user?.role as any)?.name || user?.role) && (
          <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold mb-4">Review Report</h3>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Add your review comment (optional for approve, required for reject/revision)..."
              className="w-full px-4 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={handleRequestRevision}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Request Revision
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
  );
};

export default WeeklyReportDetailPage;
