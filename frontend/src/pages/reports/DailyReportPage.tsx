import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import { downloadDailyReportsCSV } from '../../utils/exportHelper';

interface DailyReport {
  id: number;
  report_date: string;
  tasks_done: string;
  tools_used?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'needs_revision';
  review_comment?: string;
  user_program?: {
    user: { first_name: string; last_name: string };
    program: { name: string };
  };
}

const statuses = ['', 'draft', 'submitted', 'approved', 'rejected', 'needs_revision'] as const;

export default function DailyReportPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStudent = user?.role.name === 'Student';

  useEffect(() => {
    let active = true;
    const fetchReports = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = {};
        if (filter) params.status = filter;
        if (search.trim()) params.search = search.trim();
        const response = await client.get('/daily-reports', { params });
        const payload = response.data.data || response.data;
        if (active) setReports(Array.isArray(payload) ? payload : []);
      } catch {
        if (active) setReports([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchReports();
    return () => { active = false; };
  }, [filter, search]);

  const counts = useMemo(() => ({
    total: reports.length,
    pending: reports.filter((report) => report.status === 'submitted').length,
    approved: reports.filter((report) => report.status === 'approved').length,
  }), [reports]);

  const handleDelete = async (report: DailyReport) => {
    if (!window.confirm(`Delete the daily log for ${report.report_date}? This cannot be undone.`)) return;
    try {
      await client.delete(`/daily-reports/${report.id}`);
      setReports((current) => current.filter((item) => item.id !== report.id));
    } catch {
      window.alert('The daily log could not be deleted. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isStudent ? 'Work journal' : 'Supervisor review'}
        title={isStudent ? 'Daily Logs' : 'Submitted Reports'}
        description={isStudent
          ? 'Document your completed tasks, tools used, challenges, and daily learnings.'
          : 'Review submitted work logs, supporting details, and approval status.'}
        actions={
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void downloadDailyReportsCSV({ status: filter, search }).catch(() => window.alert('Export failed.'))}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Export CSV
            </button>
            {isStudent ? (
              <button type="button" onClick={() => navigate('/app/reports/daily/create')} className="rounded-xl bg-[#10233f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#18345b]">
                + New daily log
              </button>
            ) : null}
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Summary label="Visible logs" value={counts.total} tone="slate" />
        <Summary label="Pending review" value={counts.pending} tone="amber" />
        <Summary label="Approved" value={counts.approved} tone="emerald" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-md">
            <span className="sr-only">Search daily logs</span>
            <span className="pointer-events-none absolute left-4 top-3 text-slate-400">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student, program, or task"
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {statuses.map((status) => (
              <button
                type="button"
                key={status || 'all'}
                onClick={() => setFilter(status)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold capitalize transition ${
                  filter === status ? 'bg-[#10233f] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status ? status.replace('_', ' ') : 'All'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-medium text-slate-500">Loading daily logs…</div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <EmptyState
            title={search || filter ? 'No matching daily logs' : 'No daily logs yet'}
            description={search || filter ? 'Adjust the search or status filter.' : 'Create a daily log after completing your attendance and assigned tasks.'}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-bold">Date</th>
                  {!isStudent ? <th className="px-6 py-4 font-bold">Student</th> : null}
                  <th className="px-6 py-4 font-bold">Tasks accomplished</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-900">{formatReportDate(report.report_date)}</td>
                    {!isStudent ? (
                      <td className="whitespace-nowrap px-6 py-4 text-slate-700">
                        {report.user_program?.user ? `${report.user_program.user.first_name} ${report.user_program.user.last_name}` : 'Student record'}
                      </td>
                    ) : null}
                    <td className="max-w-xl px-6 py-4">
                      <p className="line-clamp-2 font-medium text-slate-800">{report.tasks_done}</p>
                      {report.tools_used ? <p className="mt-1 line-clamp-1 text-xs text-slate-500">Tools: {report.tools_used}</p> : null}
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={report.status === 'approved' ? 'success' : report.status === 'rejected' ? 'danger' : report.status === 'needs_revision' ? 'warning' : 'info'}>
                        {report.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => navigate(`/app/reports/daily/${report.id}`)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">View</button>
                        {isStudent && report.status === 'draft' ? (
                          <>
                            <button type="button" onClick={() => navigate(`/app/reports/daily/${report.id}/edit`)} className="rounded-lg bg-[#10233f] px-3 py-2 text-xs font-bold text-white hover:bg-[#18345b]">Edit</button>
                            <button type="button" onClick={() => void handleDelete(report)} className="rounded-lg px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50">Delete</button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Summary({ label, value, tone }: { label: string; value: number; tone: 'slate' | 'amber' | 'emerald' }) {
  const colors = {
    slate: 'bg-slate-100 text-slate-700',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <span className={`grid h-9 min-w-9 place-items-center rounded-xl px-2 text-sm font-bold ${colors[tone]}`}>{value}</span>
      </div>
    </div>
  );
}

function formatReportDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}
