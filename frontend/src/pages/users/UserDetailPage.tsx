import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at?: string;
}

const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return navigate('/app/users');
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      navigate('/app/users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!user) return <div className="text-center py-8 text-gray-500">User not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
        <div className="space-x-2">
          <button onClick={() => navigate(`/app/users/${user.id}/edit`)} className="px-3 py-1 bg-gray-600 text-white rounded">Edit</button>
          <button onClick={() => navigate('/app/users')} className="px-3 py-1 bg-gray-300 rounded">Back</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm text-gray-600 mb-2">Email: <strong>{user.email}</strong></p>
        <p className="text-sm text-gray-600 mb-2">Role: <strong className="capitalize">{user.role}</strong></p>
        <p className="text-sm text-gray-600 mb-2">Status: <strong className="capitalize">{user.status}</strong></p>
      </div>
    </div>
  );
};

export default UserDetailPage;
