import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { hasRole } from '../../utils/roleHelper';

interface OverviewData {
  users: {
    total: number;
    by_role: Record<string, number>;
  };
  organizations: {
    total: number;
  };
  programs: {
    total: number;
    active: number;
    completed: number;
  };
  assignments: {
    total: number;
    active: number;
    completed: number;
  };
}

interface UserActivityData {
  total_active_users: number;
  users_with_reports: number;
  recent_users: Array<{ id: number; name: string; email: string; role: string; created_at: string }>;
  last_active_users: Array<{ id: number; name: string; last_active: string | null }>;
}

interface ReportingData {
  total: number;
  submitted: number;
  approved: number;
  rejected: number;
  needs_revision: number;
  avg_submission_time_days: number;
  reports_last_week: Array<{ date: string; count: number }>;
  reports_by_program: Array<{ name: string; report_count: number }>;
}

interface OrganizationData {
  organizations: Array<{ id: number; name: string; type: string; status: string; assignments_count: number; programs_count: number }>;
  by_status: Record<string, number>;
}

interface ProgramData {
  programs: Array<{ id: number; name: string; required_hours: number; status: string; assignments: number; avg_hours: number | null }>;
  by_status: Record<string, number>;
  by_report_frequency: Record<string, number>;
}

interface HealthData {
  activity: {
    reports_last_7_days: number;
    reports_last_30_days: number;
    pending_reviews: number;
  };
  health_score: number;
  data_integrity: {
    users_with_assignments: number;
    assignments_with_reports: number;
    orphaned_reports: number;
  };
}

const AdminStatisticsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canView = hasRole(user, ['admin', 'coordinator']);

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivityData | null>(null);
  const [reporting, setReporting] = useState<ReportingData | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationData | null>(null);
  const [programs, setPrograms] = useState<ProgramData | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canView) {
      navigate('/app');
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const [overviewRes, usersRes, reportingRes, orgRes, programRes, healthRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/statistics/overview`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/statistics/users`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/statistics/reports`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/statistics/organizations`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/statistics/programs`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/statistics/health`),
        ]);

        setOverview(overviewRes.data);
        setUserActivity(usersRes.data);
        setReporting(reportingRes.data);
        setOrganizations(orgRes.data);
        setPrograms(programRes.data);
        setHealth(healthRes.data);
      } catch (error) {
        console.error('Failed to load admin statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [canView, navigate]);

  const StatCard = ({ label, value, detail }: { label: string; value: string | number; detail?: string }) => (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-black text-slate-900">{value}</div>
      {detail ? <div className="mt-2 text-sm text-slate-500">{detail}</div> : null}
    </div>
  );

  if (loading) {
    return <div className="p-6 text-center text-slate-600">Loading admin statistics...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <div className="rounded-[2rem] bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 p-8 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">Admin Statistics</p>
        <h1 className="mt-3 text-4xl font-black">System Overview</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/75">
          A consolidated view of users, programs, reports, assignments, and operational health across TrackWise.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={overview?.users.total ?? 0} detail="By role distribution below" />
        <StatCard label="Organizations" value={overview?.organizations.total ?? 0} />
        <StatCard label="Programs" value={overview?.programs.total ?? 0} detail={`${overview?.programs.active ?? 0} active, ${overview?.programs.completed ?? 0} completed`} />
        <StatCard label="Assignments" value={overview?.assignments.total ?? 0} detail={`${overview?.assignments.active ?? 0} active, ${overview?.assignments.completed ?? 0} completed`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Users by Role</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(overview?.users.by_role ?? {}).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-medium text-slate-700">{role}</span>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Operational Health</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <StatCard label="Health Score" value={`${health?.health_score ?? 0}%`} />
            <StatCard label="Pending Reviews" value={health?.activity.pending_reviews ?? 0} />
            <StatCard label="Orphaned Reports" value={health?.data_integrity.orphaned_reports ?? 0} detail="Should be zero" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Reporting Activity</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Total Reports" value={reporting?.total ?? 0} />
            <StatCard label="Submitted" value={reporting?.submitted ?? 0} />
            <StatCard label="Approved" value={reporting?.approved ?? 0} />
            <StatCard label="Rejected" value={reporting?.rejected ?? 0} />
            <StatCard label="Needs Revision" value={reporting?.needs_revision ?? 0} />
            <StatCard label="Avg Review Delay" value={`${reporting?.avg_submission_time_days ?? 0} days`} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Last 7 Days</h2>
          <div className="mt-4 space-y-3">
            {(health?.activity ? [
              { label: 'Reports in 7 days', value: health.activity.reports_last_7_days },
              { label: 'Reports in 30 days', value: health.activity.reports_last_30_days },
              { label: 'Users with reports', value: userActivity?.users_with_reports ?? 0 },
              { label: 'Users with assignments', value: health.data_integrity.users_with_assignments },
            ] : []).map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <span className="text-sm font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Recent Users</h2>
          <div className="mt-4 space-y-3">
            {(userActivity?.recent_users ?? []).slice(0, 8).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{entry.name}</div>
                  <div className="text-xs text-slate-500">{entry.email}</div>
                </div>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">{entry.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Top Programs</h2>
          <div className="mt-4 space-y-3">
            {(reporting?.reports_by_program ?? []).slice(0, 8).map((program) => (
              <div key={program.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-medium text-slate-700">{program.name}</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{program.report_count} reports</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Organizations</h2>
          <div className="mt-4 space-y-3">
            {(organizations?.organizations ?? []).slice(0, 8).map((organization) => (
              <div key={organization.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{organization.name}</div>
                  <div className="text-xs text-slate-500">{organization.type}</div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <div>{organization.programs_count} programs</div>
                  <div>{organization.assignments_count} assignments</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Program Mix</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <StatCard label="Active Programs" value={programs?.by_status.active ?? 0} />
            <StatCard label="Completed Programs" value={programs?.by_status.completed ?? 0} />
            <StatCard label="Daily Frequency" value={programs?.by_report_frequency.daily ?? 0} />
            <StatCard label="Weekly Frequency" value={programs?.by_report_frequency.weekly ?? 0} />
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Health check shows {health?.data_integrity.assignments_with_reports ?? 0} assignments with report activity.
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminStatisticsPage;
