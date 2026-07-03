import { FormEvent, useEffect, useMemo, useState } from 'react';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import { type Assignment, displayName, unwrapList } from '../../features/studentOjt/apiTypes';

interface EditableProfile {
  first_name: string;
  last_name: string;
  student_number: string;
  course: string;
  year_level: string;
  phone: string;
  email: string;
}

export default function OjtSetupPage() {
  const { user, refreshSession } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [profile, setProfile] = useState<EditableProfile>({
    first_name: '', last_name: '', student_number: '', course: '', year_level: '', phone: '', email: '',
  });
  const [message, setMessage] = useState<{ error?: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const current = user as any;
    setProfile({
      first_name: current?.first_name || '',
      last_name: current?.last_name || '',
      student_number: current?.student_number || '',
      course: current?.course || '',
      year_level: current?.year_level || '',
      phone: current?.phone || '',
      email: current?.email || '',
    });
    client.get('/assignments').then((response) => setAssignments(unwrapList<Assignment>(response.data))).catch(() => {
      setMessage({ error: true, text: 'OJT assignment details could not be loaded.' });
    });
  }, [user]);

  const assignment = assignments[0];
  const completion = useMemo(() => {
    const personal = Object.values(profile).filter(Boolean).length;
    const assigned = assignment ? 6 : 0;
    return Math.round((personal + assigned) / 13 * 100);
  }, [assignment, profile]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await client.put('/auth/profile', profile);
      if (response.data.requires_email_verification) {
        localStorage.removeItem('trackwise_token');
        window.location.assign('/login');
        return;
      }
      await refreshSession();
      setMessage({ text: 'Your profile was saved.' });
    } catch (requestError: any) {
      setMessage({ error: true, text: requestError.response?.data?.message || 'Profile could not be saved.' });
    } finally {
      setBusy(false);
    }
  };

  const update = (key: keyof EditableProfile, value: string) => setProfile((current) => ({ ...current, [key]: value }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader eyebrow="Student record" title="My OJT Profile" description="Personal fields are editable. Assignment, company, reviewer, dates, and required hours are controlled by authorized staff." />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex justify-between"><div><p className="font-bold text-slate-900">Profile completeness</p><p className="text-sm text-slate-500">Complete your personal details and contact an administrator if assignment data is missing.</p></div><strong className="text-teal-700">{completion}%</strong></div>
        <div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600" style={{ width: `${completion}%` }} /></div>
      </section>

      {message ? <div role="status" className={`rounded-lg px-4 py-3 text-sm font-semibold ${message.error ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>{message.text}</div> : null}

      <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Student information</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="First name"><input className={fieldClass} value={profile.first_name} onChange={(e) => update('first_name', e.target.value)} required /></Field>
          <Field label="Last name"><input className={fieldClass} value={profile.last_name} onChange={(e) => update('last_name', e.target.value)} required /></Field>
          <Field label="Student number"><input className={fieldClass} value={profile.student_number} onChange={(e) => update('student_number', e.target.value)} /></Field>
          <Field label="Course"><input className={fieldClass} value={profile.course} onChange={(e) => update('course', e.target.value)} /></Field>
          <Field label="Year level"><input className={fieldClass} value={profile.year_level} onChange={(e) => update('year_level', e.target.value)} /></Field>
          <Field label="Contact number"><input type="tel" className={fieldClass} value={profile.phone} onChange={(e) => update('phone', e.target.value)} /></Field>
          <Field label="Email address"><input type="email" className={fieldClass} value={profile.email} onChange={(e) => update('email', e.target.value)} required /></Field>
        </div>
        <div className="mt-6 flex justify-end"><button disabled={busy} className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400">{busy ? 'Saving…' : 'Save personal details'}</button></div>
      </form>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Official OJT assignment</h2>
        {assignment ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ReadOnly label="Company" value={assignment.program?.organization?.name || 'Not set'} />
            <ReadOnly label="Program / requirement" value={assignment.program?.name || 'Not set'} />
            <ReadOnly label="Department / assigned area" value={assignment.department || 'Not set'} />
            <ReadOnly label="Company supervisor" value={displayName(assignment.supervisor)} />
            <ReadOnly label="School coordinator" value={displayName(assignment.coordinator)} />
            <ReadOnly label="Required hours" value={String(assignment.required_hours)} />
            <ReadOnly label="OJT start date" value={assignment.start_date?.slice(0, 10) || 'Not set'} />
            <ReadOnly label="OJT end date" value={assignment.end_date?.slice(0, 10) || 'Not set'} />
          </div>
        ) : <p className="mt-5 rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">No OJT assignment has been created for your account.</p>}
      </section>
    </div>
  );
}

const fieldClass = 'w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100';
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span>{children}</label>; }
function ReadOnly({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-900">{value}</p></div>; }
