import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import { createId, loadOjtData, saveOjtData } from '../../features/studentOjt/ojtStorage';

interface UserProgram {
  id: number;
  program?: { name: string };
}

interface DailyReport {
  id: number;
  user_program_id: number;
  report_date: string;
  tasks_done: string;
}

const fieldClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100';

export default function DocumentationUploadPage() {
  const [userPrograms, setUserPrograms] = useState<UserProgram[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [formData, setFormData] = useState({
    user_program_id: 0,
    daily_report_id: 0,
    title: '',
    caption: '',
    description: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [error, setError] = useState('');

  const cameraRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const [assignmentResult, reportResult] = await Promise.allSettled([
        client.get('/assignments'),
        client.get('/daily-reports'),
      ]);
      if (assignmentResult.status === 'fulfilled') {
        const payload = assignmentResult.value.data.data || assignmentResult.value.data;
        const list = Array.isArray(payload) ? payload : [];
        setUserPrograms(list);
        if (list.length) setFormData((current) => ({ ...current, user_program_id: list[0].id }));
      }
      if (reportResult.status === 'fulfilled') {
        const payload = reportResult.value.data.data || reportResult.value.data;
        setDailyReports(Array.isArray(payload) ? payload : []);
      }
    };
    void load();
    return () => stopCamera();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      setError('The selected image must be 5 MB or smaller.');
      return;
    }
    setError('');
    setFile(selected);
    stopCamera();
    const reader = new FileReader();
    reader.onload = (loadEvent) => setPreview((loadEvent.target?.result as string) || '');
    reader.readAsDataURL(selected);
  };

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      setUseCamera(true);
      window.setTimeout(() => {
        if (cameraRef.current) cameraRef.current.srcObject = stream;
      }, 0);
    } catch {
      setError('Camera access was unavailable. Check browser permission or upload an image instead.');
    }
  };

  const stopCamera = () => {
    const stream = cameraRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
    if (cameraRef.current) cameraRef.current.srcObject = null;
    setUseCamera(false);
  };

  const capturePhoto = () => {
    const video = cameraRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const photo = new File([blob], `ojt-documentation-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setFile(photo);
      setPreview(canvas.toDataURL('image/jpeg', 0.9));
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Upload or capture an image before saving.');
      return;
    }
    if (!formData.user_program_id) {
      setError('Select an OJT assignment before saving.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      const payload = new FormData();
      payload.append('user_program_id', String(formData.user_program_id));
      payload.append('file', file);
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      if (formData.caption.trim()) payload.append('caption', formData.caption.trim());
      if (formData.daily_report_id) payload.append('daily_report_id', String(formData.daily_report_id));
      await client.post('/documentation-files', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      const localData = loadOjtData();
      saveOjtData({
        ...localData,
        documentation: [{
          id: createId('doc'),
          title: formData.title.trim(),
          date: new Date().toISOString().slice(0, 10),
          description: formData.description.trim(),
          evidenceType: 'photo',
          fileName: file.name,
        }, ...localData.documentation],
      });
      navigate('/app/documents');
    } catch (uploadError: any) {
      const message = uploadError.response?.data?.message;
      setError(message || 'The image could not be uploaded. Check the required details and try again.');
    } finally {
      setUploading(false);
    }
  };

  const matchingReports = dailyReports.filter((report) => !formData.user_program_id || report.user_program_id === formData.user_program_id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Work evidence"
        title="Add Documentation"
        description="Capture or upload a clear image, explain what it shows, and connect it to the correct daily log."
      />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">1. Add a photo</h2>
          <p className="mt-1 text-sm text-slate-500">JPG, PNG, or WebP up to 5 MB.</p>

          <div className="mt-5 overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
            {useCamera ? (
              <div className="p-3">
                <video ref={cameraRef} autoPlay playsInline muted className="aspect-[4/3] w-full rounded-xl bg-slate-950 object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button type="button" onClick={capturePhoto} className="rounded-xl bg-teal-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-teal-400">Capture photo</button>
                  <button type="button" onClick={stopCamera} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                </div>
              </div>
            ) : preview ? (
              <div className="relative">
                <img src={preview} alt="Documentation preview" className="aspect-[4/3] w-full object-contain" />
                <button type="button" onClick={() => { setFile(null); setPreview(''); }} className="absolute right-3 top-3 rounded-lg bg-slate-950/80 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-950">Remove</button>
              </div>
            ) : (
              <div className="grid min-h-80 place-items-center p-8 text-center">
                <div>
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-100 text-2xl text-teal-800">▧</span>
                  <p className="mt-4 font-bold text-slate-900">Add your work documentation</p>
                  <p className="mt-1 text-sm text-slate-500">Use a well-lit photo that clearly shows the completed work.</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-xl bg-[#10233f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#18345b]">Upload image</button>
                    <button type="button" onClick={startCamera} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Open camera</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleFileSelect} className="hidden" />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">2. Describe and attach</h2>
          <p className="mt-1 text-sm text-slate-500">Required details make the evidence clear to reviewers.</p>

          <div className="mt-5 space-y-5">
            <Field label="OJT assignment" required>
              <select className={fieldClass} value={formData.user_program_id} onChange={(event) => setFormData((current) => ({ ...current, user_program_id: Number(event.target.value), daily_report_id: 0 }))} required>
                <option value={0}>Select assignment</option>
                {userPrograms.map((assignment) => <option key={assignment.id} value={assignment.id}>{assignment.program?.name ?? `Assignment #${assignment.id}`}</option>)}
              </select>
            </Field>
            <Field label="Attach to daily log">
              <select className={fieldClass} value={formData.daily_report_id} onChange={(event) => setFormData((current) => ({ ...current, daily_report_id: Number(event.target.value) }))}>
                <option value={0}>No daily log selected</option>
                {matchingReports.map((report) => <option key={report.id} value={report.id}>{report.report_date} — {report.tasks_done.slice(0, 45)}</option>)}
              </select>
            </Field>
            <Field label="Image title" required>
              <input className={fieldClass} value={formData.title} onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. Network cable installation" maxLength={150} required />
            </Field>
            <Field label="Short caption">
              <input className={fieldClass} value={formData.caption} onChange={(event) => setFormData((current) => ({ ...current, caption: event.target.value }))} placeholder="Caption shown below the image" maxLength={500} />
            </Field>
            <Field label="Detailed description" required>
              <textarea className={fieldClass} rows={5} value={formData.description} onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))} placeholder="Describe the task, your role, and what this image proves." maxLength={2000} required />
            </Field>
          </div>

          {error ? <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => navigate('/app/documents')} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={uploading} className="rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-bold text-[#10233f] hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-60">
              {uploading ? 'Uploading…' : 'Save documentation'}
            </button>
          </div>
        </section>
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
