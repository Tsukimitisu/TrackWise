import { FormEvent, useEffect, useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import { defaultProfile, loadOjtData, saveOjtData, type StudentOjtProfile } from '../../features/studentOjt/ojtStorage';

const fieldClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100';

export default function OjtSetupPage() {
  const [profile, setProfile] = useState<StudentOjtProfile>(defaultProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => setProfile(loadOjtData().profile), []);

  const completion = useMemo(() => {
    const required: Array<keyof StudentOjtProfile> = [
      'studentName', 'studentNumber', 'course', 'yearLevel', 'school', 'ojtSite',
      'department', 'supervisorName', 'requiredHours', 'startDate', 'endDate', 'contactNumber', 'email',
    ];
    const complete = required.filter((key) => Boolean(profile[key])).length;
    return Math.round((complete / required.length) * 100);
  }, [profile]);

  const updateField = (key: keyof StudentOjtProfile, value: string) => {
    setSaved(false);
    setProfile((current) => ({
      ...current,
      [key]: key === 'requiredHours' ? Number(value || 0) : value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const current = loadOjtData();
    saveOjtData({ ...current, profile });
    setSaved(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Student record"
        title="My OJT Profile"
        description="Keep the information used in your attendance sheets, narrative reports, and school monitoring records accurate."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-900">Profile completeness</p>
            <p className="mt-1 text-xs text-slate-500">Complete all required details before generating your final report.</p>
          </div>
          <span className="text-lg font-bold text-teal-700">{completion}%</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${completion}%` }} />
        </div>
      </div>

      {saved ? (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Profile saved successfully. Your reports will use these updated details.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Student information" description="Your official school and contact details.">
          <Field label="Full name" required>
            <input className={fieldClass} value={profile.studentName} onChange={(event) => updateField('studentName', event.target.value)} required />
          </Field>
          <Field label="Student number" required>
            <input className={fieldClass} value={profile.studentNumber} onChange={(event) => updateField('studentNumber', event.target.value)} required />
          </Field>
          <Field label="Course" required>
            <input className={fieldClass} value={profile.course} onChange={(event) => updateField('course', event.target.value)} placeholder="e.g. BS Information Technology" required />
          </Field>
          <Field label="Year level" required>
            <input className={fieldClass} value={profile.yearLevel} onChange={(event) => updateField('yearLevel', event.target.value)} placeholder="e.g. 4th Year" required />
          </Field>
          <Field label="School name" required>
            <input className={fieldClass} value={profile.school} onChange={(event) => updateField('school', event.target.value)} required />
          </Field>
          <Field label="Contact number" required>
            <input className={fieldClass} type="tel" value={profile.contactNumber} onChange={(event) => updateField('contactNumber', event.target.value)} required />
          </Field>
          <Field label="Email address" required wide>
            <input className={fieldClass} type="email" value={profile.email} onChange={(event) => updateField('email', event.target.value)} required />
          </Field>
        </FormSection>

        <FormSection title="OJT assignment" description="Company placement, supervisor, and hour requirement.">
          <Field label="Company name" required>
            <input className={fieldClass} value={profile.ojtSite} onChange={(event) => updateField('ojtSite', event.target.value)} required />
          </Field>
          <Field label="Department / assigned area" required>
            <input className={fieldClass} value={profile.department} onChange={(event) => updateField('department', event.target.value)} required />
          </Field>
          <Field label="Supervisor name" required>
            <input className={fieldClass} value={profile.supervisorName} onChange={(event) => updateField('supervisorName', event.target.value)} required />
          </Field>
          <Field label="Required OJT hours" required>
            <input className={fieldClass} type="number" min="1" value={profile.requiredHours} onChange={(event) => updateField('requiredHours', event.target.value)} required />
          </Field>
          <Field label="OJT start date" required>
            <input className={fieldClass} type="date" value={profile.startDate} onChange={(event) => updateField('startDate', event.target.value)} required />
          </Field>
          <Field label="OJT end date" required>
            <input className={fieldClass} type="date" min={profile.startDate || undefined} value={profile.endDate} onChange={(event) => updateField('endDate', event.target.value)} required />
          </Field>
        </FormSection>

        <div className="sticky bottom-4 flex items-center justify-end rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
          <Button type="submit" variant="primary" size="md">Save OJT profile</Button>
        </div>
      </form>
    </div>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, required, wide, children }: { label: string; required?: boolean; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${wide ? 'md:col-span-2' : ''}`}>
      <span className="mb-2 block text-sm font-semibold text-slate-800">
        {label}{required ? <span className="ml-1 text-rose-600">*</span> : null}
      </span>
      {children}
    </label>
  );
}
