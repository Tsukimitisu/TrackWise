import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import { unwrapList } from '../../features/studentOjt/apiTypes';
import { isStudent } from '../../utils/roleHelper';

interface WeeklyReport {
  id: number;
  week_number: number;
  start_date: string;
  end_date: string;
  summary: string;
  skills_learned?: string;
  challenges?: string;
  reflection?: string;
  status: string;
  review_comment?: string | null;
  user_program?: { user?: { name?: string; first_name: string; last_name: string }; program?: { name: string } };
}

export default function WeeklyReportPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/weekly-reports')
      .then((response) => setReports(unwrapList<WeeklyReport>(response.data)))
      .catch(() => setError('Narrative reports could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => reports.filter((report) => !status || report.status === status), [reports, status]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Weekly Narrative Reports"
        description="Narratives generated from approved daily logs and reviewed through the authenticated approval workflow."
        actions={isStudent(user) ? <Link to="/app/reports/weekly/create" className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">Create weekly report</Link> : undefined}
      />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex max-w-sm items-center gap-3 text-sm font-semibold text-slate-700">
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="flex-1 rounded-lg border border-slate-300 px-3 py-2">
            <option value="">All</option><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="needs_revision">Needs revision</option>
          </select>
        </label>
      </section>

      {error ? <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{error}</div> : null}
      {loading ? <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">Loading reports…</div> : null}
      {!loading && filtered.length ? (
        <section className="grid gap-5 lg:grid-cols-2">
          {filtered.map((report) => (
            <article key={report.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Week {report.week_number}</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">{report.user_program?.program?.name || 'Weekly narrative'}</h2>
                  <p className="mt-1 text-sm text-slate-500">{report.start_date.slice(0, 10)} – {report.end_date.slice(0, 10)}</p>
                </div>
                <Status value={report.status} />
              </div>
              {!isStudent(user) ? <p className="mt-3 text-sm font-semibold text-slate-700">{report.user_program?.user?.name || `${report.user_program?.user?.first_name || ''} ${report.user_program?.user?.last_name || ''}`}</p> : null}
              <p className="mt-4 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-700">{report.summary}</p>
              {report.review_comment ? <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><strong>Reviewer feedback:</strong> {report.review_comment}</div> : null}
              <div className="mt-5 flex justify-end"><Link to={`/app/reports/weekly/${report.id}`} className="text-sm font-semibold text-blue-700 hover:text-blue-900">View report</Link></div>
            </article>
          ))}
        </section>
      ) : null}
      {!loading && !filtered.length ? <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">No weekly narrative reports found.</div> : null}
    </div>
  );
}

function Status({ value }: { value: string }) {
  const tone = value === 'approved' ? 'bg-emerald-100 text-emerald-800' : value === 'rejected' ? 'bg-rose-100 text-rose-800' : value === 'submitted' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800';
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${tone}`}>{value.replace('_', ' ')}</span>;
}
