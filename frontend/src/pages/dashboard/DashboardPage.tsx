import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import {
  calculateCompletedHours,
  formatHours,
  loadOjtData,
  type OjtData,
} from '../../features/studentOjt/ojtStorage';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<OjtData>(() => loadOjtData());

  useEffect(() => {
    const refresh = () => setData(loadOjtData());
    window.addEventListener('trackwise_student_ojt_updated', refresh);
    return () => window.removeEventListener('trackwise_student_ojt_updated', refresh);
  }, []);

  const completedHours = useMemo(() => calculateCompletedHours(data.dtrEntries), [data.dtrEntries]);
  const requiredHours = data.profile.requiredHours || 1;
  const remainingHours = Math.max(requiredHours - completedHours, 0);
  const progress = Math.min((completedHours / requiredHours) * 100, 100);
  const latestEntries = [...data.dtrEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title={`Welcome, ${user?.first_name ?? data.profile.studentName}`}
        description="Track your OJT hours, DTR entries, narrative reports, and documentation from one student workspace."
        actions={
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="primary" size="md">
              <Link to="/app/time-in-out">Add DTR entry</Link>
            </Button>
            <Button asChild variant="secondary" size="md">
              <Link to="/app/ojt-setup">Edit setup</Link>
            </Button>
          </div>
        }
      />

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Required hours" value={formatHours(requiredHours)} helper="Target" />
        <Metric label="Completed hours" value={formatHours(completedHours)} helper="From your DTR" />
        <Metric label="Remaining hours" value={formatHours(remainingHours)} helper="Needed to finish" />
        <Metric label="Progress" value={`${Math.round(progress)}%`} helper="Completion rate" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Hours Progress</h2>
              <p className="text-sm text-slate-600">{formatHours(completedHours)} of {formatHours(requiredHours)} hours rendered</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{Math.round(progress)}%</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Detail label="School" value={data.profile.school || 'Not set'} />
            <Detail label="Course" value={data.profile.course || 'Not set'} />
            <Detail label="OJT site" value={data.profile.ojtSite || 'Not set'} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Quick Tools</h2>
          <div className="mt-4 grid gap-3">
            <QuickLink to="/app/attendance" label="Review DTR table" />
            <QuickLink to="/app/printables" label="Print DTR with signature" />
            <QuickLink to="/app/reports/weekly" label="Make narrative report" />
            <QuickLink to="/app/documents" label="Manage documentation" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recent DTR Entries</h2>
          <Link to="/app/attendance" className="text-sm font-semibold text-blue-700">View all</Link>
        </div>
        {latestEntries.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Date</th>
                  <th className="py-3 pr-4 font-semibold">Time</th>
                  <th className="py-3 pr-4 font-semibold">Hours</th>
                  <th className="py-3 font-semibold">Activities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="py-3 pr-4 font-medium text-slate-900">{entry.date}</td>
                    <td className="py-3 pr-4 text-slate-700">{entry.timeIn} - {entry.timeOut}</td>
                    <td className="py-3 pr-4 text-slate-700">{formatHours(calculateCompletedHours([entry]))}</td>
                    <td className="py-3 text-slate-700">{entry.activities || 'No activity notes'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600">
            No DTR entries yet. Start by adding your first time-in and time-out record.
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{helper}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50">
      {label}
    </Link>
  );
}
