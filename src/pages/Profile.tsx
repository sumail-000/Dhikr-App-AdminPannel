import { usePageTitle } from '../components/layout/Breadcrumbs';
import { useAuth } from '../contexts/AuthContext';
import { adminProfileService } from '../services/api';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { formatDate, formatDateTime, formatRelativeTime } from '../utils';
import { config } from '../utils/config';
import { useState } from 'react';

export function Profile() {
  usePageTitle();
  const { user, logout, setUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const copyEmail = async () => {
    if (user?.email) {
      try {
        await navigator.clipboard.writeText(user.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {}
    }
  };

  const toAbsolute = (u?: string) => {
    if (!u) return '';
    if (u.startsWith('http')) {
      try {
        const url = new URL(u);
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
          return url.pathname + url.search + url.hash;
        }
        return u;
      } catch {
        return u;
      }
    }
    const base = config.apiBaseUrl.replace(/\/$/, '').replace(/\/api$/, '');
    const path = u.startsWith('/') ? u : `/${u}`;
    return `${base}${path}`;
  };

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    } else {
      setAvatarPreview(null);
    }
  };

  const onSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await adminProfileService.updateProfile({ username, avatar: avatarFile || undefined });
      if (res.ok) {
        const updated = (res.data?.admin) || res.admin;
        if (updated) {
          setUser({
            id: updated.id,
            username: updated.username,
            email: updated.email,
            role: updated.role,
            avatar_url: updated.avatar_url ? `${updated.avatar_url}?v=${Date.now()}` : undefined,
            last_login_at: updated.last_login_at,
            created_at: updated.created_at,
          });
        }
        setSuccess('Profile updated');
        setTimeout(() => setSuccess(null), 2000);
        setAvatarFile(null);
      } else {
        setError(res.error || 'Failed to update profile');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const onDeleteAvatar = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await adminProfileService.deleteAvatar();
      if (res.ok) {
        if (user) {
          setUser({ ...user, avatar_url: undefined as any });
        }
        setAvatarFile(null);
        setAvatarPreview(null);
        setSuccess('Avatar removed');
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError(res.error || 'Failed to remove avatar');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove avatar');
    } finally {
      setSaving(false);
    }
  };

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const onChangePassword = async () => {
    if (!pwd.next || pwd.next.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (pwd.next !== pwd.confirm) {
      setError('New password and confirmation do not match.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const res = await adminProfileService.changePassword(pwd.current, pwd.next, pwd.confirm);
      if (res.ok) {
        setSuccess('Password changed. Please sign in again.');
        setTimeout(() => {
          setSuccess(null);
          logout();
        }, 1500);
      } else {
        setError(res.error || 'Failed to change password');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
          <p className="mt-1 text-sm text-gray-600">View your admin account details.</p>
        </div>
        <button
          onClick={() => logout()}
          className="inline-flex items-center px-3 py-2 border border-red-200 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
          Sign out
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-700">{success}</div>
      )}

      {/* Profile Card */}
      <div className="bg-white shadow rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar + actions */}
          <div className="flex md:flex-col items-center md:items-start gap-4">
          {avatarPreview || user?.avatar_url ? (
            <img
              src={avatarPreview || `${toAbsolute(user?.avatar_url as any)}?v=${Date.now()}`}
              alt="avatar"
              className="h-24 w-24 rounded-full object-cover ring-2 ring-blue-100"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-200 ring-2 ring-gray-100" />
          )}
            <div className="flex items-center gap-3">
              <label className="text-sm text-blue-700 hover:text-blue-800 cursor-pointer">
                <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
                Change Photo
              </label>
              {(user?.avatar_url || avatarPreview) && (
                <button onClick={onDeleteAvatar} className="text-xs text-red-600 hover:text-red-800">Remove</button>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Username</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Username"
                />
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize whitespace-nowrap">
                  {user?.role}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <div className="flex items-center text-sm text-gray-700">
                <span className="truncate">{user?.email}</span>
                <button
                  onClick={copyEmail}
                  className="ml-2 text-xs px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-50"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Joined</div>
                <div className="text-sm font-medium text-gray-900">{user?.created_at ? formatDate(user.created_at as any) : '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Last Login</div>
                <div className="text-sm font-medium text-gray-900">
                  {user?.last_login_at ? (
                    <>
                      {formatDateTime(user.last_login_at as any)}
                      <span className="ml-2 text-xs text-gray-500">({formatRelativeTime(user.last_login_at as any)})</span>
                    </>
                  ) : '—'}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 shadow"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Card */}
      <div className="bg-white shadow rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
          <span className="text-xs text-gray-500">Minimum 8 characters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="password"
            placeholder="Current password"
            value={pwd.current}
            onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="New password"
            value={pwd.next}
            onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={pwd.confirm}
            onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onChangePassword}
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
