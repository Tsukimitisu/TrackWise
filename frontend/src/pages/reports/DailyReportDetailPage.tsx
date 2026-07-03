import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';
import ReportReviewActions from '../../components/ReportReviewActions';
import { useAuth } from '../../auth/AuthContext';
import { isStudent } from '../../utils/roleHelper';

interface Report {
  id: number; report_date: string; tasks_done: string; tools_used?: string; problems_encountered?: string;
  learnings?: string; reflection?: string; status: string; submitted_at?: string; review_comment?: string;
  user_program?: { user?: { name?: string; first_name: string; last_name: string }; program?: { name: string } };
}

export default function DailyReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  useEffect(() => { client.get(`/daily-reports/${id}`).then((response) => setReport(response.data)).catch(() => navigate('/app/reports/daily')); }, [id, navigate]);
  if (!report) return <div className="p-10 text-center text-slate-500">Loading report…</div>;
  const student = report.user_program?.user;
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Daily report</p><h1 className="mt-1 text-3xl font-bold text-slate-950">{report.report_date.slice(0, 10)}</h1></div><Link to="/app/reports/daily" className="text-sm font-semibold text-blue-700">Back to reports</Link></div>
      <article className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="grid gap-4 border-b border-slate-200 pb-5 sm:grid-cols-3"><Meta label="Student" value={student?.name || `${student?.first_name || ''} ${student?.last_name || ''}`} /><Meta label="Program" value={report.user_program?.program?.name || '—'} /><Meta label="Status" value={report.status.replace('_', ' ')} /></div>
        <Section title="Tasks completed" body={report.tasks_done} /><Section title="Tools or software used" body={report.tools_used} /><Section title="Skills learned" body={report.learnings} /><Section title="Challenges encountered" body={report.problems_encountered} /><Section title="Reflection or remarks" body={report.reflection} />
        {report.review_comment ? <div className="mt-6 rounded-lg bg-amber-50 p-4"><strong className="text-amber-900">Supervisor feedback</strong><p className="mt-2 whitespace-pre-line text-sm text-amber-900">{report.review_comment}</p></div> : null}
      </article>
      {isStudent(user) && ['draft', 'needs_revision'].includes(report.status) ? <Link to={`/app/reports/daily/${report.id}/edit`} className="mr-3 inline-flex rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold">Edit report</Link> : null}
      <ReportReviewActions resource="daily-reports" id={report.id} status={report.status} onUpdated={setReport} />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 font-semibold capitalize text-slate-900">{value}</p></div>; }
function Section({ title, body }: { title: string; body?: string }) { return <section className="mt-6"><h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">{title}</h2><p className="mt-2 whitespace-pre-line leading-7 text-slate-800">{body || 'No details provided.'}</p></section>; }
