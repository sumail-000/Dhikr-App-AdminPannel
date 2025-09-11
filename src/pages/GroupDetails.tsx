import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { groupService } from '../services/api';
import type { Group } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ArrowLeftIcon, UserIcon } from '@heroicons/react/24/outline';

export function GroupDetails() {
  const navigate = useNavigate();
  const { id, type } = useParams();
  const groupId = Number(id);
  const groupType = (type === 'dhikr' ? 'dhikr' : 'khitma') as 'khitma' | 'dhikr';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState<Group | null>(null);

  const loadGroup = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await groupService.getGroup(groupId, groupType);
      if (!resp.ok) throw new Error(resp.error || 'Failed to load group');
      const data = (resp as any).data || (resp as any).group || (resp as any);
      setGroup(data as Group);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(groupId)) {
      setError('Invalid group ID');
      setLoading(false);
      return;
    }
    loadGroup();
  }, [groupId, groupType]);

  const formatDate = (s?: string) =>
    s ? new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
    );
  }

  if (error || !group) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-700 hover:text-gray-900">
          <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error || 'Group not found'}</p>
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
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{group.name}</h1>
            <p className="text-gray-600">Type: {group.type.toUpperCase()} • Group ID: {group.id}</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Created: {formatDate(group.created_at)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Overview</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Visibility</span><span className="text-gray-900">{group.is_public ? 'Public' : 'Private'}</span></div>
            {group.type === 'khitma' && (
              <>
                <div className="flex justify-between"><span className="text-gray-500">Days to Complete</span><span className="text-gray-900">{group.days_to_complete ?? '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Start Date</span><span className="text-gray-900">{formatDate(group.start_date)}</span></div>
                {group.summary && (
                  <div className="flex justify-between"><span className="text-gray-500">Progress</span><span className="text-gray-900">{group.summary.completed_juz}/{group.summary.total_juz} Juz</span></div>
                )}
              </>
            )}
            {group.type === 'dhikr' && (
              <>
                <div className="flex justify-between"><span className="text-gray-500">Dhikr Title</span><span className="text-gray-900">{(group as any).dhikr_title || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Dhikr Target</span><span className="text-gray-900">{(group as any).dhikr_target ?? '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Dhikr Count</span><span className="text-gray-900">{(group as any).dhikr_count ?? 0}</span></div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Members</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Members</span><span className="text-gray-900">{group.members_count}</span></div>
            {group.members_target && (
              <div className="flex justify-between"><span className="text-gray-500">Target</span><span className="text-gray-900">{group.members_target}</span></div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Admin</h3>
          { (group as any).creator ? (
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {(group as any).creator.avatar_url ? (
                  <img src={(group as any).creator.avatar_url} className="h-10 w-10 object-cover" />
                ) : (
                  <UserIcon className="h-6 w-6 text-gray-600" />
                )}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">{(group as any).creator.username}</div>
                <div className="text-sm text-gray-500">{(group as any).creator.email}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">No admin info.</div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Members List</h3>
        {Array.isArray((group as any).members) && (group as any).members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  {groupType === 'dhikr' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contribution</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(group as any).members.map((m: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {m.avatar_url ? (
                            <img src={m.avatar_url} className="h-10 w-10 object-cover" />
                          ) : (
                            <UserIcon className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{m.username}</div>
                          <div className="text-sm text-gray-500">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.role}</td>
                    {groupType === 'dhikr' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.dhikr_contribution ?? 0}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No members found.</p>
        )}
      </div>
    </div>
  );
}

