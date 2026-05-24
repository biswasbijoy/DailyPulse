'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/authContext';
import { updateProfile, changePassword, updateSettings } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, User, Lock, Palette, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [theme, setTheme] = useState(user?.settings?.theme || 'system');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProfileMsg('');
    try {
      await updateProfile({ name, timezone });
      await refreshUser();
      setProfileMsg('Profile updated successfully');
    } catch {
      setProfileMsg('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPasswordMsg('');
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordMsg('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      setPasswordMsg('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSettingsMsg('');
    try {
      await updateSettings({ theme: theme as 'light' | 'dark' | 'system' });
      await refreshUser();
      setSettingsMsg('Settings updated successfully');
    } catch {
      setSettingsMsg('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account settings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>Update your name and timezone</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Chicago">America/Chicago</option>
                <option value="America/Denver">America/Denver</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Berlin">Europe/Berlin</option>
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="Asia/Shanghai">Asia/Shanghai</option>
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="Australia/Sydney">Australia/Sydney</option>
                <option value="Pacific/Auckland">Pacific/Auckland</option>
              </select>
            </div>
            <Button type="submit" variant="gradient" disabled={loading}>
              <Save className="w-4 h-4 mr-1.5" />
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
            {profileMsg && (
              <p className={`text-sm ${profileMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {profileMsg}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <CardTitle>Password</CardTitle>
          </div>
          <CardDescription>Change your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" variant="gradient" disabled={loading}>
              <Save className="w-4 h-4 mr-1.5" />
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
            {passwordMsg && (
              <p className={`text-sm ${passwordMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {passwordMsg}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-600" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSettingsUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Theme</label>
              <div className="flex gap-3">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      theme === t
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" variant="gradient" disabled={loading}>
              <Save className="w-4 h-4 mr-1.5" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
            {settingsMsg && (
              <p className={`text-sm ${settingsMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {settingsMsg}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
