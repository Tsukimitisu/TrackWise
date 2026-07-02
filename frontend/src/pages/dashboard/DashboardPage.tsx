import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import {
  calculateCompletedHours,
  formatHours,
  loadOjtData,
  type OjtData,
} from '../../features/studentOjt/ojtStorage';
import type { RoleName } from '../../types';

type ApiItem = Record<string, any>;

interface DashboardData {
  assignments: ApiItem[];
  reports: ApiItem[];
  attendance: ApiItem[];
  users: ApiItem[];
  organizations: ApiItem[];
}

const emptyDashboardData: DashboardData = {
  assignments: [],
  reports: [],
  attendance: [],
  users: [],
  organizations: [],
};

function listFrom(payload: unknown): ApiItem[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as { data: unknown }).data;
    return Array.isArray(data) ? data : [];
  }
  return [];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role.name ?? 'Viewer';
  const isStudent = role === 'Student';
  const [ojtData, setOjtData] = useState<OjtData>(() => loadOjtData());
  const [apiData, setApiData] = useState<DashboardData>(emptyDashboardData);
  const [loading, setLoading] = useState(!isStudent);

  useEffect(() => {
    const refresh = () => setOjtData(loadOjtData());
    window.addEventListener('trackwise_student_ojt_updated', refresh);
    return () => window.removeEventListener('trackwise_student_ojt_updated', refresh);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const endpoints = ['/assignments', '/daily-reports', '/attendance-logs', '/users', '/organizations'];
      const results = await Promise.allSettled(endpoints.map((endpoint) => client.get(endpoint)));
      if (!active) return;
      const lists = results.map((result) => result.status === 'fulfilled' ? listFrom(result.value.data) : []);
      setApiData({
        assignments: lists[0],
        reports: lists[1],
        attendance: lists[2],
        users: lists[3],
        organizations: lists[4],
      });
      setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, []);

  if (isStudent) {
    return <StudentDashboard data={ojtData} firstName={user?.first_name ?? ojtData.profile.studentName.split(' ')[0]} apiData={apiData} />;
  }

  return <StaffDashboard role={role} firstName={user?.first_name ?? 'there'} data={apiData} loading={loading} />;
}

