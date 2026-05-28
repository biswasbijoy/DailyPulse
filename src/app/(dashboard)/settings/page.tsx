'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/authContext';
import { updateProfile, changePassword, updateSettings } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { applyTheme } from '@/lib/theme';
import { Settings, User, Lock, Palette, Save, Camera, Trash2 } from 'lucide-react';

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
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProfileMsg('');
    try {
      await updateProfile({ name, timezone, profilePicture });
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileMsg('Image must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setProfilePicturePreview(dataUrl);
      setProfilePicture(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePicture = () => {
    setProfilePicturePreview(null);
    setProfilePicture(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSettingsMsg('');
    try {
      await updateSettings({ theme: theme as 'light' | 'dark' | 'system' });
      applyTheme(theme as 'light' | 'dark' | 'system');
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 flex-shrink-0">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account settings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>Update your name and timezone</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold shadow-sm overflow-hidden">
                  {profilePicturePreview || user.profilePicture ? (
                    <img
                      src={profilePicturePreview || user.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-medium text-foreground">Profile Picture</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-3.5 h-3.5 mr-1" />
                    {user.profilePicture ? 'Change' : 'Upload'}
                  </Button>
                  {(profilePicturePreview || user.profilePicture) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemovePicture}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
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
                <option value="Asia/Dhaka">Asia/Dhaka</option>
                <option value="Australia/Sydney">Australia/Sydney</option>
                <option value="Pacific/Auckland">Pacific/Auckland</option>
              </select>
            </div>
            <Button type="submit" variant="gradient" disabled={loading}>
              <Save className="w-4 h-4 mr-1.5" />
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
            {profileMsg && (
              <p className={`text-sm ${profileMsg.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {profileMsg}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>Password</CardTitle>
          </div>
          <CardDescription>Change your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Current Password</label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" variant="gradient" disabled={loading}>
              <Save className="w-4 h-4 mr-1.5" />
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
            {passwordMsg && (
              <p className={`text-sm ${passwordMsg.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {passwordMsg}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSettingsUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Theme</label>
              <div className="flex gap-3">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      theme === t
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-secondary text-muted-foreground hover:bg-accent'
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
