import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import Surface from '../../components/ui/Surface';
import { FieldShell, TextField } from '../../components/ui/TextField';

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface PasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleProfileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setProfileData((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPasswordData((current) => ({ ...current, [name]: value }));
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileSubmitting(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/auth/profile`, profileData);
      setProfileSuccess('Profile updated successfully');
    } catch (error: any) {
      setProfileError(error.response?.data?.message || 'Error updating profile');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (passwordData.password !== passwordData.password_confirmation) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordSubmitting(true);
    setPasswordSuccess('');
    setPasswordError('');

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/change-password`, passwordData);
      setPasswordSuccess('Password changed successfully');
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || 'Error changing password');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (!user) return <div className="py-8 text-center text-slate-500 dark:text-slate-400">Loading profile...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="My Profile"
        description="View your identity, update contact details, and change your password in a more focused layout."
        actions={<Badge tone="info">{user.role?.name || user.role}</Badge>}
      />

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Surface className="p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Account information</div>
          <div className="mt-6 space-y-4">
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Name</div>
              <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">{user.first_name} {user.last_name}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Email</div>
              <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">{user.email}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Organization</div>
              <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">{user.organization?.name || 'No organization assigned'}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Phone</div>
              <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">{user.phone || 'Not provided'}</div>
            </div>
          </div>
        </Surface>

        <div className="space-y-6">
          <Surface className="p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Edit Profile</h2>
              <Badge tone="neutral">Profile</Badge>
            </div>
            {profileSuccess ? <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200">{profileSuccess}</div> : null}
            {profileError ? <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{profileError}</div> : null}

            <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <FieldShell label="First name">
                  <TextField name="first_name" value={profileData.first_name} onChange={handleProfileChange} />
                </FieldShell>
                <FieldShell label="Last name">
                  <TextField name="last_name" value={profileData.last_name} onChange={handleProfileChange} />
                </FieldShell>
              </div>
              <FieldShell label="Email">
                <TextField name="email" type="email" value={profileData.email} onChange={handleProfileChange} />
              </FieldShell>
              <FieldShell label="Phone">
                <TextField name="phone" value={profileData.phone} onChange={handleProfileChange} />
              </FieldShell>
              <button type="submit" disabled={profileSubmitting} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                {profileSubmitting ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </Surface>

          <Surface className="p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Change Password</h2>
              <Badge tone="warning">Security</Badge>
            </div>
            {passwordSuccess ? <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200">{passwordSuccess}</div> : null}
            {passwordError ? <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{passwordError}</div> : null}

            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
              <FieldShell label="Current password">
                <TextField name="current_password" type="password" value={passwordData.current_password} onChange={handlePasswordChange} required />
              </FieldShell>
              <FieldShell label="New password">
                <TextField name="password" type="password" value={passwordData.password} onChange={handlePasswordChange} required />
              </FieldShell>
              <FieldShell label="Confirm new password">
                <TextField name="password_confirmation" type="password" value={passwordData.password_confirmation} onChange={handlePasswordChange} required />
              </FieldShell>
              <button type="submit" disabled={passwordSubmitting} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                {passwordSubmitting ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </Surface>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
