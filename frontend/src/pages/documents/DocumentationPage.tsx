import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
}

const DocumentationPage = () => {
  const [files, setFiles] = useState<DocumentationFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFiles();
  }, [filterType]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterType) params.file_type = filterType;

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/documentation-files`, { params });
      setFiles(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching documentation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/documentation-files/${id}`);
      setFiles(files.filter(f => f.id !== id));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Documentation & Camera Files</h1>
          <button
            onClick={() => navigate('/app/documents/upload')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Upload File
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          {['', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded text-sm ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {!type ? 'All' : type.split('/')[1].toUpperCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No documentation files found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map(file => (
              <div key={file.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={file.file_url}
                    alt={file.caption || 'Documentation'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-1">
                    {new Date(file.taken_at).toLocaleDateString()} {new Date(file.taken_at).toLocaleTimeString()}
                  </p>
                  {file.caption && <p className="text-gray-900 text-sm mb-2 line-clamp-2">{file.caption}</p>}
                  {file.latitude && file.longitude && (
                    <p className="text-xs text-gray-500 mb-3">
                      📍 {file.latitude.toFixed(4)}, {file.longitude.toFixed(4)}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/app/documents/${file.id}`)}
                      className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="flex-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default DocumentationPage;
