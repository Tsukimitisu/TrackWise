import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import { type Assignment, type AttendanceLog, unwrapList } from '../../features/studentOjt/apiTypes';

interface DailyReportOption { id: number; user_program_id: number; report_date: string; tasks_done: string; }

export default function DocumentationUploadPage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [reports, setReports] = useState<DailyReportOption[]>([]);
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [assignmentId, setAssignmentId] = useState(0);
  const [attachment, setAttachment] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([client.get('/assignments'), client.get('/daily-reports'), client.get('/attendance-logs')])
      .then(([assignmentResponse, reportResponse, attendanceResponse]) => {
        const nextAssignments = unwrapList<Assignment>(assignmentResponse.data);
        setAssignments(nextAssignments);
        setAssignmentId(nextAssignments[0]?.id || 0);
        setReports(unwrapList<DailyReportOption>(reportResponse.data));
        setAttendance(unwrapList<AttendanceLog>(attendanceResponse.data));
      })
      .catch(() => setError('Assignment records could not be loaded.'));
  }, []);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const chooseFile = (nextFile?: File) => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(nextFile || null);
    setPreview(nextFile ? URL.createObjectURL(nextFile) : '');
    setError('');
  };

  const options = [
    ...reports.filter((report) => report.user_program_id === assignmentId).map((report) => ({
      value: `daily:${report.id}`, label: `Daily log · ${report.report_date.slice(0, 10)}`,
    })),
    ...attendance.filter((log) => log.user_program_id === assignmentId).map((log) => ({
      value: `attendance:${log.id}`, label: `Attendance · ${log.date.slice(0, 10)}`,
    })),
  ];

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file || !assignmentId || !attachment) {
      setError('Choose an image and attach it to a daily log or attendance record.');
      return;
    }
    const [type, id] = attachment.split(':');
    const body = new FormData();
    body.append('file', file);
    body.append('user_program_id', String(assignmentId));
    body.append('title', title.trim());
    body.append('description', description.trim());
    body.append(type === 'daily' ? 'daily_report_id' : 'attendance_log_id', id);
    setBusy(true);
    try {
      await client.post('/documentation-files', body);
      navigate('/app/documents');
    } catch (requestError: any) {
      const errors = requestError.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(' ') : requestError.response?.data?.message || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Upload documentation" description="Capture or upload an image, add meaningful metadata, and connect it to the correct OJT record." />
      <form onSubmit={submit} className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <div className="space-y-5">
          <Field label="OJT assignment">
            <select value={assignmentId} onChange={(event) => { setAssignmentId(Number(event.target.value)); setAttachment(''); }} className={fieldClass} required>
              {assignments.map((assignment) => <option key={assignment.id} value={assignment.id}>{assignment.program?.name}</option>)}
            </select>
          </Field>
          <Field label="Attach to">
            <select value={attachment} onChange={(event) => setAttachment(event.target.value)} className={fieldClass} required>
              <option value="">Choose a daily log or attendance record</option>
              {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </Field>
          <Field label="Image title">
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={150} className={fieldClass} required />
          </Field>
          <Field label="Description">
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} maxLength={2000} className={fieldClass} required />
          </Field>
        </div>

        <div>
          <label className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-blue-500">
            {preview ? <img src={preview} alt="Upload preview" className="max-h-72 rounded-lg object-contain" /> : <><strong className="text-slate-900">Open camera or choose image</strong><span className="mt-2 text-sm text-slate-500">JPEG, PNG, GIF, or WebP up to 5 MB</span></>}
            <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} />
          </label>
          {error ? <div role="alert" className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{error}</div> : null}
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/app/documents')} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold">Cancel</button>
            <button type="submit" disabled={busy} className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400">{busy ? 'Uploading…' : 'Upload privately'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

const fieldClass = 'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100';
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span>{children}</label>;
}
