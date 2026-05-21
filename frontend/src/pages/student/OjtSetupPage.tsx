import { FormEvent, useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import { defaultProfile, loadOjtData, saveOjtData, type StudentOjtProfile } from '../../features/studentOjt/ojtStorage';

const fieldClass = 'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

export default function OjtSetupPage() {
  const [profile, setProfile] = useState<StudentOjtProfile>(defaultProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(loadOjtData().profile);
  }, []);

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
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <PageHeader
        title="OJT Setup"
        description="Set up your personal OJT tracker. No company account or organization setup is required."
      />

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Student name">
            <input className={fieldClass} value={profile.studentName} onChange={(event) => updateField('studentName', event.target.value)} />
          </Field>
          <Field label="Student number">
            <input className={fieldClass} value={profile.studentNumber} onChange={(event) => updateField('studentNumber', event.target.value)} />
          </Field>
          <Field label="Course / section">
            <input className={fieldClass} value={profile.course} onChange={(event) => updateField('course', event.target.value)} placeholder="BSIT 4A" />
          </Field>
          <Field label="School">
            <input className={fieldClass} value={profile.school} onChange={(event) => updateField('school', event.target.value)} />
          </Field>
          <Field label="OJT site / company">
            <input className={fieldClass} value={profile.ojtSite} onChange={(event) => updateField('ojtSite', event.target.value)} />
          </Field>
          <Field label="Supervisor / evaluator">
            <input className={fieldClass} value={profile.supervisorName} onChange={(event) => updateField('supervisorName', event.target.value)} />
          </Field>
          <Field label="Required hours">
            <input
              className={fieldClass}
              type="number"
              min="1"
              value={profile.requiredHours}
              onChange={(event) => updateField('requiredHours', event.target.value)}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Start date">
              <input className={fieldClass} type="date" value={profile.startDate} onChange={(event) => updateField('startDate', event.target.value)} />
            </Field>
            <Field label="End date">
              <input className={fieldClass} type="date" value={profile.endDate} onChange={(event) => updateField('endDate', event.target.value)} />
            </Field>
          </div>
        </div>

        {saved ? (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            OJT setup saved.
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <Button type="submit" variant="primary" size="md">
            Save setup
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span>
      {children}
    </label>
  );
}
