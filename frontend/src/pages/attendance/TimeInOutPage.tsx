import { FormEvent, useEffect, useMemo, useState } from 'react';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';

interface AttendanceLogItem {
  id: number;
  date: string;
  time_in: string | null;
  time_out: string | null;
  total_hours: number;
  status: string;
  approval_status: string;
}

export default function TimeInOutPage() {
  const { user } = useAuth();
  const defaultProgramId = user?.userPrograms?.[0]?.id?.toString() ?? '';
  const [form, setForm] = useState({
    user_program_id: defaultProgramId,
    date: new Date().toISOString().slice(0, 10),
    time_in: new Date().toTimeString().slice(0, 5),
    time_out: '',
    break_minutes: '0',
    remarks: '',
  });
  const [logs, setLogs] = useState<AttendanceLogItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm((current) => ({ ...current, user_program_id: defaultProgramId }));
  }, [defaultProgramId]);

  useEffect(() => {
    const loadLogs = async () => {
      const response = await client.get('/attendance-logs');
      setLogs(response.data.data ?? []);
    };
    void loadLogs();
  }, []);

  const selectedProgramLabel = useMemo(() => {
    const assignment = user?.userPrograms?.find((item) => String(item.id) === form.user_program_id);
    return assignment?.program?.name ?? 'Select your assignment';
  }, [form.user_program_id, user?.userPrograms]);

  const submitClockIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await client.post('/attendance-logs/clock-in', {
        user_program_id: Number(form.user_program_id),
        date: form.date,
        time_in: form.time_in,
        break_minutes: Number(form.break_minutes || 0),
        remarks: form.remarks,
      });
      setMessage('✓ Time in recorded successfully');
      const response = await client.get('/attendance-logs');
      setLogs(response.data.data ?? []);
    } catch {
      setError('Unable to save time in. Please try again.');
    }
  };

  const submitClockOut = async () => {
    setError(null);
    setMessage(null);
    try {
      await client.post('/attendance-logs/clock-out', {
        user_program_id: Number(form.user_program_id),
        date: form.date,
        time_out: form.time_out || new Date().toTimeString().slice(0, 5),
        break_minutes: Number(form.break_minutes || 0),
        remarks: form.remarks,
      });
      setMessage('✓ Time out recorded successfully');
      const response = await client.get('/attendance-logs');
      setLogs(response.data.data ?? []);
    } catch {
      setError('Unable to save time out. Please try again.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Time In / Time Out"
        description="Record your daily attendance and track your rendered hours"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Form Section */}
        <form onSubmit={submitClockIn} className="rounded-3xl border border-blue-100/80 bg-white/85 p-8 shadow-[0_14px_50px_rgba(59,130,246,0.08)] backdrop-blur-sm space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Assigned Program
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              value={form.user_program_id}
              onChange={(event) => setForm((current) => ({ ...current, user_program_id: event.target.value }))}
            >
              <option value="">Select assignment</option>
              {user?.userPrograms?.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.program?.name ?? `Assignment #${assignment.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Date</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Time In</label>
              <input
                type="time"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                value={form.time_in}
                onChange={(event) => setForm((current) => ({ ...current, time_in: event.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Time Out</label>
              <input
                type="time"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                value={form.time_out}
                onChange={(event) => setForm((current) => ({ ...current, time_out: event.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Break (minutes)</label>
              <input
                type="number"
                min="0"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                value={form.break_minutes}
                onChange={(event) => setForm((current) => ({ ...current, break_minutes: event.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Remarks (optional)</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              rows={4}
              value={form.remarks}
              onChange={(event) => setForm((current) => ({ ...current, remarks: event.target.value }))}
              placeholder="Add any notes about your work..."
            />
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 font-medium">{message}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-blue-100/70">
            <Button type="submit" variant="primary" size="md" fullWidth>
              ⏱️ Time In
            </Button>
            <Button
              type="button"
              onClick={submitClockOut}
              variant="secondary"
              size="md"
              fullWidth
            >
              ⏹️ Time Out
            </Button>
          </div>
        </form>

        {/* Recent Logs Section */}
        <div className="rounded-3xl border border-blue-100/80 bg-white/85 p-8 shadow-[0_14px_50px_rgba(59,130,246,0.08)] backdrop-blur-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recent Attendance</h2>
            <p className="text-sm text-slate-600 mt-1">{selectedProgramLabel}</p>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logs.length > 0 ? (
              logs.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl bg-gradient-to-r from-blue-50/80 to-white/90 p-4 ring-1 ring-blue-100/70 transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-slate-900">{log.date}</div>
                      <div className="text-sm text-slate-700 mt-1">
                        {log.time_in ? `${log.time_in}` : 'No check-in'} 
                        {log.time_out ? ` → ${log.time_out}` : ' (not checked out)'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">
                        {Number(log.total_hours).toFixed(1)} <span className="text-xs text-slate-600">hrs</span>
                      </div>
                      <Badge
                        status={
                          log.approval_status === 'approved'
                            ? 'approved'
                            : log.approval_status === 'rejected'
                            ? 'rejected'
                            : 'pending'
                        }
                        variant="subtle"
                        size="sm"
                        className="mt-2"
                      >
                        {log.approval_status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📋</div>
                <p className="text-slate-600">No attendance records yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
