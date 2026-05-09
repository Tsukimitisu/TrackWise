import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface DocumentationFile {
  id: number;
  file_url: string;
  file_type: string;
  caption?: string;
  taken_at: string;
  latitude?: number;
  longitude?: number;
}

export default function DocumentationPage() {
  const [files, setFiles] = useState<DocumentationFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFiles().catch(() => {});
  }, [filterType]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterType) params.file_type = filterType;
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/documentation-files`, { params });
      const data = response.data.data || response.data;
      setFiles(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this file?')) return;
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/documentation-files/${id}`);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Documentation</h1>
        <button onClick={() => navigate('/app/documents/upload')} className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-900">
          Upload
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        {['', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`rounded px-3 py-1 text-sm ${filterType === type ? 'bg-black text-white' : 'bg-gray-100 text-black hover:bg-gray-200 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800'}`}
          >
            {!type ? 'All' : type.split('/')[1].toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? <div className="py-8 text-center">Loading...</div> : null}
      {!loading && files.length === 0 ? <div className="py-8 text-center text-gray-500">No files found.</div> : null}

      {!loading && files.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <div key={file.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
              <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
                <img src={file.file_url} alt={file.caption || 'Documentation'} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">{new Date(file.taken_at).toLocaleString()}</p>
                {file.caption ? <p className="mb-2 text-sm">{file.caption}</p> : null}
                {file.latitude && file.longitude ? (
                  <p className="mb-3 text-xs text-gray-500">{file.latitude.toFixed(4)}, {file.longitude.toFixed(4)}</p>
                ) : null}
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/app/documents/${file.id}`)} className="flex-1 rounded bg-black px-3 py-1 text-sm text-white hover:bg-gray-900">View</button>
                  <button onClick={() => handleDelete(file.id)} className="flex-1 rounded border border-gray-300 px-3 py-1 text-sm text-black hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-900">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
