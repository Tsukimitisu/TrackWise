import { useState } from 'react';
import client from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { hasRole, isStudent } from '../utils/roleHelper';

interface Props {
  resource: 'daily-reports' | 'weekly-reports';
  id: number;
  status: string;
  onUpdated: (report: any) => void;
}

export default function ReportReviewActions({ resource, id, status, onUpdated }: Props) {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const canReview = hasRole(user, ['supervisor', 'coordinator', 'admin']);

  const act = async (action: 'submit' | 'approve' | 'reject' | 'request-revision') => {
    if (['reject', 'request-revision'].includes(action) && !feedback.trim()) {
      setError('Reviewer feedback is required for this action.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await client.post(`/${resource}/${id}/${action}`, { review_comment: feedback.trim() || undefined });
      onUpdated(response.data);
      setFeedback('');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'The report action could not be completed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="print:hidden">
      {isStudent(user) && ['draft', 'needs_revision'].includes(status) ? (
        <button disabled={busy} onClick={() => act('submit')} className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400">
          {status === 'draft' ? 'Submit for review' : 'Resubmit for review'}
        </button>
      ) : null}
      {canReview && status === 'submitted' ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-800">Reviewer feedback</span><textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={4} className="w-full rounded-lg border border-slate-300 px-4 py-3" /></label>
          <div className="mt-4 flex flex-wrap gap-3">
            <button disabled={busy} onClick={() => act('approve')} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">Approve</button>
            <button disabled={busy} onClick={() => act('request-revision')} className="rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700">Request revision</button>
            <button disabled={busy} onClick={() => act('reject')} className="rounded-lg bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-800">Reject</button>
          </div>
        </div>
      ) : null}
      {error ? <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{error}</p> : null}
    </section>
  );
}
