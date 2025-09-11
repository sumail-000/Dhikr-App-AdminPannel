import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService } from '../services/api';
import type { User } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { 
  ArrowLeftIcon,
  UserIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = Number(id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<{ total_groups: number; khitma_groups: number; dhikr_groups: number } | null>(null);
  const [recentActivity, setRecentActivity] = useState<Array<{ activity_date: string; opened: boolean; reading: boolean }>>([]);
  const [suspended, setSuspended] = useState<boolean>(false);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await userService.getUser(userId);
      if (resp.ok) {
        // Backend returns { ok: true, user: {..., stats, recent_activity} }
        const anyResp = resp as any;
        const u = anyResp.user as User;
        setUser(u);
        setStats(u.stats || anyResp.user?.stats || null);
        setRecentActivity(u.recent_activity || anyResp.user?.recent_activity || []);
        setSuspended((u as any).status === 'suspended');
      } else {
        setError(resp.error || 'Failed to load user');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(userId)) {
      setError('Invalid user ID');
      setLoading(false);
      return;
    }
    loadUser();
  }, [userId]);

  const handleSuspend = async () => {
    try {
      const confirmed = confirm('Suspend this user? This will revoke all active tokens.');
      if (!confirmed) return;
      const res = await userService.suspendUser(userId);
      if (!res.ok) throw new Error(res.error || 'Failed to suspend');
      setSuspended(true);
      alert('User suspended.');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to suspend user');
    }
  };

  const handleActivate = async () => {
    try {
      const res = await userService.activateUser(userId);
      if (!res.ok) throw new Error(res.error || 'Failed to activate');
      setSuspended(false);
      alert('User activated.');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to activate user');
    }
  };

  const handleDelete = async () => {
    try {
      const confirmed = confirm('Delete this user and all associated data? This cannot be undone.');
      if (!confirmed) return;
      const res = await userService.deleteUser(userId);
      if (!res.ok) throw new Error(res.error || 'Failed to delete user');
      alert('User deleted successfully.');
      navigate('/users');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete user');
    }
  };

  const formatDate = (s: string) => new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-700 hover:text-gray-900">
          <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error || 'User not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-700 hover:text-gray-900 mr-4">
            <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back
          </button>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              {user.avatar_url ? (
                <img src={(function() {
                  const u = user.avatar_url as any;
                  if (typeof u === 'string' && u.startsWith('http')) {
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
                  return u;
                })()} alt={user.username} className="h-16 w-16 object-cover" />
              ) : (
                <UserIcon className="h-8 w-8 text-gray-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{user.username}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {suspended ? (
            <button onClick={handleActivate} className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <CheckCircleIcon className="h-4 w-4 mr-2" /> Activate
            </button>
          ) : (
            <button onClick={handleSuspend} className="inline-flex items-center px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
              <NoSymbolIcon className="h-4 w-4 mr-2" /> Suspend
            </button>
          )}
          <button onClick={handleDelete} className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            <TrashIcon className="h-4 w-4 mr-2" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">User ID</span><span className="text-gray-900">{user.id}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Joined</span><span className="text-gray-900">{formatDate(user.created_at)}</span></div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Group Stats</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Total Groups</span><span className="text-gray-900">{stats?.total_groups ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Created</span><span className="text-gray-900">{stats?.groups_created_total ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Joined</span><span className="text-gray-900">{stats?.groups_joined_total ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Joined (Khitma)</span><span className="text-gray-900">{stats?.khitma_groups ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Joined (Dhikr)</span><span className="text-gray-900">{stats?.dhikr_groups ?? 0}</span></div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${suspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {suspended ? 'Suspended' : 'Active'}
              </span>
            </div>
            <p className="text-gray-500">Suspension persistence is not implemented yet; action revokes tokens.</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <p className="text-gray-600 text-sm">No recent activity.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opened</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reading</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivity.map((a, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(a.activity_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.opened ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.reading ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
