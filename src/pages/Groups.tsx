import { useState, useEffect } from 'react';
import { usePageTitle } from '../components/layout/Breadcrumbs';
import { groupService } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { Group } from '../types';
import { 
  UserGroupIcon, 
  EyeIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  TrashIcon,
  BookOpenIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export function Groups() {
  usePageTitle();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'khitma' | 'dhikr'>('all');

  const fetchGroups = async (type?: 'khitma' | 'dhikr') => {
    try {
      setLoading(true);
      setError(null);
      
      let allGroups: Group[] = [];
      
      if (type) {
        const response = await groupService.getGroups(type);
        if (response.ok && response.data) {
          allGroups = response.data;
        } else {
          setError(response.error || 'Failed to fetch groups');
          return;
        }
      } else {
        // Fetch both types
        const [khitmaResponse, dhikrResponse] = await Promise.all([
          groupService.getGroups('khitma'),
          groupService.getGroups('dhikr')
        ]);
        
        const khitmaGroups = khitmaResponse.ok && khitmaResponse.data ? khitmaResponse.data : [];
        const dhikrGroups = dhikrResponse.ok && dhikrResponse.data ? dhikrResponse.data : [];
        
        allGroups = [...khitmaGroups, ...dhikrGroups];
      }
      
      setGroups(allGroups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const type = selectedType === 'all' ? undefined : selectedType;
    fetchGroups(type);
  }, [selectedType]);

  const handleGroupAction = async (groupId: number, groupType: 'khitma' | 'dhikr', action: 'delete' | 'view') => {
    try {
      if (action === 'delete') {
        if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
          const response = await groupService.deleteGroup(groupId, groupType);
          if (response.ok) {
            fetchGroups(selectedType === 'all' ? undefined : selectedType);
          } else {
            setError(response.error || 'Failed to delete group');
          }
        }
      } else if (action === 'view') {
        // Navigate to details page
        window.location.href = `/groups/${groupType}/${groupId}`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getGroupTypeIcon = (type: string) => {
    return type === 'khitma' ? (
      <BookOpenIcon className="h-5 w-5 text-blue-600" />
    ) : (
      <SparklesIcon className="h-5 w-5 text-green-600" />
    );
  };

  const getGroupTypeBadge = (type: string) => {
    return type === 'khitma' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Khitma
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Dhikr
      </span>
    );
  };

  if (loading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Group Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor and manage Khitma and Dhikr groups in your Islamic app.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {groups.length} groups
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Groups', count: groups.length },
              { key: 'khitma', label: 'Khitma Groups', count: groups.filter(g => g.type === 'khitma').length },
              { key: 'dhikr', label: 'Dhikr Groups', count: groups.filter(g => g.type === 'dhikr').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedType(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedType === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => fetchGroups(selectedType === 'all' ? undefined : selectedType)}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Groups Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedType === 'all' ? 'All Groups' : 
             selectedType === 'khitma' ? 'Khitma Groups' : 'Dhikr Groups'}
          </h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
            <p className="text-gray-600">
              No groups have been created yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groups.map((group) => (
                  <tr key={`${group.type}-${group.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getGroupTypeIcon(group.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {group.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {group.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getGroupTypeBadge(group.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {group.members_count} members
                      </div>
                      {group.members_target && (
                        <div className="text-sm text-gray-500">
                          Target: {group.members_target}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {group.type === 'khitma' && group.summary ? (
                        <div className="text-sm text-gray-900">
                          {group.summary.completed_juz}/{group.summary.total_juz} Juz
                        </div>
                      ) : group.type === 'dhikr' ? (
                        <div className="text-sm text-gray-900">
                          {group.dhikr_count || 0}
                          {group.dhikr_target && ` / ${group.dhikr_target}`}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">-</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(group.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        group.is_public 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {group.is_public ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleGroupAction(group.id, group.type, 'view')}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleGroupAction(group.id, group.type, 'delete')}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Group"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
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