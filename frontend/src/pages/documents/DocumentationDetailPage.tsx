import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import AppShell from '../../components/AppShell';

interface DocumentationFile {
  id: number;
  user_program_id: number;
  file_url: string;
  file_type: string;
  caption?: string;
  taken_at: string;
  latitude?: number;
  longitude?: number;
  daily_report_id?: number;
  weekly_report_id?: number;
  attendance_log_id?: number;
  userProgram?: {
    user: { first_name: string; last_name: string };
    program: { name: string };
  };
}

const DocumentationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [file, setFile] = useState<DocumentationFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFile();
  }, [id]);

  const fetchFile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/documentation-files/${id}`);
      setFile(response.data);
      setCaption(response.data.caption || '');
      setLatitude(response.data.latitude?.toString() || '');
      setLongitude(response.data.longitude?.toString() || '');
    } catch (error) {
      console.error('Error fetching file:', error);
      navigate('/app/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/documentation-files/${id}`, {
        caption,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      });
      setFile(response.data);
      setEditing(false);
    } catch (error) {
      console.error('Error updating file:', error);
      alert('Error updating file');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/documentation-files/${id}`);
      navigate('/app/documents');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  if (loading) return <AppShell><div className="text-center py-8">Loading...</div></AppShell>;
  if (!file) return <AppShell><div className="text-center py-8 text-red-600">File not found</div></AppShell>;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Documentation File</h1>
          <button
            onClick={() => navigate('/app/documents')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-6">
            <img
              src={file.file_url}
              alt={file.caption || 'Documentation'}
              className="w-full rounded border border-gray-300"
              style={{ maxHeight: '500px', objectFit: 'contain' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Program</p>
              <p className="text-lg font-semibold">{file.userProgram?.program.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Student</p>
              <p className="text-lg font-semibold">
                {file.userProgram?.user.first_name} {file.userProgram?.user.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Taken At</p>
              <p className="text-lg font-semibold">
                {new Date(file.taken_at).toLocaleDateString()} {new Date(file.taken_at).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">File Type</p>
              <p className="text-lg font-semibold">{file.file_type}</p>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={e => setLatitude(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={e => setLongitude(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {file.caption && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Caption</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{file.caption}</p>
                </div>
              )}

              {(file.latitude || file.longitude) && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="text-gray-900">
                    📍 {file.latitude?.toFixed(4)}, {file.longitude?.toFixed(4)}
                    {file.latitude && file.longitude && (
                      <a
                        href={`https://maps.google.com/?q=${file.latitude},${file.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        (View on Maps)
                      </a>
                    )}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default DocumentationDetailPage;
