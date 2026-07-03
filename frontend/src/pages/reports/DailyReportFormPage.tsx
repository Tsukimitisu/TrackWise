import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';

interface UserProgram {
  id: number;
  program?: { name: string };
}

interface ReportForm {
  user_program_id: number;
  report_date: string;
  tasks: string[];
  tools_used: string;
  problems_encountered: string;
  learnings: string;
  reflection: string;
  status: string;
}

const fieldClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100';

const emptyForm = (): ReportForm => ({
  user_program_id: 0,
  report_date: new Date().toISOString().split('T')[0],
  tasks: [''],
  tools_used: '',
  problems_encountered: '',
  learnings: '',
  reflection: '',
  status: 'draft',
});

export default function DailyReportFormPage() {
  const { id } = useParams<{ id: string }>();
  const [assignments, setAssignments] = useState<UserProgram[]>([]);
  const [form, setForm] = useState<ReportForm>(emptyForm);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [assignmentResult, reportResult] = await Promise.allSettled([
        client.get('/assignments'),
        id ? client.get(`/daily-reports/${id}`) : Promise.resolve(null),
      ]);
      if (!active) return;

      if (assignmentResult.status === 'fulfilled') {
        const payload = assignmentResult.value.data.data || assignmentResult.value.data;
        const list = Array.isArray(payload) ? payload : [];
        setAssignments(list);
        if (!id && list.length) setForm((current) => ({ ...current, user_program_id: list[0].id }));
      }

      if (id && reportResult.status === 'fulfilled' && reportResult.value) {
        const report = reportResult.value.data;
        const tasks = String(report.tasks_done || '')
          .split('\n')
          .map((task: string) => task.replace(/^[•\-]\s*/, '').trim())
          .filter(Boolean);
        setForm({
          user_program_id: report.user_program_id,
          report_date: report.report_date,
          tasks: tasks.length ? tasks : [''],
          tools_used: report.tools_used || '',
          problems_encountered: report.problems_encountered || '',
          learnings: report.learnings || '',
          reflection: report.reflection || '',
          status: report.status,
        });
      } else if (id && reportResult.status === 'rejected') {
        setError('The daily log could not be loaded.');
      }
      setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, [id]);

  const tasksText = useMemo(
    () => form.tasks.map((task) => task.trim()).filter(Boolean).map((task) => `• ${task}`).join('\n'),
    [form.tasks],
  );

  const updateTask = (index: number, value: string) => {
    setForm((current) => ({ ...current, tasks: current.tasks.map((task, taskIndex) => taskIndex === index ? value : task) }));
  };

  const removeTask = (index: number) => {
    setForm((current) => ({ ...current, tasks: current.tasks.length === 1 ? [''] : current.tasks.filter((_, taskIndex) => taskIndex !== index) }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const shouldSubmit = submitter?.value === 'submit';

    if (tasksText.replace(/[•\s]/g, '').length < 10) {
      setError('Add at least one clear task description with 10 or more characters.');
      return;
    }

    const payload = {
      user_program_id: form.user_program_id,
      report_date: form.report_date,
      tasks_done: tasksText,
      tools_used: form.tools_used.trim(),
      problems_encountered: form.problems_encountered.trim(),
      learnings: form.learnings.trim(),
      reflection: form.reflection.trim(),
    };

    try {
      setSaving(true);
      setError('');
      const response = id
        ? await client.put(`/daily-reports/${id}`, payload)
        : await client.post('/daily-reports', payload);
      const reportId = id || response.data.id;
      if (shouldSubmit) await client.post(`/daily-reports/${reportId}/submit`);
      navigate(`/app/reports/daily/${reportId}`);
    } catch (saveError: any) {
      const validation = saveError.response?.data?.errors;
      const firstValidation = validation ? Object.values(validation).flat()[0] : null;
      setError(String(firstValidation || saveError.response?.data?.message || 'The daily log could not be saved. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Loading daily log…</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Work journal"
        title={id ? 'Edit Daily Log' : 'Create Daily Log'}
        description="Record all completed tasks and reflect on the skills and challenges from your workday."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-950">Log details</h2>
            <p className="mt-1 text-sm text-slate-500">Choose the correct assignment and attendance date.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="OJT assignment" required>
              <select className={fieldClass} value={form.user_program_id} onChange={(event) => setForm((current) => ({ ...current, user_program_id: Number(event.target.value) }))} disabled={Boolean(id)} required>
                <option value={0}>Select assignment</option>
                {assignments.map((assignment) => <option key={assignment.id} value={assignment.id}>{assignment.program?.name ?? `Assignment #${assignment.id}`}</option>)}
              </select>
            </Field>
            <Field label="Report date" required>
              <input className={fieldClass} type="date" max={new Date().toISOString().split('T')[0]} value={form.report_date} onChange={(event) => setForm((current) => ({ ...current, report_date: event.target.value }))} required />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Tasks accomplished</h2>
              <p className="mt-1 text-sm text-slate-500">Add each completed task as a separate item.</p>
            </div>
            <button type="button" onClick={() => setForm((current) => ({ ...current, tasks: [...current.tasks, ''] }))} className="shrink-0 rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800 hover:bg-teal-100">+ Add task</button>
          </div>
          <div className="mt-5 space-y-3">
            {form.tasks.map((task, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="mt-3 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{index + 1}</span>
                <textarea className={fieldClass} rows={2} value={task} onChange={(event) => updateTask(index, event.target.value)} placeholder="Describe what you completed and the result." required={index === 0} />
                <button type="button" onClick={() => removeTask(index)} className="mt-2 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-700" aria-label={`Remove task ${index + 1}`}>×</button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-950">Daily reflection</h2>
            <p className="mt-1 text-sm text-slate-500">Add enough context for your supervisor to understand your progress.</p>
          </div>
          <div className="grid gap-5">
            <Field label="Tools or software used">
              <textarea className={fieldClass} rows={3} value={form.tools_used} onChange={(event) => setForm((current) => ({ ...current, tools_used: event.target.value }))} placeholder="List the applications, equipment, or tools you used." />
            </Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Challenges encountered">
                <textarea className={fieldClass} rows={4} value={form.problems_encountered} onChange={(event) => setForm((current) => ({ ...current, problems_encountered: event.target.value }))} placeholder="Explain any issue and how you handled it." />
              </Field>
              <Field label="Skills learned / reflection">
                <textarea className={fieldClass} rows={4} value={form.learnings} onChange={(event) => setForm((current) => ({ ...current, learnings: event.target.value }))} placeholder="What did you learn or improve today?" />
              </Field>
            </div>
            <Field label="Reflection or remarks">
              <textarea className={fieldClass} rows={4} value={form.reflection} onChange={(event) => setForm((current) => ({ ...current, reflection: event.target.value }))} placeholder="Reflect on your contribution, progress, and next steps." />
            </Field>
          </div>
        </section>

        {error ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

        <div className="sticky bottom-4 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-end">
          <button type="button" onClick={() => navigate('/app/reports/daily')} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" value="draft" disabled={saving} className="rounded-xl border border-[#10233f] px-5 py-2.5 text-sm font-bold text-[#10233f] hover:bg-slate-50 disabled:opacity-60">
            {saving ? 'Saving…' : 'Save draft'}
          </button>
          <button type="submit" value="submit" disabled={saving} className="rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-bold text-[#10233f] hover:bg-teal-400 disabled:opacity-60">
            {saving ? 'Submitting…' : 'Save and submit'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">{label}{required ? <span className="ml-1 text-rose-600">*</span> : null}</span>
      {children}
    </label>
  );
}
