import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import Surface from '../../components/ui/Surface';
import { TextField } from '../../components/ui/TextField';
import { hasRole } from '../../utils/roleHelper';

interface UserRow {
  id: number;
  name: string;
  email: string;
  status: string;
  email_verified_at?: string | null;
  role?: { name: string } | string;
  organization?: { name: string } | null;
}

const roleName = (user: UserRow) => (typeof user.role === 'string' ? user.role : user.role?.name ?? 'Unassigned');

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = hasRole(user, ['admin', 'coordinator']);

  useEffect(() => {
    void fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await client.get('/users');
      const data = response.data.data || response.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((entry) =>
      [entry.name, entry.email, roleName(entry), entry.status, entry.organization?.name ?? ''].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [search, users]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="User management"
        title="Users"
        description="Browse accounts, verification status, roles, and organization access."
        actions={
          canManage ? (
            <button onClick={() => navigate('/app/users/create')} className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
              New user
            </button>
          ) : null
        }
      />

      <Surface className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <Badge tone="info">{filteredUsers.length} users</Badge>
            <span>{canManage ? 'Editable access' : 'Read-only access'}</span>
          </div>
          <TextField value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" className="lg:max-w-md" />
        </div>
      </Surface>

      {loading ? (
        <Surface className="p-10 text-center text-slate-500 dark:text-slate-400">Loading users...</Surface>
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="No users found" description="Try another search or create a user account." />
      ) : (
        <Surface className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Organization</th>
                  <th className="px-5 py-3">Verification</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredUsers.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/70">
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-50">{entry.name}</td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{entry.email}</td>
                    <td className="px-5 py-4"><Badge>{roleName(entry)}</Badge></td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{entry.organization?.name ?? 'No organization'}</td>
                    <td className="px-5 py-4">
                      <Badge tone={entry.email_verified_at ? 'success' : 'warning'}>{entry.email_verified_at ? 'Verified' : 'Pending'}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/app/users/${entry.id}`)} className="rounded-md bg-slate-100 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                          View
                        </button>
                        {canManage ? (
                          <button onClick={() => navigate(`/app/users/${entry.id}/edit`)} className="rounded-md bg-slate-950 px-3 py-2 font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                            Edit
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      )}
    </div>
  );
}
