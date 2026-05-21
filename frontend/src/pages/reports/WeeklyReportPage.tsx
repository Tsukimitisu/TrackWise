import { FormEvent, useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import {
  createId,
  loadOjtData,
  saveOjtData,
  type NarrativeReport,
  type OjtData,
} from '../../features/studentOjt/ojtStorage';

const fieldClass = 'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

const blankReport = (): Omit<NarrativeReport, 'id'> => ({
  title: 'Weekly Narrative Report',
  periodStart: '',
  periodEnd: '',
  activities: '',
  learnings: '',
  challenges: '',
  reflection: '',
});

export default function WeeklyReportPage() {
  const [data, setData] = useState<OjtData>(() => loadOjtData());
  const [form, setForm] = useState<Omit<NarrativeReport, 'id'>>(blankReport);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    setData(loadOjtData());
  }, []);

  const updateField = (key: keyof Omit<NarrativeReport, 'id'>, value: string) => {
    setSavedMessage('');
    setForm((current) => ({ ...current, [key]: value }));
  };

  const generateDraft = () => {
    const entries = data.dtrEntries.filter((entry) => {
      if (!form.periodStart || !form.periodEnd) return true;
      return entry.date >= form.periodStart && entry.date <= form.periodEnd;
    });

    const activities = entries.map((entry) => `${entry.date}: ${entry.activities}`).join('\n');
    setForm((current) => ({
      ...current,
      activities: activities || current.activities,
      learnings: current.learnings || 'I improved my workplace discipline, task documentation, and ability to complete assigned OJT activities.',
      challenges: current.challenges || 'The main challenge this period was balancing accuracy, speed, and unfamiliar work procedures.',
      reflection: current.reflection || 'This OJT period helped me connect classroom learning with actual workplace tasks and professional expectations.',
    }));
  };

  const saveReport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const current = loadOjtData();
    const nextReport: NarrativeReport = { ...form, id: createId('narrative') };
    const nextData = {
      ...current,
      narrativeReports: [nextReport, ...current.narrativeReports],
    };
    saveOjtData(nextData);
    setData(nextData);
    setForm(blankReport());
    setSavedMessage('Narrative report saved.');
  };

  const deleteReport = (id: string) => {
    if (!window.confirm('Delete this narrative report?')) return;
    const nextData = {
      ...data,
      narrativeReports: data.narrativeReports.filter((report) => report.id !== id),
    };
    saveOjtData(nextData);
    setData(nextData);
  };

  return (
    <div className="space-y-8 animate-fade-in print:space-y-4">
      <div className="print:hidden">
        <PageHeader
          title="Narrative Report Maker"
          description="Draft, save, and print narrative reports for your personal OJT documentation."
          actions={
            <Button type="button" onClick={() => window.print()} variant="secondary" size="md">
              Print reports
            </Button>
          }
        />
      </div>

      <form onSubmit={saveReport} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:hidden">
        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Report title">
            <input className={fieldClass} value={form.title} onChange={(event) => updateField('title', event.target.value)} required />
          </Field>
          <Field label="Period start">
            <input className={fieldClass} type="date" value={form.periodStart} onChange={(event) => updateField('periodStart', event.target.value)} required />
          </Field>
          <Field label="Period end">
            <input className={fieldClass} type="date" value={form.periodEnd} onChange={(event) => updateField('periodEnd', event.target.value)} required />
          </Field>
        </div>

        <div className="mt-5 grid gap-5">
          <Field label="Activities / accomplishments">
            <textarea className={fieldClass} rows={6} value={form.activities} onChange={(event) => updateField('activities', event.target.value)} required />
          </Field>
          <Field label="Skills learned">
            <textarea className={fieldClass} rows={4} value={form.learnings} onChange={(event) => updateField('learnings', event.target.value)} />
          </Field>
          <Field label="Challenges encountered">
            <textarea className={fieldClass} rows={4} value={form.challenges} onChange={(event) => updateField('challenges', event.target.value)} />
          </Field>
          <Field label="Reflection">
            <textarea className={fieldClass} rows={4} value={form.reflection} onChange={(event) => updateField('reflection', event.target.value)} />
          </Field>
        </div>

        {savedMessage ? <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{savedMessage}</div> : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" onClick={generateDraft} variant="secondary" size="md">
            Generate from DTR
          </Button>
          <Button type="submit" variant="primary" size="md">
            Save narrative
          </Button>
        </div>
      </form>

      <section className="space-y-4">
        {data.narrativeReports.length ? data.narrativeReports.map((report) => (
          <article key={report.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:break-inside-avoid print:border-slate-300 print:shadow-none">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Narrative Report</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">{report.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{report.periodStart} to {report.periodEnd}</p>
              </div>
              <button type="button" onClick={() => deleteReport(report.id)} className="text-sm font-semibold text-rose-700 hover:text-rose-800 print:hidden">
                Delete
              </button>
            </div>
            <ReportSection title="Activities and Accomplishments" body={report.activities} />
            <ReportSection title="Skills Learned" body={report.learnings} />
            <ReportSection title="Challenges Encountered" body={report.challenges} />
            <ReportSection title="Reflection" body={report.reflection} />
          </article>
        )) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600 print:hidden">
            No narrative reports yet. Create one from your DTR entries.
          </div>
        )}
      </section>
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

function ReportSection({ title, body }: { title: string; body: string }) {
  return (
    <section className="mt-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">{title}</h3>
      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-800">{body || 'No details provided.'}</p>
    </section>
  );
}
