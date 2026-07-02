import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import {
  calculateDtrHours,
  createId,
  formatHours,
  loadOjtData,
  saveOjtData,
  type DtrEntry,
} from '../../features/studentOjt/ojtStorage';

const fieldClass = 'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

const blankEntry = (): Omit<DtrEntry, 'id'> => ({
  date: new Date().toISOString().slice(0, 10),
  timeIn: '08:00',
  timeOut: '17:00',
  breakMinutes: 60,
  attendanceStatus: 'Present',
  activities: '',
  remarks: '',
  signatureName: '',
});

export default function TimeInOutPage() {
  const [entry, setEntry] = useState<Omit<DtrEntry, 'id'>>(blankEntry);
  const [recent, setRecent] = useState<DtrEntry[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setRecent(loadOjtData().dtrEntries.slice(-5).reverse());
  }, []);

  const updateField = (key: keyof Omit<DtrEntry, 'id'>, value: string) => {
    setMessage(null);
    setEntry((current) => ({
      ...current,
      [key]: key === 'breakMinutes' ? Number(value || 0) : value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = loadOjtData();
    const nextEntry: DtrEntry = {
      ...entry,
      id: createId('dtr'),
      activities: entry.activities.trim(),
      remarks: entry.remarks.trim(),
      signatureName: entry.signatureName.trim(),
    };
    const nextEntries = [...data.dtrEntries, nextEntry].sort((a, b) => a.date.localeCompare(b.date));
    saveOjtData({ ...data, dtrEntries: nextEntries });
    setRecent(nextEntries.slice(-5).reverse());
    setEntry(blankEntry());
    setMessage('DTR entry saved.');
  };

  const renderedHours = calculateDtrHours(entry);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Time In / Time Out"
        description="Add one daily OJT entry at a time. Entries become part of your printable DTR."
        actions={
          <Link className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100" to="/app/attendance">View DTR table</Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Date">
              <input className={fieldClass} type="date" value={entry.date} onChange={(event) => updateField('date', event.target.value)} required />
            </Field>
            <Field label="Student signature name">
              <input className={fieldClass} value={entry.signatureName} onChange={(event) => updateField('signatureName', event.target.value)} placeholder="Name to appear on DTR" />
            </Field>
            <Field label="Time in">
              <input className={fieldClass} type="time" value={entry.timeIn} onChange={(event) => updateField('timeIn', event.target.value)} required />
            </Field>
            <Field label="Time out">
              <input className={fieldClass} type="time" value={entry.timeOut} onChange={(event) => updateField('timeOut', event.target.value)} required />
            </Field>
            <Field label="Break minutes">
              <input className={fieldClass} type="number" min="0" value={entry.breakMinutes} onChange={(event) => updateField('breakMinutes', event.target.value)} />
            </Field>
            <Field label="Attendance status">
              <select className={fieldClass} value={entry.attendanceStatus} onChange={(event) => updateField('attendanceStatus', event.target.value)}>
                <option>Present</option>
                <option>Late</option>
                <option>Half day</option>
                <option>Absent</option>
              </select>
            </Field>
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Rendered hours</p>
              <p className="mt-1 text-3xl font-bold text-blue-900">{formatHours(renderedHours)}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-5">
            <Field label="Activities performed">
              <textarea
                className={fieldClass}
                rows={5}
                value={entry.activities}
                onChange={(event) => updateField('activities', event.target.value)}
                placeholder="Example: Encoded records, assisted users, documented troubleshooting steps."
                required
              />
            </Field>
            <Field label="Remarks">
              <textarea className={fieldClass} rows={3} value={entry.remarks} onChange={(event) => updateField('remarks', event.target.value)} placeholder="Optional notes for your DTR." />
            </Field>
          </div>

          {message ? <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</div> : null}

          <div className="mt-6 flex justify-end">
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Save DTR entry</button>
          </div>
        </form>

        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Recent Entries</h2>
          <div className="mt-4 space-y-3">
            {recent.length ? recent.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{item.date}</p>
                  <p className="text-sm font-semibold text-blue-700">{formatHours(calculateDtrHours(item))} hrs</p>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.timeIn} - {item.timeOut}</p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-700">{item.activities}</p>
              </div>
            )) : (
              <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">No DTR entries yet.</p>
            )}
          </div>
        </aside>
      </div>
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
