import { FormEvent, useEffect, useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import {
  createId,
  loadOjtData,
  saveOjtData,
  type DocumentationItem,
  type OjtData,
} from '../../features/studentOjt/ojtStorage';

const fieldClass = 'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

const requirements = [
  'Daily Time Record entries',
  'Narrative report',
  'Documentation photos or evidence',
  'Supervisor signature',
  'School coordinator signature',
  'Completion hours summary',
];

const blankItem = (): Omit<DocumentationItem, 'id'> => ({
  title: '',
  date: new Date().toISOString().slice(0, 10),
  description: '',
  evidenceType: 'photo',
  fileName: '',
});

export default function DocumentationPage() {
  const [data, setData] = useState<OjtData>(() => loadOjtData());
  const [item, setItem] = useState<Omit<DocumentationItem, 'id'>>(blankItem);

  useEffect(() => {
    setData(loadOjtData());
  }, []);

  const progress = useMemo(() => {
    const completed = [
      data.dtrEntries.length > 0,
      data.narrativeReports.length > 0,
      data.documentation.length > 0,
      data.profile.supervisorName.length > 0,
      false,
      data.profile.requiredHours > 0,
    ].filter(Boolean).length;
    return { completed, total: requirements.length };
  }, [data]);

  const updateField = (key: keyof Omit<DocumentationItem, 'id'>, value: string) => {
    setItem((current) => ({ ...current, [key]: value }));
  };

  const addDocumentation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const current = loadOjtData();
    const nextItem: DocumentationItem = { ...item, id: createId('doc') };
    const nextData = {
      ...current,
      documentation: [nextItem, ...current.documentation],
    };
    saveOjtData(nextData);
    setData(nextData);
    setItem(blankItem());
  };

  const deleteDocumentation = (id: string) => {
    if (!window.confirm('Delete this documentation item?')) return;
    const nextData = {
      ...data,
      documentation: data.documentation.filter((document) => document.id !== id),
    };
    saveOjtData(nextData);
    setData(nextData);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="OJT Documentation"
        description="Track photos, certificates, memos, and other proof of your OJT activities."
      />

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Requirement Checklist</h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{progress.completed}/{progress.total}</span>
          </div>
          <div className="space-y-3">
            {requirements.map((requirement, index) => {
              const done = index === 0
                ? data.dtrEntries.length > 0
                : index === 1
                  ? data.narrativeReports.length > 0
                  : index === 2
                    ? data.documentation.length > 0
                    : index === 3
                      ? data.profile.supervisorName.length > 0
                      : index === 5
                        ? data.profile.requiredHours > 0
                        : false;
              return (
                <div key={requirement} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {done ? 'Y' : ''}
                  </span>
                  <span className="text-sm font-medium text-slate-800">{requirement}</span>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={addDocumentation} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Add Documentation Item</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Title">
              <input className={fieldClass} value={item.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Example: Week 1 office task photo" required />
            </Field>
            <Field label="Date">
              <input className={fieldClass} type="date" value={item.date} onChange={(event) => updateField('date', event.target.value)} required />
            </Field>
            <Field label="Evidence type">
              <select className={fieldClass} value={item.evidenceType} onChange={(event) => updateField('evidenceType', event.target.value)}>
                <option value="photo">Photo</option>
                <option value="certificate">Certificate</option>
                <option value="memo">Memo</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="File name or link">
              <input className={fieldClass} value={item.fileName} onChange={(event) => updateField('fileName', event.target.value)} placeholder="filename.jpg or shared link" />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="Description">
              <textarea className={fieldClass} rows={5} value={item.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Describe what this evidence proves." required />
            </Field>
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="submit" variant="primary" size="md">
              Add documentation
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Documentation Log</h2>
        {data.documentation.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.documentation.map((document) => (
              <article key={document.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">{document.evidenceType}</p>
                    <h3 className="mt-1 font-bold text-slate-900">{document.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{document.date}</p>
                  </div>
                  <button type="button" onClick={() => deleteDocumentation(document.id)} className="text-sm font-semibold text-rose-700 hover:text-rose-800">Delete</button>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{document.description}</p>
                {document.fileName ? <p className="mt-3 rounded bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">{document.fileName}</p> : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600">
            No documentation items yet.
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
