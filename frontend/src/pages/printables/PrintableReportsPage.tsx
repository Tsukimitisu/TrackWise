import { useEffect, useMemo, useState } from 'react';
import client from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import { type Assignment, type AttendanceLog, displayName, formatHours, unwrapList } from '../../features/studentOjt/apiTypes';

interface DailyReport { id: number; user_program_id: number; report_date: string; tasks_done: string; status: string; }

export default function PrintableReportsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [entries, setEntries] = useState<AttendanceLog[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [assignmentId, setAssignmentId] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/assignments'),
      client.get('/attendance-logs', { params: { per_page: 366 } }),
      client.get('/daily-reports'),
    ]).then(([assignmentResponse, attendanceResponse, reportResponse]) => {
      const nextAssignments = unwrapList<Assignment>(assignmentResponse.data);
      setAssignments(nextAssignments);
      setAssignmentId(nextAssignments[0]?.id || 0);
      setEntries(unwrapList<AttendanceLog>(attendanceResponse.data));
      setReports(unwrapList<DailyReport>(reportResponse.data));
    }).finally(() => setLoading(false));
  }, []);

  const assignment = assignments.find((item) => item.id === assignmentId);
  const rows = useMemo(() => entries
    .filter((entry) => entry.user_program_id === assignmentId)
    .sort((a, b) => a.date.localeCompare(b.date)), [assignmentId, entries]);
  const approvedHours = rows.filter((entry) => entry.approval_status === 'approved').reduce((sum, entry) => sum + Number(entry.total_hours || 0), 0);

  if (loading) return <div className="p-10 text-center text-slate-500">Preparing DTR…</div>;

  return (
    <div className="space-y-6 print:space-y-3">
      <div className="print:hidden">
        <PageHeader
          title="Printable DTR"
          description="Official database-backed attendance. Only approved hours count toward the rendered total."
          actions={<button type="button" onClick={() => window.print()} className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">Print / Save PDF</button>}
        />
        <label className="mt-5 block max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="mb-2 block text-sm font-semibold">Student assignment</span>
          <select value={assignmentId} onChange={(event) => setAssignmentId(Number(event.target.value))} className="w-full rounded-lg border border-slate-300 px-4 py-2.5">
            {assignments.map((item) => <option key={item.id} value={item.id}>{displayName(item.user)} · {item.program?.name}</option>)}
          </select>
        </label>
      </div>

      <main className="rounded-xl border border-slate-300 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Daily Time Record</p><h1 className="mt-2 text-2xl font-bold text-slate-950">On-the-Job Training Hours</h1><p className="mt-1 text-sm text-slate-600">{assignment?.user?.organization?.name || 'School'} · {assignment?.user?.course || assignment?.program?.name || 'Program'}</p></header>
        <section className="mt-8 grid gap-3 text-sm sm:grid-cols-2 print:grid-cols-2">
          <Info label="Student" value={displayName(assignment?.user)} />
          <Info label="Student no." value={assignment?.user?.student_number || 'Not set'} />
          <Info label="OJT company" value={assignment?.program?.organization?.name || 'Not set'} />
          <Info label="Supervisor" value={displayName(assignment?.supervisor)} />
          <Info label="Training dates" value={`${assignment?.start_date?.slice(0, 10) || 'Start'} to ${assignment?.end_date?.slice(0, 10) || 'End'}`} />
          <Info label="Required hours" value={formatHours(assignment?.required_hours)} />
        </section>

        <section className="mt-6 overflow-x-auto">
          <table className="min-w-full border border-slate-400 text-left text-xs print:text-[10px]">
            <thead className="bg-slate-100"><tr><th className={cell}>Date</th><th className={cell}>Time In</th><th className={cell}>Time Out</th><th className={cell}>Break</th><th className={cell}>Hours</th><th className={cell}>Tasks / activities</th><th className={cell}>Approval</th></tr></thead>
            <tbody>
              {rows.map((entry) => {
                const report = reports.find((item) => item.user_program_id === assignmentId && item.report_date.slice(0, 10) === entry.date.slice(0, 10));
                return <tr key={entry.id}><td className={cell}>{entry.date.slice(0, 10)}</td><td className={cell}>{entry.time_in || '—'}</td><td className={cell}>{entry.time_out || '—'}</td><td className={cell}>{entry.break_minutes} min</td><td className={cell}>{formatHours(entry.total_hours)}</td><td className={cell}>{report?.tasks_done || entry.remarks || '—'}</td><td className={`${cell} capitalize`}>{entry.approval_status}</td></tr>;
              })}
              {!rows.length ? <tr><td className={`${cell} py-8 text-center text-slate-500`} colSpan={7}>No attendance records.</td></tr> : null}
            </tbody>
            <tfoot className="bg-slate-100"><tr><td className={cell} colSpan={4}><strong>Approved rendered hours</strong></td><td className={cell}><strong>{formatHours(approvedHours)}</strong></td><td className={cell} colSpan={2}><strong>Remaining: {formatHours(Math.max(0, Number(assignment?.required_hours || 0) - approvedHours))}</strong></td></tr></tfoot>
          </table>
        </section>

        <section className="mt-12 grid grid-cols-3 gap-10 text-center text-sm"><Signature label="Student signature" value={displayName(assignment?.user)} /><Signature label="Company supervisor" value={displayName(assignment?.supervisor)} /><Signature label="School coordinator" value={displayName(assignment?.coordinator)} /></section>
      </main>
    </div>
  );
}

const cell = 'border border-slate-400 px-2 py-2';
function Info({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[8rem_1fr] border-b border-slate-300 py-2"><span className="font-semibold text-slate-600">{label}</span><span className="font-medium text-slate-950">{value}</span></div>; }
function Signature({ label, value }: { label: string; value: string }) { return <div><div className="min-h-8 font-semibold">{value}</div><div className="mt-2 border-t border-slate-700 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-600">{label}</div></div>; }
