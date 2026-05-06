import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';

interface UserProgram {
  id: number;
  user_id: number;
  program_id: number;
  user: { first_name: string; last_name: string };
  program: { name: string };
}

const DocumentationUploadPage = () => {
  const [userPrograms, setUserPrograms] = useState<UserProgram[]>([]);
  const [formData, setFormData] = useState({
    user_program_id: 0,
    caption: '',
    latitude: '',
    longitude: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserPrograms();
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }));
      });
    }
  }, []);

  const fetchUserPrograms = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/assignments`);
      const programs = response.data.data || response.data;
      const programArray = Array.isArray(programs) ? programs : [];
      setUserPrograms(programArray);
      if (programArray.length > 0) {
        setFormData(prev => ({ ...prev, user_program_id: programArray[0].id }));
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      setUserPrograms([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
      setUseCamera(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
        setUseCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please ensure permissions are granted.');
    }
  };

  const capturePhoto = () => {
    if (cameraRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(cameraRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasRef.current.toBlob(blob => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setFile(file);
            setPreview(canvasRef.current!.toDataURL());
            setUseCamera(false);
            // Stop camera stream
            const stream = cameraRef.current?.srcObject as MediaStream;
            stream?.getTracks().forEach(track => track.stop());
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/documentation-files`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/app/documents');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload Documentation</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Program/Assignment</label>
            <select
              name="user_program_id"
              value={formData.user_program_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a program</option>
              {userPrograms.map(up => (
                <option key={up.id} value={up.id}>
                  {up.program.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Photo/File</label>
            
            {!useCamera && (
              <div className="mb-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  📁 Choose File
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  📷 Take Photo
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {useCamera && (
              <div className="mb-4">
                <video
                  ref={cameraRef}
                  autoPlay
                  playsInline
                  className="w-full rounded mb-2 bg-black"
                  style={{ maxHeight: '400px' }}
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                  width="640"
                  height="480"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    ✓ Capture
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const stream = cameraRef.current?.srcObject as MediaStream;
                      stream?.getTracks().forEach(track => track.stop());
                      setUseCamera(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>
            )}

            {preview && (
              <div className="mb-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full rounded border border-gray-300"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
            <textarea
              name="caption"
              value={formData.caption}
              onChange={handleChange}
              placeholder="Add a caption or description for this file..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Auto-detected if available"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="Auto-detected if available"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={uploading || !file}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/documents')}
              className="flex-1 px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
};

export default DocumentationUploadPage;
