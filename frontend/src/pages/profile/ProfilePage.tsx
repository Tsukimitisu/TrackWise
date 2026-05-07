import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';

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
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
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

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSubmitting(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/auth/profile`, profileData);
      setProfileSuccess('Profile updated successfully');
      // Update auth context
      if (res.data.user && login) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (error: any) {
      setProfileError(error.response?.data?.message || 'Error updating profile');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  if (!user) return <div className="text-center py-8">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>

      {/* Profile Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Account Information</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-semibold">{user.first_name} {user.last_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Role</p>
            <p className="font-semibold capitalize">{user.role?.name || user.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Organization</p>
            <p className="font-semibold">{user.organization?.name || '-'}</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
        {profileSuccess && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{profileSuccess}</div>}
        {profileError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{profileError}</div>}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                name="first_name"
                value={profileData.first_name}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                name="last_name"
                value={profileData.last_name}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={profileData.email}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              name="phone"
              value={profileData.phone}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={profileSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {profileSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Change Password</h2>
        {passwordSuccess && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{passwordSuccess}</div>}
        {passwordError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{passwordError}</div>}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
            <input
              name="current_password"
              type="password"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
            <input
              name="password"
              type="password"
              value={passwordData.password}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
            <input
              name="password_confirmation"
              type="password"
              value={passwordData.password_confirmation}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={passwordSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {passwordSubmitting ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