function StudentDashboard({ data, firstName, apiData }: { data: OjtData; firstName: string; apiData: DashboardData }) {
  const completedHours = useMemo(() => calculateCompletedHours(data.dtrEntries), [data.dtrEntries]);
  const requiredHours = Math.max(data.profile.requiredHours || 0, 1);
  const remainingHours = Math.max(requiredHours - completedHours, 0);
  const progress = Math.min((completedHours / requiredHours) * 100, 100);
  const latestEntry = [...data.dtrEntries].sort((a, b) => b.date.localeCompare(a.date))[0];
  const pendingReports = apiData.reports.filter((report) => ['submitted', 'needs_revision'].includes(report.status)).length;
  const approvedReports = apiData.reports.filter((report) => report.status === 'approved').length;
  const profileComplete = Boolean(data.profile.studentNumber && data.profile.course && data.profile.school && data.profile.ojtSite && data.profile.supervisorName);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-[#10233f] px-6 py-7 text-white shadow-sm sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-teal-300">{formatDate(new Date())}</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Good day, {firstName}.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Keep your attendance, daily work, and documentation complete and ready for supervisor review.
            </p>
          </div>
          <Link to="/app/time-in-out" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-400 px-5 py-3 text-sm font-bold text-[#10233f] shadow-sm hover:bg-teal-300 hover:text-[#10233f]">
            <span className="text-lg leading-none">+</span> Record attendance
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Required hours" value={formatHours(requiredHours)} note="OJT target" tone="navy" icon="◎" />
        <MetricCard label="Rendered hours" value={formatHours(completedHours)} note={`${Math.round(progress)}% completed`} tone="teal" icon="✓" />
        <MetricCard label="Remaining hours" value={formatHours(remainingHours)} note={remainingHours === 0 ? 'Requirement completed' : 'Still to render'} tone="amber" icon="◷" />
        <MetricCard label="Reports" value={`${approvedReports} approved`} note={`${pendingReports} pending review`} tone="violet" icon="▤" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <ProgressRing value={progress} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Overall progress</p>
                  <h2 className="mt-2 text-xl font-bold text-slate-950">You’re {formatHours(remainingHours)} hours from your goal</h2>
                </div>
                <span className={`hidden rounded-full px-3 py-1 text-xs font-bold sm:inline-flex ${progress >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                  {progress >= 100 ? 'Completed' : 'In progress'}
                </span>
              </div>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <MiniDetail label="Company" value={data.profile.ojtSite || 'Not set'} />
                <MiniDetail label="Department" value={data.profile.department || 'Not set'} />
                <MiniDetail label="Supervisor" value={data.profile.supervisorName || 'Not set'} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Today’s workflow</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Daily checklist</h2>
            </div>
            <span className="text-sm font-bold text-slate-500">{[latestEntry, pendingReports > 0, data.documentation.length > 0].filter(Boolean).length}/3</span>
          </div>
          <div className="mt-5 space-y-3">
            <ChecklistItem done={Boolean(latestEntry?.date === new Date().toISOString().slice(0, 10))} label="Attendance recorded" to="/app/time-in-out" />
            <ChecklistItem done={pendingReports > 0} label="Daily log submitted" to="/app/reports/daily/create" />
            <ChecklistItem done={data.documentation.length > 0} label="Documentation added" to="/app/documents" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="font-bold text-slate-950">Latest attendance</h2>
              <p className="mt-0.5 text-sm text-slate-500">Your most recent daily time record</p>
            </div>
            <Link to="/app/attendance" className="text-sm font-bold text-blue-700 hover:text-blue-800">View all</Link>
          </div>
          {latestEntry ? (
            <div className="grid gap-4 p-6 sm:grid-cols-[1fr_auto_auto] sm:items-center">
              <div>
                <p className="font-bold text-slate-900">{formatShortDate(latestEntry.date)}</p>
                <p className="mt-1 line-clamp-1 text-sm text-slate-500">{latestEntry.activities || 'No activity notes'}</p>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-slate-800">{latestEntry.timeIn} – {latestEntry.timeOut}</p>
                <p className="text-slate-500">Time in / out</p>
              </div>
              <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">Recorded</span>
            </div>
          ) : (
            <EmptyPrompt title="No attendance record yet" description="Record your time in and time out to begin tracking rendered hours." to="/app/time-in-out" action="Record attendance" />
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Profile readiness</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">{profileComplete ? 'Profile complete' : 'Complete your OJT profile'}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {profileComplete ? 'Your school, company, and supervisor details are ready for reports.' : 'Add the required school, company, and supervisor details before generating final reports.'}
          </p>
          <Link to="/app/ojt-setup" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800">
            {profileComplete ? 'Review profile' : 'Complete profile'} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

function StaffDashboard({ role, firstName, data, loading }: { role: RoleName; firstName: string; data: DashboardData; loading: boolean }) {
  const pendingReports = data.reports.filter((report) => ['submitted', 'needs_revision'].includes(report.status)).length;
  const completedAssignments = data.assignments.filter((assignment) => {
    const required = Number(assignment.required_hours || 0);
    const completed = Number(assignment.completed_hours || 0);
    return required > 0 && completed >= required;
  }).length;
  const studentCount = data.users.filter((item) => item.role?.name === 'Student' || item.role_name === 'Student').length;

  const config = role === 'Supervisor'
    ? {
        eyebrow: 'Supervisor overview',
        title: `Welcome back, ${firstName}.`,
        description: 'Review student submissions, verify attendance, and keep every trainee moving forward.',
        stats: [
          ['Assigned students', data.assignments.length, 'Active trainee records', 'navy'],
          ['Pending review', pendingReports, 'Reports that need action', 'amber'],
          ['Attendance logs', data.attendance.length, 'Records in your scope', 'teal'],
          ['Completed students', completedAssignments, 'Required hours reached', 'violet'],
        ],
        actions: [
          ['Review submitted reports', '/app/reports/daily'],
          ['View assigned students', '/app/assigned-trainees'],
          ['Check attendance records', '/app/attendance'],
        ],
      }
    : role === 'Coordinator'
      ? {
          eyebrow: 'School monitoring',
          title: `Good day, ${firstName}.`,
          description: 'Monitor student compliance, approved reports, and company placements from one clear overview.',
          stats: [
            ['Total students', studentCount || data.assignments.length, 'Students in your scope', 'navy'],
            ['Currently taking OJT', data.assignments.length - completedAssignments, 'Active placements', 'teal'],
            ['Completed hours', completedAssignments, 'Students at 100%', 'violet'],
            ['Pending requirements', pendingReports, 'Reports needing follow-up', 'amber'],
          ],
          actions: [
            ['Monitor student progress', '/app/progress'],
            ['View student records', '/app/assigned-trainees'],
            ['Generate summary reports', '/app/printables'],
          ],
        }
      : {
          eyebrow: 'Administration overview',
          title: `Good day, ${firstName}.`,
          description: 'Manage OJT users, company records, hour requirements, and system activity.',
          stats: [
            ['System users', data.users.length, 'Registered accounts', 'navy'],
            ['Companies', data.organizations.length, 'Partner organizations', 'teal'],
            ['Active placements', data.assignments.length - completedAssignments, 'Ongoing assignments', 'violet'],
            ['Pending reviews', pendingReports, 'Submitted reports', 'amber'],
          ],
          actions: [
            ['Manage users', '/app/users'],
            ['Manage companies', '/app/organizations'],
            ['Set OJT requirements', '/app/programs'],
          ],
        };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{config.eyebrow}</p>
        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{config.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{config.description}</p>
          </div>
          <p className="text-sm font-semibold text-slate-500">{formatDate(new Date())}</p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {config.stats.map(([label, value, note, tone]) => (
          <MetricCard key={String(label)} label={String(label)} value={loading ? '—' : String(value)} note={String(note)} tone={tone as 'navy' | 'teal' | 'amber' | 'violet'} icon={loading ? '·' : '↗'} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-950">Reports requiring attention</h2>
            <p className="mt-1 text-sm text-slate-500">Recently submitted daily reports in your scope</p>
          </div>
          {data.reports.filter((report) => ['submitted', 'needs_revision'].includes(report.status)).slice(0, 5).map((report) => (
            <Link key={report.id} to={`/app/reports/daily/${report.id}`} className="flex items-center gap-4 border-b border-slate-100 px-6 py-4 text-slate-900 last:border-0 hover:bg-slate-50 hover:text-slate-900">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 font-bold text-amber-700">▤</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{report.userProgram?.user ? `${report.userProgram.user.first_name} ${report.userProgram.user.last_name}` : `Report #${report.id}`}</span>
                <span className="block truncate text-xs text-slate-500">{report.report_date ?? 'Date not available'} · {report.userProgram?.program?.name ?? 'OJT Daily Log'}</span>
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold capitalize text-amber-700">{String(report.status).replace('_', ' ')}</span>
            </Link>
          ))}
          {!loading && pendingReports === 0 ? (
            <div className="px-6 py-12 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-xl text-emerald-700">✓</span>
              <p className="mt-3 font-bold text-slate-900">All caught up</p>
              <p className="mt-1 text-sm text-slate-500">There are no submitted reports waiting for review.</p>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Quick actions</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">Common tasks</h2>
          <div className="mt-5 space-y-3">
            {config.actions.map(([label, to], index) => (
              <Link key={to} to={to} className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-slate-800 hover:border-teal-300 hover:bg-teal-50/50 hover:text-slate-950">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700 group-hover:bg-teal-100 group-hover:text-teal-800">0{index + 1}</span>
                <span className="flex-1 text-sm font-bold">{label}</span>
                <span className="text-slate-400 group-hover:text-teal-700">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, note, tone, icon }: { label: string; value: string; note: string; tone: 'navy' | 'teal' | 'amber' | 'violet'; icon: string }) {
  const tones = {
    navy: 'bg-blue-50 text-blue-800',
    teal: 'bg-teal-50 text-teal-800',
    amber: 'bg-amber-50 text-amber-800',
    violet: 'bg-violet-50 text-violet-800',
  };
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-xl text-base font-bold ${tones[tone]}`}>{icon}</span>
      </div>
      <p className="mt-3 text-xs font-medium text-slate-500">{note}</p>
    </article>
  );
}

function ProgressRing({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg className="-rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#14b8a6" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <span className="text-2xl font-bold text-slate-950">{Math.round(value)}%</span>
      </div>
    </div>
  );
}

function MiniDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function ChecklistItem({ done, label, to }: { done: boolean; label: string; to: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-slate-800 hover:border-teal-300 hover:text-slate-950">
      <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{done ? '✓' : ''}</span>
      <span className="flex-1 text-sm font-semibold">{label}</span>
      <span className="text-slate-400">→</span>
    </Link>
  );
}

function EmptyPrompt({ title, description, to, action }: { title: string; description: string; to: string; action: string }) {
  return (
    <div className="px-6 py-8 text-center">
      <p className="font-bold text-slate-900">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{description}</p>
      <Link to={to} className="mt-4 inline-flex rounded-lg bg-[#10233f] px-4 py-2 text-sm font-bold text-white hover:bg-[#18345b] hover:text-white">{action}</Link>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

function formatShortDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}
