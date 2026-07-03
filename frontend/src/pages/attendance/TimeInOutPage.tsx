import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import { type Assignment, type AttendanceLog, formatHours, unwrapList } from '../../features/studentOjt/apiTypes';

export default function TimeInOutPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [assignmentId, setAssignmentId] = useState(0);
  const [breakMinutes, setBreakMinutes] = useState(60);
  const [remarks, setRemarks] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    const [assignmentResponse, logResponse] = await Promise.all([
      client.get('/assignments'),
      client.get('/attendance-logs'),
    ]);
    const nextAssignments = unwrapList<Assignment>(assignmentResponse.data);
    setAssignments(nextAssignments);
    setAssignmentId((current) => current || nextAssignments[0]?.id || 0);
    setLogs(unwrapList<AttendanceLog>(logResponse.data));
  };

  useEffect(() => {
    load().catch(() => setMessage({ tone: 'error', text: 'Attendance information could not be loaded.' }));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayLog = useMemo(() => logs.find((log) =>
    log.user_program_id === assignmentId && log.date.slice(0, 10) === today
  ), [assignmentId, logs, today]);

  const perform = async (action: 'clock-in' | 'clock-out') => {
    if (!assignmentId) return;
    setBusy(true);
    setMessage(null);
    try {
      await client.post(`/attendance-logs/${action}`, {
        user_program_id: assignmentId,
        break_minutes: breakMinutes,
        remarks: remarks.trim() || undefined,
      });
      await load();
      setMessage({ tone: 'success', text: action === 'clock-in' ? 'Time in recorded.' : 'Time out recorded and hours calculated.' });
    } catch (error: any) {
      setMessage({ tone: 'error', text: error.response?.data?.message || 'The attendance action could not be completed.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Time In / Time Out"
        description="The server records the official current time. Attendance approval is controlled by your assigned reviewer."
        actions={<Link className="rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-50" to="/app/attendance">View DTR</Link>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-800">OJT assignment</span>
            <select value={assignmentId} onChange={(event) => setAssignmentId(Number(event.target.value))} className="w-full rounded-lg border border-slate-300 px-4 py-3">
              {assignments.map((assignment) => <option key={assignment.id} value={assignment.id}>{assignment.program?.name || `Assignment ${assignment.id}`}</option>)}
            </select>
          </label>

          <div className="mt-6 rounded-xl bg-slate-950 p-6 text-white">
            <p className="text-sm text-slate-300">{new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
            <p className="mt-2 text-4xl font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="mt-4 text-sm text-slate-300">
              Today: {todayLog?.time_in || 'Not timed in'} → {todayLog?.time_out || 'Not timed out'}
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-800">Break minutes</span>
              <input type="number" min="0" max="240" value={breakMinutes} onChange={(event) => setBreakMinutes(Number(event.target.value))} className="w-full rounded-lg border border-slate-300 px-4 py-3" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-800">Remarks</span>
              <textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} rows={3} className="w-full rounded-lg border border-slate-300 px-4 py-3" placeholder="Optional attendance note" />
            </label>
          </div>

          {message ? <div role="status" className={`mt-5 rounded-lg px-4 py-3 text-sm font-semibold ${message.tone === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>{message.text}</div> : null}

          <div className="mt-6 flex gap-3">
            <button type="button" disabled={busy || !assignmentId || Boolean(todayLog?.time_in)} onClick={() => perform('clock-in')} className="flex-1 rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300">Time in</button>
            <button type="button" disabled={busy || !todayLog?.time_in || Boolean(todayLog?.time_out)} onClick={() => perform('clock-out')} className="flex-1 rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300">Time out</button>
          </div>
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Recent attendance</h2>
          <div className="mt-4 space-y-3">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex justify-between gap-3"><strong>{log.date.slice(0, 10)}</strong><span>{formatHours(log.total_hours)}</span></div>
                <p className="mt-1 text-sm text-slate-600">{log.time_in || '—'} – {log.time_out || '—'}</p>
                <p className="mt-2 text-xs font-semibold capitalize text-slate-500">{log.approval_status}</p>
              </div>
            ))}
            {!logs.length ? <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No attendance records yet.</p> : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
