import { useState } from 'react';
import { usePageTitle } from '../components/layout/Breadcrumbs';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { config } from '../utils/config';
import { 
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
  ServerStackIcon,
  LinkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export function Settings() {
  usePageTitle();
  const { user, logout, setUser } = useAuth();

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshToken = async () => {
    try {
      setRefreshing(true);
      const res = await authService.refreshToken();
      if (res.ok && res.data?.token) {
        localStorage.setItem('admin_token', JSON.stringify(res.data.token));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        setError(res.error || 'Failed to refresh token');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to refresh token');
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearLocal = () => {
    if (confirm('Clear local settings and cached data for this panel?')) {
      localStorage.removeItem('admin_debug');
      // keep auth by design
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Settings</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your admin account and panel configuration.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleClearLocal}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
          >
            Clear Local Data
          </button>
          <button
            onClick={handleRefreshToken}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            {refreshing ? 'Refreshing...' : 'Refresh Token'}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-green-800">Done!</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Account */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Admin Account</h3>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-500">Username</div>
            <div className="text-sm font-medium text-gray-900">{user?.username}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div className="text-sm font-medium text-gray-900">{user?.email}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Role</div>
            <div className="text-sm font-medium text-gray-900 capitalize">{user?.role}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Last Login</div>
            <div className="text-sm font-medium text-gray-900">{user?.last_login_at || '—'}</div>
          </div>
          <div className="md:col-span-2 flex justify-end space-x-3">
            <button
              onClick={() => logout()}
              className="inline-flex items-center px-3 py-2 border border-red-200 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Application */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <CogIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Application</h3>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-500">App Name</div>
            <div className="text-sm font-medium text-gray-900">{config.appName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Version</div>
            <div className="text-sm font-medium text-gray-900">{config.appVersion}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-sm text-gray-500 flex items-center"><LinkIcon className="h-4 w-4 mr-1" /> API Base URL</div>
            <div className="text-sm font-mono bg-gray-50 border border-gray-200 rounded p-2 mt-1 overflow-x-auto">
              {config.apiBaseUrl}
            </div>
          </div>
        </div>
      </div>

      {/* System */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <ServerStackIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">System</h3>
          </div>
        </div>
        <div className="p-6 text-sm text-gray-600">
          <p>This panel doesn’t change server-side settings. For server configuration (maintenance mode, registration, etc.), use your Laravel backend directly (env/config) or expose proper admin endpoints.</p>
        </div>
      </div>
    </div>
  );
}
