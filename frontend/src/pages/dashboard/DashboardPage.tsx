import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import Surface from '../../components/ui/Surface';

const quickActions = [
  { label: 'Time In / Out', to: '/app/time-in-out' },
  { label: 'Daily Reports', to: '/app/reports/daily' },
  { label: 'Weekly Reports', to: '/app/reports/weekly' },
  { label: 'Notifications', to: '/app/notifications' },
];

const upcomingDeadlines = [
  { title: 'Daily report review', due: 'Today, 4:00 PM', tone: 'warning' as const },
  { title: 'Weekly summary submission', due: 'Friday', tone: 'info' as const },
  { title: 'DTR cutoff', due: 'End of week', tone: 'neutral' as const },
];

const activityFeed = [
  { title: 'Attendance logged', detail: '2 hours added to today’s DTR', time: '5m ago' },
  { title: 'Weekly report approved', detail: 'Coordinator cleared the latest entry', time: '32m ago' },
  { title: 'Document uploaded', detail: 'New requirement attached for review', time: '1h ago' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const program = user?.userPrograms?.[0];
  const requiredHours = program?.required_hours ?? 240;
  const completedHours = program?.completed_hours ?? 120;
  const progress = Math.min((completedHours / Math.max(requiredHours, 1)) * 100, 100);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Role-based dashboard"
        title={`Welcome, ${user?.first_name ?? 'there'}.`}
        description="A calm control center for attendance, reports, approvals, and progress monitoring."
        actions={
          <>
            <Link to="/app/reports/daily" className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5">
              New report
            </Link>
            <Link to="/app/time-in-out" className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15">
              Open DTR
            </Link>
          </>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-md">
            <div className="text-xs uppercase tracking-[0.24em] text-white/55">Required hours</div>
            <div className="mt-2 text-3xl font-black">{requiredHours}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-md">
            <div className="text-xs uppercase tracking-[0.24em] text-white/55">Completed</div>
            <div className="mt-2 text-3xl font-black">{completedHours}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-md">
            <div className="text-xs uppercase tracking-[0.24em] text-white/55">Progress</div>
            <div className="mt-2 text-3xl font-black">{Math.round(progress)}%</div>
          </div>
        </div>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Completed Hours" value={`${completedHours}`} detail="Approved attendance only" />
        <StatCard label="Pending Reports" value="8" detail="Daily and weekly reports for review" />
        <StatCard label="Active Assignments" value="24" detail="Users under program tracking" />
        <StatCard label="Notifications" value="5" detail="Approvals and reminders" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Surface className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Progress summary</div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Hours completed vs required</h2>
            </div>
            <Badge tone={progress >= 100 ? 'success' : progress >= 60 ? 'info' : 'warning'}>
              {progress >= 100 ? 'On track' : 'In progress'}
            </Badge>
          </div>

          <div className="mt-6 rounded-3xl bg-slate-50 p-5 dark:bg-slate-900/60">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Attendance progress</div>
                <div className="mt-2 text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">{Math.round(progress)}%</div>
              </div>
              <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                <div>{completedHours} completed</div>
                <div>{Math.max(requiredHours - completedHours, 0)} remaining</div>
              </div>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-cyan-500 to-emerald-400 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Surface className="p-5" elevated={false}>
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">Recent activity</div>
              <div className="mt-4 space-y-4">
                {activityFeed.map((item) => (
                  <div key={item.title} className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900/60">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">{item.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{item.detail}</div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.time}</div>
                  </div>
                ))}
              </div>
            </Surface>

            <Surface className="p-5" elevated={false}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">Upcoming deadlines</div>
                <Badge tone="neutral">3 items</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {upcomingDeadlines.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">{item.title}</div>
                      <Badge tone={item.tone}>{item.due}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Surface>
          </div>
        </Surface>

        <div className="space-y-6">
          <Surface className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Quick actions</div>
                <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-50">Jump back into work</h3>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {quickActions.map((action) => (
                <Link key={action.to} to={action.to} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-slate-700">
                  {action.label}
                </Link>
              ))}
            </div>
          </Surface>

          <Surface className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Notifications</div>
                <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-50">Need attention</h3>
              </div>
              <Badge tone="warning">5</Badge>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="rounded-2xl bg-amber-50 px-4 py-3 dark:bg-amber-950/30">Two reports are pending review.</div>
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">Attendance data is up to date.</div>
              <div className="rounded-2xl bg-indigo-50 px-4 py-3 dark:bg-indigo-950/30">Calendar sync is ready for schedule planning.</div>
            </div>
          </Surface>

          <Surface className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Calendar</div>
                <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-50">This week</h3>
              </div>
              <Badge tone="info">Mon - Fri</Badge>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
                <div key={day} className="rounded-2xl bg-slate-50 px-2 py-3 dark:bg-slate-900/60">
                  <div className="font-semibold text-slate-900 dark:text-slate-50">{day}</div>
                  <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-400" style={{ width: `${30 + index * 14}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </section>

      {program ? (
        <Surface className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Current organization</div>
              <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-50">{user?.organization?.name ?? 'Global'}</h3>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Program: {program.program?.name ?? 'Assigned program'}</div>
          </div>
        </Surface>
      ) : null}
    </div>
  );
}
