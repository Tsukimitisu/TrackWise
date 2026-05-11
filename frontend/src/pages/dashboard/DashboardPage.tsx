import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';

const quickActions = [
  { label: 'Time In / Out', to: '/app/time-in-out', icon: '⏱️' },
  { label: 'Daily Reports', to: '/app/reports/daily', icon: '📝' },
  { label: 'Weekly Reports', to: '/app/reports/weekly', icon: '📊' },
  { label: 'View Notifications', to: '/app/notifications', icon: '🔔' },
];

const activityFeed = [
  { title: 'Attendance logged', detail: '2 hours added to today\'s DTR', time: '5m ago', icon: '✓' },
  { title: 'Weekly report approved', detail: 'Coordinator cleared the latest entry', time: '32m ago', icon: '✓' },
  { title: 'Document uploaded', detail: 'New requirement attached for review', time: '1h ago', icon: '📄' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const program = user?.userPrograms?.[0];
  const requiredHours = program?.required_hours ?? 240;
  const completedHours = program?.completed_hours ?? 120;
  const progress = Math.min((completedHours / Math.max(requiredHours, 1)) * 100, 100);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title={`Welcome, ${user?.first_name ?? 'there'}`}
        description="Your control center for attendance, reports, and progress tracking"
        actions={
          <div className="flex gap-3">
            <Button asChild variant="primary" size="md">
              <Link to="/app/time-in-out">Time In / Out</Link>
            </Button>
            <Button asChild variant="secondary" size="md">
              <Link to="/app/reports/daily">New Report</Link>
            </Button>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Required Hours', value: requiredHours, unit: 'hours', bg: 'bg-gradient-to-br from-blue-50 to-blue-100' },
          { label: 'Completed Hours', value: completedHours, unit: 'hours', bg: 'bg-gradient-to-br from-green-50 to-green-100' },
          { label: 'Remaining Hours', value: Math.max(requiredHours - completedHours, 0), unit: 'hours', bg: 'bg-gradient-to-br from-orange-50 to-orange-100' },
          { label: 'Completion Rate', value: Math.round(progress), unit: '%', bg: 'bg-gradient-to-br from-purple-50 to-purple-100' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-xl p-6 border border-opacity-20 shadow-sm hover:shadow-md transition-all duration-300`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {stat.value}
              </span>
              <span className="text-sm text-slate-600">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Progress & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <div className="rounded-3xl border border-blue-100/80 bg-white/85 p-8 shadow-[0_14px_50px_rgba(59,130,246,0.08)] backdrop-blur-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Hours Progress</h2>
              <p className="text-sm text-slate-600">Track your completion towards the required hours</p>
            </div>

            <div className="space-y-6">
              {/* Progress Ring */}
              <div className="flex justify-center py-6">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600">{Math.round(progress)}%</div>
                      <div className="text-xs text-slate-600 mt-1">Complete</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-2">Completed</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {completedHours}
                    <span className="text-sm font-normal text-slate-600 ml-1">/ {requiredHours}</span>
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-2">Remaining</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {Math.max(requiredHours - completedHours, 0)}
                    <span className="text-sm font-normal text-slate-600 ml-1">hours</span>
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="pt-2">
                {progress >= 100 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <span className="text-sm font-semibold text-green-700">✓ Target completed!</span>
                  </div>
                ) : progress >= 75 ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <span className="text-sm font-semibold text-blue-700">On track - {Math.round(progress)}% done</span>
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                    <span className="text-sm font-semibold text-orange-700">Keep pushing - {Math.round(progress)}% done</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="rounded-3xl border border-blue-100/80 bg-white/85 p-8 shadow-[0_14px_50px_rgba(59,130,246,0.08)] backdrop-blur-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Recent Activity</h2>
              <p className="text-sm text-slate-600">Your latest actions and updates</p>
            </div>

            <div className="space-y-4">
              {activityFeed.map((activity, i) => (
                <div key={i} className="flex gap-4 pb-4 last:pb-0 border-b border-gray-100 last:border-0">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-lg">{activity.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{activity.title}</p>
                    <p className="text-sm text-slate-600">{activity.detail}</p>
                  </div>
                  <p className="text-xs text-slate-500 whitespace-nowrap">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions & Notifications */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-3xl border border-blue-100/80 bg-white/85 p-6 shadow-[0_14px_50px_rgba(59,130,246,0.08)] backdrop-blur-sm">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
              <p className="text-xs text-slate-600 mt-1">Jump back into work</p>
            </div>

            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center gap-3 rounded-lg p-3 text-left bg-gradient-to-r from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 border border-blue-200 hover:border-blue-300 transition-all duration-200 group"
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm font-medium text-slate-900 group-hover:text-blue-600">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Notifications Panel */}
          <div className="rounded-3xl border border-blue-100/80 bg-white/85 p-6 shadow-[0_14px_50px_rgba(59,130,246,0.08)] backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Notifications</h3>
              <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">5 New</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <p className="font-medium text-orange-900">Reports pending review</p>
                <p className="text-xs text-orange-700 opacity-75">2 daily reports awaiting approval</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="font-medium text-blue-900">Weekly report due</p>
                <p className="text-xs text-blue-700 opacity-75">Submit your weekly summary by Friday</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="font-medium text-green-900">Attendance validated</p>
                <p className="text-xs text-green-700 opacity-75">Today's time-in has been confirmed</p>
              </div>
            </div>
          </div>

          {/* Program Info */}
          {program && (
            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-sky-600 p-6 text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)]">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-90 mb-1">
                    Current Program
                  </p>
                  <p className="text-lg font-bold">
                    {program.program?.name ?? 'Active Program'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-90 mb-1">
                    Organization
                  </p>
                  <p className="text-base font-medium">
                    {user?.organization?.name ?? 'Organization'}
                  </p>
                </div>
                <Button asChild variant="primary" size="sm" fullWidth>
                  <Link to={`/app/assignments/${program.id}`}>View Details</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
