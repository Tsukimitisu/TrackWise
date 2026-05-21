import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import {
  calculateCompletedHours,
  calculateDtrHours,
  formatHours,
  loadOjtData,
  saveOjtData,
  type DtrEntry,
  type OjtData,
} from '../../features/studentOjt/ojtStorage';

export default function AttendancePage() {
  const [data, setData] = useState<OjtData>(() => loadOjtData());

  useEffect(() => {
    setData(loadOjtData());
  }, []);

  const entries = useMemo(() => [...data.dtrEntries].sort((a, b) => a.date.localeCompare(b.date)), [data.dtrEntries]);
  const completedHours = calculateCompletedHours(entries);
  const remainingHours = Math.max(data.profile.requiredHours - completedHours, 0);

  const deleteEntry = (entry: DtrEntry) => {
    if (!window.confirm(`Delete DTR entry for ${entry.date}?`)) return;
    const nextData = {
      ...data,
      dtrEntries: data.dtrEntries.filter((item) => item.id !== entry.id),
    };
    saveOjtData(nextData);
    setData(nextData);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="DTR Table"
        description="Review the daily time record for your OJT. This is built for one student tracking personal hours."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700" to="/app/time-in-out">Add entry</Link>
            <Link className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100" to="/app/printables">Printable DTR</Link>
          </div>
        }
      />

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Summary label="Total entries" value={String(entries.length)} />
        <Summary label="Completed hours" value={formatHours(completedHours)} />
        <Summary label="Hours remaining" value={formatHours(remainingHours)} />
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Daily Time Record</h2>
          <p className="text-sm text-slate-600">Student: {data.profile.studentName || 'Not set'} | Required hours: {formatHours(data.profile.requiredHours)}</p>
        </div>

        {entries.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Time in</th>
                  <th className="px-4 py-3 font-semibold">Time out</th>
                  <th className="px-4 py-3 font-semibold">Break</th>
                  <th className="px-4 py-3 font-semibold">Hours</th>
                  <th className="px-4 py-3 font-semibold">Activities</th>
                  <th className="px-4 py-3 font-semibold">Signature</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => (
                  <tr key={entry.id} className="align-top">
                    <td className="px-4 py-3 font-medium text-slate-900">{entry.date}</td>
                    <td className="px-4 py-3 text-slate-700">{entry.timeIn}</td>
                    <td className="px-4 py-3 text-slate-700">{entry.timeOut}</td>
                    <td className="px-4 py-3 text-slate-700">{entry.breakMinutes} min</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatHours(calculateDtrHours(entry))}</td>
                    <td className="max-w-md px-4 py-3 text-slate-700">{entry.activities}</td>
                    <td className="px-4 py-3 text-slate-700">{entry.signatureName || data.profile.studentName || 'Unsigned'}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => deleteEntry(entry)} className="text-sm font-semibold text-rose-700 hover:text-rose-800">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-200 bg-slate-50">
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900" colSpan={4}>Total rendered hours</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{formatHours(completedHours)}</td>
                  <td className="px-4 py-3" colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-slate-600">
            No DTR entries yet. Add your first time-in and time-out record to start tracking hours.
          </div>
        )}
      </section>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
