import { useEffect, useState } from 'react';
import client from '../../api/client';
import ModulePage from '../ModulePage';

interface AttendanceLogItem {
  id: number;
  date: string;
  time_in: string | null;
  time_out: string | null;
  total_hours: number;
  status: string;
  approval_status: string;
  userProgram?: {
    id: number;
    program?: { name: string };
  };
}

export default function AttendancePage() {
  const [logs, setLogs] = useState<AttendanceLogItem[]>([]);

  useEffect(() => {
    const loadLogs = async () => {
      const response = await client.get('/attendance-logs');
      setLogs(response.data.data ?? []);
    };

    void loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <ModulePage title="Attendance Monitoring" description="Review DTR entries, rendered hours, and approval status." />

      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-soft backdrop-blur-xl">
        <div className="border-b border-slate-200/70 px-6 py-4">
          <h2 className="text-lg font-semibold text-ink-900">Recent Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50/80 text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-left font-medium">Program</th>
                <th className="px-6 py-3 text-left font-medium">Time In</th>
                <th className="px-6 py-3 text-left font-medium">Time Out</th>
                <th className="px-6 py-3 text-left font-medium">Hours</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4">{log.date}</td>
                  <td className="px-6 py-4">{log.userProgram?.program?.name ?? 'N/A'}</td>
                  <td className="px-6 py-4">{log.time_in ?? '—'}</td>
                  <td className="px-6 py-4">{log.time_out ?? '—'}</td>
                  <td className="px-6 py-4">{Number(log.total_hours).toFixed(2)}</td>
                  <td className="px-6 py-4">{log.status}</td>
                  <td className="px-6 py-4">{log.approval_status}</td>
                </tr>
              ))}
              {logs.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-center text-slate-500" colSpan={7}>
                    No attendance records yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
