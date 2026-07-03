import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { type Assignment, type AttendanceLog, type DocumentationRecord, displayName, formatHours, unwrapList } from '../../features/studentOjt/apiTypes';

interface DailyReport { id: number; user_program_id: number; report_date: string; tasks_done: string; status: string; }
interface Analytics {
  assignments?: { total: number; active: number; completed: number };
  reports?: { total: number; approved: number; submitted: number; needs_revision: number };
  hours?: { required: number; completed: number; remaining: number };
  metrics?: { approval_rate: number; completion_rate: number };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [documents, setDocuments] = useState<DocumentationRecord[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      client.get('/assignments'),
      client.get('/attendance-logs'),
      client.get('/daily-reports'),
      client.get('/documentation-files'),
      client.get('/analytics/dashboard'),
    ]).then(([assignmentResult, attendanceResult, reportResult, documentResult, analyticsResult]) => {
      if (assignmentResult.status === 'fulfilled') setAssignments(unwrapList<Assignment>(assignmentResult.value.data));
      if (attendanceResult.status === 'fulfilled') setAttendance(unwrapList<AttendanceLog>(attendanceResult.value.data));
      if (reportResult.status === 'fulfilled') setReports(unwrapList<DailyReport>(reportResult.value.data));
      if (documentResult.status === 'fulfilled') setDocuments(unwrapList<DocumentationRecord>(documentResult.value.data));
      if (analyticsResult.status === 'fulfilled') setAnalytics(analyticsResult.value.data);
    }).finally(() => setLoading(false));
  }, []);

  const role = (user?.role as any)?.name || user?.role || '';
  const isStudent = role === 'Student';
  const pending = reports.filter((report) => report.status === 'submitted').length;
  const approved = reports.filter((report) => report.status === 'approved').length;
  const approvedHours = attendance.filter((entry) => entry.approval_status === 'approved').reduce((sum, entry) => sum + Number(entry.total_hours || 0), 0);
  const requiredHours = assignments.reduce((sum, assignment) => sum + Number(assignment.required_hours || 0), 0);
  const completion = requiredHours ? Math.min(100, approvedHours / requiredHours * 100) : 0;
  const latestAttendance = useMemo(() => [...attendance].sort((a, b) => b.date.localeCompare(a.date))[0], [attendance]);
  const latestReport = useMemo(() => [...reports].sort((a, b) => b.report_date.localeCompare(a.report_date))[0], [reports]);

  if (loading) return <div className="p-10 text-center text-slate-500">Loading your dashboard…</div>;

  return (
    <div className="space-y-8">
      <header className="rounded-2xl bg-slate-950 p-7 text-white shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">{role} dashboard</p>
        <h1 className="mt-2 text-3xl font-bold">Welcome, {user?.first_name}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">Live OJT records from the authenticated TrackWise database.</p>
      </header>

      {isStudent ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card label="Required hours" value={formatHours(requiredHours)} />
            <Card label="Approved rendered hours" value={formatHours(approvedHours)} />
            <Card label="Remaining hours" value={formatHours(Math.max(0, requiredHours - approvedHours))} />
            <Card label="Completion" value={`${completion.toFixed(1)}%`} />
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex justify-between text-sm"><strong>OJT progress</strong><span>{completion.toFixed(1)}%</span></div>
            <div className="mt-3 h-3 rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${completion}%` }} /></div>
          </section>
          <section className="grid gap-5 lg:grid-cols-2">
            <Panel title="Latest attendance" link="/app/attendance">
              {latestAttendance ? <><strong>{latestAttendance.date.slice(0, 10)}</strong><p className="mt-2 text-sm text-slate-600">{latestAttendance.time_in || '—'} – {latestAttendance.time_out || '—'} · {formatHours(latestAttendance.total_hours)}</p><p className="mt-2 text-xs font-semibold uppercase text-slate-500">{latestAttendance.approval_status}</p></> : <Empty text="No attendance recorded." />}
            </Panel>
            <Panel title="Latest daily log" link="/app/reports/daily">
              {latestReport ? <><strong>{latestReport.report_date.slice(0, 10)}</strong><p className="mt-2 line-clamp-3 text-sm text-slate-600">{latestReport.tasks_done}</p><p className="mt-2 text-xs font-semibold uppercase text-slate-500">{latestReport.status}</p></> : <Empty text="No daily logs submitted." />}
            </Panel>
          </section>
          <section className="grid gap-4 sm:grid-cols-3">
            <Card label="Pending reports" value={String(pending)} />
            <Card label="Approved reports" value={String(approved)} />
            <Card label="Documentation photos" value={String(documents.length)} />
          </section>
        </>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card label={role === 'Supervisor' ? 'Assigned students' : 'Scoped OJT students'} value={String(analytics.assignments?.total ?? assignments.length)} />
            <Card label="Active OJT assignments" value={String(analytics.assignments?.active ?? 0)} />
            <Card label="Pending report reviews" value={String(analytics.reports?.submitted ?? pending)} />
            <Card label="Completed assignments" value={String(analytics.assignments?.completed ?? 0)} />
          </section>
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5"><h2 className="text-lg font-bold text-slate-900">Students in your scope</h2></div>
            <div className="divide-y divide-slate-100">
              {assignments.slice(0, 8).map((assignment) => {
                const percent = Number(assignment.required_hours) ? Number(assignment.completed_hours) / Number(assignment.required_hours) * 100 : 0;
                return <div key={assignment.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><strong>{displayName(assignment.user)}</strong><p className="text-sm text-slate-500">{assignment.program?.name}</p></div><div className="min-w-48"><div className="flex justify-between text-xs text-slate-500"><span>{formatHours(assignment.completed_hours)}</span><span>{Math.min(100, percent).toFixed(0)}%</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, percent)}%` }} /></div></div></div>;
              })}
              {!assignments.length ? <Empty text="No students are assigned to your scope." /> : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-950">{value}</p></div>; }
function Panel({ title, link, children }: { title: string; link: string; children: React.ReactNode }) { return <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-4 flex justify-between"><h2 className="font-bold">{title}</h2><Link to={link} className="text-sm font-semibold text-blue-700">View all</Link></div>{children}</section>; }
function Empty({ text }: { text: string }) { return <p className="p-5 text-center text-sm text-slate-500">{text}</p>; }
