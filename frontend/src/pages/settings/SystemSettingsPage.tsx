import { useEffect, useState } from 'react';
import axios from 'axios';

const SystemSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/settings`);
      setSettings(res.data || {});
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettings({});
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setSettings((s: any) => ({ ...s, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/settings`, settings);
      alert('Settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">System Settings</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
          <input name="site_name" value={settings.site_name || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Required Hours</label>
          <input name="default_required_hours" type="number" value={settings.default_required_hours || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>

        <div className="flex items-center gap-3">
          <input id="allow_registration" name="allow_registration" type="checkbox" checked={!!settings.allow_registration} onChange={handleChange} />
          <label htmlFor="allow_registration" className="text-sm">Allow new user registration</label>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving...' : 'Save Settings'}</button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
