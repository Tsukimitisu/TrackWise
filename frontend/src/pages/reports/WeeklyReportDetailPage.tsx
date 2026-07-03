import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';
import ReportReviewActions from '../../components/ReportReviewActions';
import { useAuth } from '../../auth/AuthContext';
import { isStudent } from '../../utils/roleHelper';

interface Report {
  id: number; week_number: number; start_date: string; end_date: string; summary: string; skills_learned?: string;
  challenges?: string; reflection?: string; status: string; review_comment?: string;
  user_program?: { user?: { name?: string; first_name: string; last_name: string }; program?: { name: string } };
}

export default function WeeklyReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  useEffect(() => { client.get(`/weekly-reports/${id}`).then((response) => setReport(response.data)).catch(() => navigate('/app/reports/weekly')); }, [id, navigate]);
  if (!report) return <div className="p-10 text-center text-slate-500">Loading report…</div>;
  const student = report.user_program?.user;
  return (
    <div className="mx-auto max-w-4xl space-y-6 print:space-y-3">
      <div className="flex items-start justify-between gap-4 print:hidden"><div><p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Weekly narrative</p><h1 className="mt-1 text-3xl font-bold text-slate-950">Week {report.week_number}</h1></div><div className="flex gap-3"><button onClick={() => window.print()} className="text-sm font-semibold text-blue-700">Print / PDF</button><Link to="/app/reports/weekly" className="text-sm font-semibold text-blue-700">Back</Link></div></div>
      <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm print:border-0 print:p-0 print:shadow-none">
        <header className="border-b border-slate-200 pb-6 text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">TrackWise OJT</p><h1 className="mt-2 text-2xl font-bold">Weekly Narrative Report</h1><p className="mt-2 text-sm text-slate-600">{report.start_date.slice(0, 10)} to {report.end_date.slice(0, 10)}</p></header>
        <div className="mt-6 grid gap-4 sm:grid-cols-3"><Meta label="Student" value={student?.name || `${student?.first_name || ''} ${student?.last_name || ''}`} /><Meta label="Program" value={report.user_program?.program?.name || '—'} /><Meta label="Approval status" value={report.status.replace('_', ' ')} /></div>
        <Section title="Activities and accomplishments" body={report.summary} /><Section title="Skills learned" body={report.skills_learned} /><Section title="Challenges encountered" body={report.challenges} /><Section title="Student reflection" body={report.reflection} />
        {report.review_comment ? <div className="mt-6 rounded-lg border border-slate-200 p-4"><strong>Supervisor feedback</strong><p className="mt-2 whitespace-pre-line text-sm">{report.review_comment}</p></div> : null}
      </article>
      {isStudent(user) && ['draft', 'needs_revision'].includes(report.status) ? <Link to={`/app/reports/weekly/${report.id}/edit`} className="mr-3 inline-flex rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold print:hidden">Edit report</Link> : null}
      <ReportReviewActions resource="weekly-reports" id={report.id} status={report.status} onUpdated={setReport} />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 font-semibold capitalize">{value}</p></div>; }
function Section({ title, body }: { title: string; body?: string }) { return <section className="mt-7"><h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">{title}</h2><p className="mt-2 whitespace-pre-line leading-7 text-slate-800">{body || 'No details provided.'}</p></section>; }
