import { useEffect, useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import {
  calculateCompletedHours,
  calculateDtrHours,
  formatHours,
  loadOjtData,
  saveOjtData,
  type OjtData,
} from '../../features/studentOjt/ojtStorage';

export default function PrintableReportsPage() {
  const [data, setData] = useState<OjtData>(() => loadOjtData());
  const [signatureName, setSignatureName] = useState('');

  useEffect(() => {
    const current = loadOjtData();
    setData(current);
    setSignatureName(current.dtrEntries.at(-1)?.signatureName || current.profile.studentName || '');
  }, []);

  const entries = useMemo(() => [...data.dtrEntries].sort((a, b) => a.date.localeCompare(b.date)), [data.dtrEntries]);
  const completedHours = calculateCompletedHours(entries);
  const remainingHours = Math.max(data.profile.requiredHours - completedHours, 0);

  const saveSignatureToRows = () => {
    const nextData = {
      ...data,
      dtrEntries: data.dtrEntries.map((entry) => ({ ...entry, signatureName })),
    };
    saveOjtData(nextData);
    setData(nextData);
  };

  const printDtr = () => {
    saveSignatureToRows();
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-3">
      <div className="print:hidden">
        <PageHeader
          title="Printable DTR"
          description="Generate a print-ready Daily Time Record with signature fields."
          actions={
            <Button type="button" onClick={printDtr} variant="primary" size="md">
              Print / Save PDF
            </Button>
          }
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm print:hidden">
        <label className="block max-w-xl">
          <span className="mb-2 block text-sm font-semibold text-slate-800">Signature name to apply to DTR rows</span>
          <input
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            value={signatureName}
            onChange={(event) => setSignatureName(event.target.value)}
            placeholder="Type your full name"
          />
        </label>
        <p className="mt-3 text-sm text-slate-600">This name is printed as the student signature reference. The sheet also includes blank signature lines for handwritten approval.</p>
      </section>

      <main className="rounded-xl border border-slate-300 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Daily Time Record</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">On-the-Job Training Hours</h1>
          <p className="mt-1 text-sm text-slate-600">{data.profile.school || 'School name'} | {data.profile.course || 'Course / section'}</p>
        </header>

        <section className="mt-8 grid gap-3 text-sm sm:grid-cols-2 print:grid-cols-2">
          <Info label="Student" value={data.profile.studentName || 'Student Trainee'} />
          <Info label="Student no." value={data.profile.studentNumber || 'Not set'} />
          <Info label="OJT site" value={data.profile.ojtSite || 'Not set'} />
          <Info label="Supervisor" value={data.profile.supervisorName || 'Not set'} />
          <Info label="Training dates" value={`${data.profile.startDate || 'Start'} to ${data.profile.endDate || 'End'}`} />
          <Info label="Required hours" value={formatHours(data.profile.requiredHours)} />
        </section>

        <section className="mt-6 overflow-x-auto">
          <table className="min-w-full border border-slate-400 text-left text-xs print:text-[10px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="border border-slate-400 px-2 py-2 font-bold">Date</th>
                <th className="border border-slate-400 px-2 py-2 font-bold">Time In</th>
                <th className="border border-slate-400 px-2 py-2 font-bold">Time Out</th>
                <th className="border border-slate-400 px-2 py-2 font-bold">Break</th>
                <th className="border border-slate-400 px-2 py-2 font-bold">Hours</th>
                <th className="border border-slate-400 px-2 py-2 font-bold">Activities</th>
                <th className="border border-slate-400 px-2 py-2 font-bold">Student Signature</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="align-top">
                  <td className="border border-slate-400 px-2 py-2">{entry.date}</td>
                  <td className="border border-slate-400 px-2 py-2">{entry.timeIn}</td>
                  <td className="border border-slate-400 px-2 py-2">{entry.timeOut}</td>
                  <td className="border border-slate-400 px-2 py-2">{entry.breakMinutes} min</td>
                  <td className="border border-slate-400 px-2 py-2">{formatHours(calculateDtrHours(entry))}</td>
                  <td className="border border-slate-400 px-2 py-2">{entry.activities}</td>
                  <td className="border border-slate-400 px-2 py-2">{entry.signatureName || signatureName || data.profile.studentName}</td>
                </tr>
              ))}
              {!entries.length ? (
                <tr>
                  <td className="border border-slate-400 px-2 py-8 text-center text-slate-500" colSpan={7}>No DTR entries yet.</td>
                </tr>
              ) : null}
            </tbody>
            <tfoot className="bg-slate-100">
              <tr>
                <td className="border border-slate-400 px-2 py-2 font-bold" colSpan={4}>Total rendered hours</td>
                <td className="border border-slate-400 px-2 py-2 font-bold">{formatHours(completedHours)}</td>
                <td className="border border-slate-400 px-2 py-2 font-bold">Remaining: {formatHours(remainingHours)}</td>
                <td className="border border-slate-400 px-2 py-2" />
              </tr>
            </tfoot>
          </table>
        </section>

        <section className="mt-12 grid gap-10 text-center text-sm sm:grid-cols-3 print:grid-cols-3">
          <SignatureLine label="Student signature" value={signatureName || data.profile.studentName} />
          <SignatureLine label="OJT supervisor" value={data.profile.supervisorName} />
          <SignatureLine label="School coordinator" value="" />
        </section>
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] border-b border-slate-300 py-2">
      <span className="font-semibold text-slate-600">{label}</span>
      <span className="font-medium text-slate-950">{value}</span>
    </div>
  );
}

function SignatureLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="min-h-8 font-semibold text-slate-900">{value}</div>
      <div className="mt-2 border-t border-slate-700 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-600">{label}</div>
    </div>
  );
}
