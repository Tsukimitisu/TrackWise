import { useEffect, useState } from 'react';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';

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
      await client.put(`/auth/profile`, profileData);
      setProfileSuccess('✓ Profile updated successfully');
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
      await client.post(`/auth/change-password`, passwordData);
      setPasswordSuccess('✓ Password changed successfully');
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || 'Error changing password');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (!user)
    return (
      <div className="py-8 text-center text-slate-500">Loading profile...</div>
    );

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="My Profile"
        description="Manage your account information and security settings"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Account Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Account Information</h2>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-1">
                Full Name
              </p>
              <p className="text-xl font-bold text-slate-900">
                {user.first_name} {user.last_name}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-1">
                Email
              </p>
              <p className="text-base font-medium text-slate-900">{user.email}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-1">
                Organization
              </p>
              <p className="text-base font-medium text-slate-900">
                {user.organization?.name || 'Not assigned'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-1">
                Role
              </p>
              <div className="mt-2">
                <Badge
                  status="info"
                  variant="subtle"
                  size="md"
                >
                  {user.role?.name || 'User'}
                </Badge>
              </div>
            </div>

            {user.phone && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-1">
                  Phone
                </p>
                <p className="text-base font-medium text-slate-900">{user.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Forms Section */}
        <div className="space-y-6">
          {/* Edit Profile Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Edit Profile</h2>

            {profileSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-700 font-medium">{profileSuccess}</p>
              </div>
            )}

            {profileError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700 font-medium">{profileError}</p>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={profileSubmitting}
                fullWidth
              >
                {profileSubmitting ? '⏳ Saving...' : '💾 Save Profile'}
              </Button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Change Password</h2>

            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-700 font-medium">{passwordSuccess}</p>
              </div>
            )}

            {passwordError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700 font-medium">{passwordError}</p>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={passwordData.password}
                  onChange={handlePasswordChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={passwordData.password_confirmation}
                  onChange={handlePasswordChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={passwordSubmitting}
                fullWidth
              >
                {passwordSubmitting ? '⏳ Updating...' : '🔐 Change Password'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
