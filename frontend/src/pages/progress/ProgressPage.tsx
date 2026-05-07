import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

type RoleName = 'Super Admin' | 'Organization Admin' | 'Coordinator' | 'Supervisor' | 'Student' | 'Viewer';

interface AssignmentItem {
  id: number;
  user_id: number;
  supervisor_id?: number | null;
  coordinator_id?: number | null;
  required_hours: number;
  completed_hours: number;
  status: string;
  user?: {
    first_name: string;
    last_name: string;
  };
  program?: {
    name: string;
  };
}

interface AttendanceLogItem {
  id: number;
  user_program_id?: number;
  total_hours: number;
  approval_status: string;
  time_out?: string | null;
  userProgram?: {
    id: number;
  };
}

interface ProgressRow {
  assignment: AssignmentItem;
  approvedHours: number;
  requiredHours: number;
  remainingHours: number;
  progressPct: number;
}

function normalizeList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && 'data' in payload && Array.isArray((payload as { data: unknown }).data)) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

export default function ProgressPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [logs, setLogs] = useState<AttendanceLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [assignmentRes, logRes] = await Promise.all([
          client.get('/assignments'),
          client.get('/attendance-logs'),
        ]);

        setAssignments(normalizeList<AssignmentItem>(assignmentRes.data));
        setLogs(normalizeList<AttendanceLogItem>(logRes.data));
      } catch (error) {
        console.error('Error loading progress data:', error);
        setAssignments([]);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const rows = useMemo<ProgressRow[]>(() => {
    const role = (user?.role?.name as RoleName | undefined) ?? 'Viewer';
    const userId = user?.id ?? 0;

    const scopedAssignments = assignments.filter((assignment) => {
      if (role === 'Student') return assignment.user_id === userId;
      if (role === 'Supervisor') return assignment.supervisor_id === userId;
      if (role === 'Coordinator') return assignment.coordinator_id === userId;
      return true;
    });

    const approvedHoursByAssignment = logs.reduce<Map<number, number>>((acc, log) => {
      const assignmentId = log.user_program_id ?? log.userProgram?.id;
      if (!assignmentId) return acc;
      if (log.approval_status !== 'approved') return acc;
      const existing = acc.get(assignmentId) ?? 0;
      acc.set(assignmentId, existing + Number(log.total_hours || 0));
      return acc;
    }, new Map<number, number>());

    return scopedAssignments.map((assignment) => {
      const requiredHours = Number(assignment.required_hours || 0);
      const approvedHours = Math.max(
        Number(assignment.completed_hours || 0),
        approvedHoursByAssignment.get(assignment.id) ?? 0,
      );
      const remainingHours = Math.max(0, requiredHours - approvedHours);
      const progressPct = requiredHours > 0 ? Math.min(100, (approvedHours / requiredHours) * 100) : 0;

      return {
        assignment,
        approvedHours,
        requiredHours,
        remainingHours,
        progressPct,
      };
    });
  }, [assignments, logs, user?.id, user?.role?.name]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) => {
      const fullName = `${row.assignment.user?.first_name ?? ''} ${row.assignment.user?.last_name ?? ''}`.toLowerCase();
      const program = (row.assignment.program?.name ?? '').toLowerCase();
      return fullName.includes(query) || program.includes(query);
    });
  }, [rows, search]);

  const totals = useMemo(() => {
    const required = filteredRows.reduce((sum, row) => sum + row.requiredHours, 0);
    const completed = filteredRows.reduce((sum, row) => sum + row.approvedHours, 0);
    const averagePct = filteredRows.length > 0
      ? filteredRows.reduce((sum, row) => sum + row.progressPct, 0) / filteredRows.length
      : 0;

    return { required, completed, averagePct };
  }, [filteredRows]);

  if (loading) {
    return <div className="py-10 text-center text-slate-600">Loading progress data...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Progress Tracking</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink-900">Hour Completion Monitor</h1>
        <p className="mt-3 max-w-3xl text-slate-600">Track required hours, approved completed hours, and completion percentage per trainee assignment.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-soft">
          <p className="text-sm text-slate-500">Required Hours</p>
          <p className="mt-2 text-2xl font-black text-ink-900">{totals.required.toFixed(2)}</p>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-soft">
          <p className="text-sm text-slate-500">Completed (Approved)</p>
          <p className="mt-2 text-2xl font-black text-emerald-700">{totals.completed.toFixed(2)}</p>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-soft">
          <p className="text-sm text-slate-500">Average Completion</p>
          <p className="mt-2 text-2xl font-black text-indigo-700">{totals.averagePct.toFixed(1)}%</p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink-900">Assignments</h2>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search trainee or program"
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-ink-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50/80 text-slate-500">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Trainee</th>
                <th className="px-5 py-3 text-left font-medium">Program</th>
                <th className="px-5 py-3 text-right font-medium">Required</th>
                <th className="px-5 py-3 text-right font-medium">Completed</th>
                <th className="px-5 py-3 text-right font-medium">Remaining</th>
                <th className="px-5 py-3 text-right font-medium">Progress</th>
                <th className="px-5 py-3 text-center font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRows.map((row) => (
                <tr key={row.assignment.id}>
                  <td className="px-5 py-4 font-medium text-ink-900">
                    {(row.assignment.user?.first_name || row.assignment.user?.last_name)
                      ? `${row.assignment.user?.first_name ?? ''} ${row.assignment.user?.last_name ?? ''}`.trim()
                      : `Assignment #${row.assignment.id}`}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{row.assignment.program?.name ?? 'N/A'}</td>
                  <td className="px-5 py-4 text-right">{row.requiredHours.toFixed(2)}</td>
                  <td className="px-5 py-4 text-right text-emerald-700">{row.approvedHours.toFixed(2)}</td>
                  <td className="px-5 py-4 text-right text-amber-700">{row.remainingHours.toFixed(2)}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-semibold text-indigo-700">{row.progressPct.toFixed(1)}%</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => navigate(`/app/progress/${row.assignment.id}`)}
                      className="rounded-xl bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-500" colSpan={7}>
                    No assignments found for the selected scope.
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
