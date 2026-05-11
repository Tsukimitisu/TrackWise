import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client'; interface UserProgram {
  id: number;
  program: { name: string };
}

export default function DocumentationUploadPage() {
  const [userPrograms, setUserPrograms] = useState<UserProgram[]>([]);
  const [formData, setFormData] = useState({ user_program_id: 0, caption: '', latitude: '', longitude: '' });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [useCamera, setUseCamera] = useState(false);

  const cameraRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserPrograms().catch(() => {});
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }));
      });
    }
  }, []);

  const fetchUserPrograms = async () => {
    const response = await client.get(`/assignments`);
    const programs = response.data.data || response.data;
    const list = Array.isArray(programs) ? programs : [];
    setUserPrograms(list);
    if (list.length > 0) setFormData((prev) => ({ ...prev, user_program_id: list[0].id }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setUseCamera(false);
    const reader = new FileReader();
    reader.onload = (evt) => setPreview((evt.target?.result as string) || '');
    reader.readAsDataURL(selected);
  };

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    if (cameraRef.current) {
      cameraRef.current.srcObject = stream;
      setUseCamera(true);
    }
  };

  const stopCamera = () => {
    const stream = cameraRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
    setUseCamera(false);
  };

  const capturePhoto = () => {
    if (!cameraRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    context.drawImage(cameraRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const photo = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setFile(photo);
      setPreview(canvasRef.current!.toDataURL());
      stopCamera();
    }, 'image/jpeg');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.user_program_id) {
      alert('Please select a file and program');
      return;
    }

    try {
      setUploading(true);
      const data = new FormData();
      data.append('user_program_id', formData.user_program_id.toString());
      data.append('file', file);
      if (formData.caption) data.append('caption', formData.caption);
      if (formData.latitude) data.append('latitude', formData.latitude);
      if (formData.longitude) data.append('longitude', formData.longitude);

      await client.post(`/documentation-files`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/app/documents');
    } catch {
      alert('Error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Upload Documentation</h1>
      <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black">
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">Program/Assignment</label>
          <select
            name="user_program_id"
            value={formData.user_program_id}
            onChange={(e) => setFormData((prev) => ({ ...prev, user_program_id: Number(e.target.value) || 0 }))}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-black"
            required
          >
            <option value="">Select a program</option>
            {userPrograms.map((up) => (
              <option key={up.id} value={up.id}>{up.program.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Photo/File</label>
          {!useCamera ? (
            <div className="mb-4 flex gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded bg-black px-4 py-2 text-white hover:bg-gray-900">Choose File</button>
              <button type="button" onClick={startCamera} className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-900">Take Photo</button>
            </div>
          ) : null}

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

          {useCamera ? (
            <div className="mb-4">
              <video ref={cameraRef} autoPlay playsInline className="mb-2 w-full rounded bg-black" style={{ maxHeight: '400px' }} />
              <canvas ref={canvasRef} className="hidden" width="640" height="480" />
              <div className="flex gap-2">
                <button type="button" onClick={capturePhoto} className="flex-1 rounded bg-black px-4 py-2 text-white hover:bg-gray-900">Capture</button>
                <button type="button" onClick={stopCamera} className="flex-1 rounded border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-900">Cancel</button>
              </div>
            </div>
          ) : null}

          {preview ? <img src={preview} alt="Preview" className="w-full rounded border border-gray-300" style={{ maxHeight: '300px', objectFit: 'contain' }} /> : null}
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">Caption</label>
          <textarea
            name="caption"
            value={formData.caption}
            onChange={(e) => setFormData((prev) => ({ ...prev, caption: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-black"
            rows={3}
          />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Latitude"
            value={formData.latitude}
            onChange={(e) => setFormData((prev) => ({ ...prev, latitude: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-black"
          />
          <input
            type="text"
            placeholder="Longitude"
            value={formData.longitude}
            onChange={(e) => setFormData((prev) => ({ ...prev, longitude: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-black"
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={uploading || !file} className="flex-1 rounded bg-black px-6 py-2 text-white hover:bg-gray-900 disabled:opacity-50">
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
          <button type="button" onClick={() => navigate('/app/documents')} className="flex-1 rounded border border-gray-300 px-6 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-900">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
