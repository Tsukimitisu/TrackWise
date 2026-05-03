import StatCard from '../../components/StatCard';
import { useAuth } from '../../auth/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
        <p className="text-sm text-slate-500">Role-based dashboard</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-ink-900">
          Welcome, {user?.first_name}.
        </h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          This dashboard is ready for organization metrics, attendance status, report queues, and approval workflows.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Completed Hours" value="120.5" detail="Approved attendance only" />
        <StatCard label="Pending Reports" value="8" detail="Daily and weekly reports for review" />
        <StatCard label="Active Assignments" value="24" detail="Users under program tracking" />
        <StatCard label="Notifications" value="5" detail="Approvals and reminders" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-ink-900">Next implementation targets</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>• Attendance and DTR capture flow</li>
            <li>• Daily and weekly report forms</li>
            <li>• Document uploads and approval history</li>
            <li>• Printable report pages</li>
          </ul>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-ink-900">Current organization</h2>
          <p className="mt-2 text-sm text-slate-600">{user?.organization?.name ?? 'Global'}</p>
        </div>
      </section>
    </div>
  );
}
