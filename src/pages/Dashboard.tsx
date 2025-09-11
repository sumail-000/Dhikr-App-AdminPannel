import { usePageTitle } from '../components/layout/Breadcrumbs';
import { useAuthManager } from '../hooks/useAuthManager';
import { useDashboard, calculatePercentageChange } from '../hooks/useDashboard';
import { StatsCard } from '../components/ui/StatsCard';
import { SimpleChart, SimplePieChart } from '../components/ui/SimpleChart';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  UsersIcon,
  UserGroupIcon,
  BookOpenIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

export function Dashboard() {
  usePageTitle();
  const auth = useAuthManager();
  const { metrics, userActivity, groupStats, verseUsage, loading, error, lastUpdated, refreshData } = useDashboard();

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={refreshData}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {auth.user?.username}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your Islamic app today.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refreshData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={metrics?.total_users || 0}
          change={metrics?.total_users ? { ...calculatePercentageChange(metrics.total_users, metrics.total_users * 0.9), period: 'last month' } : undefined}
          icon={<UsersIcon className="h-6 w-6" />}
          loading={loading}
        />

        <StatsCard
          title="Active Groups"
          value={metrics?.active_groups || 0}
          change={metrics?.active_groups ? { ...calculatePercentageChange(metrics.active_groups, metrics.active_groups * 0.85), period: 'last week' } : undefined}
          icon={<UserGroupIcon className="h-6 w-6" />}
          loading={loading}
        />

        <StatsCard
          title="Motivational Verses"
          value={metrics?.total_verses || 0}
          icon={<BookOpenIcon className="h-6 w-6" />}
          loading={loading}
        />

        <StatsCard
          title="Active Verses"
          value={metrics?.active_verses || 0}
          icon={<BookOpenIcon className="h-6 w-6 text-green-600" />}
          loading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">User Activity (Last 7 Days)</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                <span>Active Users</span>
              </div>
            </div>
          </div>
          {userActivity && userActivity.length > 0 ? (
            <SimpleChart
              data={userActivity.map(item => ({ label: item.date, value: item.users, color: '#3B82F6' }))}
              type="area"
              height={200}
              showLabels={true}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">
              <div className="text-center">
                <ChartBarIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No activity data available</p>
                <p className="text-sm">Check back when users start using the app</p>
              </div>
            </div>
          )}
        </div>

        {/* Group Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Group Distribution</h3>

          {groupStats && groupStats.length > 0 ? (
            <SimplePieChart
              data={groupStats.map(stat => ({
                label: stat.type,
                value: stat.count,
                color: stat.color,
              }))}
              size={200}
              showLegend={true}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">
              <div className="text-center">
                <UserGroupIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No group data available</p>
                <p className="text-sm">Create some groups to see distribution</p>
                <button 
                  onClick={refreshData}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Refresh data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popular Verses and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Verses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Used Verses</h3>
          {verseUsage && verseUsage.length > 0 ? (
            <div className="space-y-3">
              {verseUsage.map((verse, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 w-6">{index + 1}.</span>
                    <span className="text-sm text-gray-700 ml-2">{verse.verse}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(verse.count / Math.max(...verseUsage.map(v => v.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">{verse.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <BookOpenIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No verse usage data yet</p>
                <p className="text-sm">Users haven't interacted with verses</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <UsersIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Manage Users
                    </div>
                    <div className="text-xs text-gray-500">
                      View and moderate user accounts
                    </div>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <BookOpenIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Add Verse
                    </div>
                    <div className="text-xs text-gray-500">
                      Add new motivational verse
                    </div>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      View Analytics
                    </div>
                    <div className="text-xs text-gray-500">
                      Check app usage statistics
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Export Data</h3>
            <p className="text-sm text-gray-500 mt-1">Download system reports and analytics data</p>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export Users CSV
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Export Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}