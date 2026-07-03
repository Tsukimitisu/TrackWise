import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import {
  type Assignment,
  type AttendanceLog,
  formatHours,
  unwrapList,
} from '../../features/studentOjt/apiTypes';
import { isStudent } from '../../utils/roleHelper';

export default function AttendancePage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [entries, setEntries] = useState<AttendanceLog[]>([]);
  const [search, setSearch] = useState('');
  const [approval, setApproval] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([client.get('/assignments'), client.get('/attendance-logs')])
      .then(([assignmentResponse, attendanceResponse]) => {
        setAssignments(unwrapList<Assignment>(assignmentResponse.data));
        setEntries(unwrapList<AttendanceLog>(attendanceResponse.data));
      })
      .catch(() => setError('Attendance records could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredEntries = useMemo(() => entries.filter((entry) => {
    const assignment = assignments.find((item) => item.id === entry.user_program_id);
    const student = assignment?.user
      ? `${assignment.user.first_name} ${assignment.user.last_name}`.toLowerCase()
      : '';
    const matchesSearch = !search || entry.date.includes(search) || student.includes(search.toLowerCase());
    return matchesSearch && (!approval || entry.approval_status === approval);
  }), [approval, assignments, entries, search]);

  const approvedHours = entries
    .filter((entry) => entry.approval_status === 'approved')
    .reduce((total, entry) => total + Number(entry.total_hours || 0), 0);
  const requiredHours = assignments.reduce((total, item) => total + Number(item.required_hours || 0), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Attendance and DTR"
        description="Authenticated attendance records. Only approved entries count toward official rendered hours."
        actions={isStudent(user) ? (
          <div className="flex gap-3">
            <Link className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800" to="/app/time-in-out">
              Time in / out
            </Link>
            <Link className="rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-50" to="/app/printables">
              Printable DTR
            </Link>
          </div>
        ) : undefined}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Summary label="Records" value={String(entries.length)} />
        <Summary label="Approved rendered hours" value={formatHours(approvedHours)} />
        <Summary label="Remaining hours" value={formatHours(Math.max(0, requiredHours - approvedHours))} />
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by date or student"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
          />
          <select value={approval} onChange={(event) => setApproval(event.target.value)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm">
            <option value="">All approval states</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {error ? <p className="p-6 text-sm text-rose-700">{error}</p> : null}
        {loading ? <p className="p-10 text-center text-slate-500">Loading attendance…</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  {!isStudent(user) ? <th className="px-4 py-3">Student</th> : null}
                  <th className="px-4 py-3">Time in</th>
                  <th className="px-4 py-3">Time out</th>
                  <th className="px-4 py-3">Break</th>
                  <th className="px-4 py-3">Hours</th>
                  <th className="px-4 py-3">Attendance</th>
                  <th className="px-4 py-3">Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map((entry) => {
                  const assignment = assignments.find((item) => item.id === entry.user_program_id);
                  return (
                    <tr key={entry.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{entry.date.slice(0, 10)}</td>
                      {!isStudent(user) ? <td className="px-4 py-3">{assignment?.user?.name || `${assignment?.user?.first_name || ''} ${assignment?.user?.last_name || ''}`}</td> : null}
                      <td className="px-4 py-3">{entry.time_in || '—'}</td>
                      <td className="px-4 py-3">{entry.time_out || '—'}</td>
                      <td className="px-4 py-3">{entry.break_minutes} min</td>
                      <td className="px-4 py-3 font-semibold">{formatHours(entry.total_hours)}</td>
                      <td className="px-4 py-3 capitalize">{entry.status}</td>
                      <td className="px-4 py-3"><Status value={entry.approval_status} /></td>
                    </tr>
                  );
                })}
                {!filteredEntries.length ? (
                  <tr><td colSpan={isStudent(user) ? 7 : 8} className="px-4 py-10 text-center text-slate-500">No attendance records found.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>;
}

function Status({ value }: { value: string }) {
  const tone = value === 'approved' ? 'bg-emerald-100 text-emerald-800' : value === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800';
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${tone}`}>{value}</span>;
}
