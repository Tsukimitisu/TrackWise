import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import Surface from '../../components/ui/Surface';

interface UserDetail {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  email_verified_at?: string | null;
  role?: { name: string };
  organization?: { name: string } | null;
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      navigate('/app/users');
      return;
    }
    void fetchUser();
  }, [id, navigate]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await client.get(`/users/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      navigate('/app/users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Surface className="p-10 text-center text-slate-500 dark:text-slate-400">Loading user...</Surface>;
  if (!user) return <Surface className="p-10 text-center text-slate-500 dark:text-slate-400">User not found.</Surface>;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="User profile"
        title={user.name}
        description="Account, role, verification, and organization details."
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate(`/app/users/${user.id}/edit`)} className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">Edit</button>
            <button onClick={() => navigate('/app/users')} className="rounded-md border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">Back</button>
          </div>
        }
      />
      <Surface className="p-6">
        <dl className="grid gap-5 sm:grid-cols-2">
          <Info label="Email" value={user.email} />
          <Info label="Phone" value={user.phone || 'Not provided'} />
          <Info label="Role" value={user.role?.name ?? 'Unassigned'} />
          <Info label="Organization" value={user.organization?.name ?? 'No organization'} />
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">Status</dt>
            <dd className="mt-1"><Badge tone={user.status === 'active' ? 'success' : 'warning'}>{user.status}</Badge></dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">Email verification</dt>
            <dd className="mt-1"><Badge tone={user.email_verified_at ? 'success' : 'warning'}>{user.email_verified_at ? 'Verified' : 'Pending'}</Badge></dd>
          </div>
        </dl>
      </Surface>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{value}</dd>
    </div>
  );
}
