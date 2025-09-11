import { useEffect, useState, useCallback } from 'react';
import { usePageTitle } from '../components/layout/Breadcrumbs';
import { analyticsService } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatsCard } from '../components/ui/StatsCard';
import { SimpleChart, SimplePieChart } from '../components/ui/SimpleChart';

export function Analytics() {
  usePageTitle();

  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<any>(null);
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const [groupAnalytics, setGroupAnalytics] = useState<any>(null);
  const [activityAnalytics, setActivityAnalytics] = useState<any>(null);
  const [groupDistribution, setGroupDistribution] = useState<any[]>([]);
  const [mostUsedVerses, setMostUsedVerses] = useState<any[]>([]);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricsRes, usersRes, groupsRes, activityRes, distributionRes, versesRes] = await Promise.all([
        analyticsService.getDashboardMetrics(),
        analyticsService.getUserAnalytics(days),
        analyticsService.getGroupAnalytics(days),
        analyticsService.getActivityData(days),
        analyticsService.getGroupDistribution(),
        analyticsService.getMostUsedVerses(5),
      ]);

      if (!metricsRes.ok) throw new Error(metricsRes.error || 'Failed to load metrics');

      setMetrics(metricsRes.data?.metrics || metricsRes.metrics || null);
      setUserAnalytics(usersRes.ok ? (usersRes.data?.analytics || usersRes.analytics) : null);
      setGroupAnalytics(groupsRes.ok ? (groupsRes.data?.analytics || groupsRes.analytics) : null);
      setActivityAnalytics(activityRes.ok ? (activityRes.data?.analytics || activityRes.analytics) : null);
      setGroupDistribution(distributionRes.ok ? (distributionRes.data?.distribution || distributionRes.distribution || []) : []);
      setMostUsedVerses(versesRes.ok ? (versesRes.data?.verses || versesRes.verses || []) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const registrations = userAnalytics?.daily_registrations || [];
  const dailyActive = userAnalytics?.daily_active_users || [];
  const dailyKhitma = groupAnalytics?.daily_khitma_groups || [];
  const dailyDhikr = groupAnalytics?.daily_dhikr_groups || [];
  const khitmaCompletion = groupAnalytics?.khitma_completion_stats || [];
  const dailyActivity = activityAnalytics?.daily_activity || [];

  return (
    <div className="space-y-6">
      {/* Header + Range */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Usage statistics and reports</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Range</span>
          <div className="inline-flex rounded-md shadow-sm overflow-hidden border border-gray-300">
            <button
              type="button"
              onClick={() => setDays(7)}
              className={`px-3 py-1.5 text-sm ${days === 7 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              7d
            </button>
            <button
              type="button"
              onClick={() => setDays(30)}
              className={`px-3 py-1.5 text-sm border-l border-gray-300 ${days === 30 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              30d
            </button>
            <button
              type="button"
              onClick={() => setDays(90)}
              className={`px-3 py-1.5 text-sm border-l border-gray-300 ${days === 90 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              90d
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={metrics?.total_users || 0} />
        <StatsCard title="Active Users" value={metrics?.active_users || 0} />
        <StatsCard title="Total Groups" value={metrics?.total_groups || 0} />
        <StatsCard title="Active Groups" value={metrics?.active_groups || 0} />
      </div>

      {/* Users: Registrations and DAU */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Registrations</h3>
          {registrations.length > 0 ? (
            <SimpleChart
              data={registrations.map((r: any) => ({ label: r.date, value: r.count, color: '#10B981' }))}
              type="bar"
              height={200}
              showLabels={true}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">No data</div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Active Users</h3>
          {dailyActive.length > 0 ? (
            <SimpleChart
              data={dailyActive.map((r: any) => ({ label: r.date, value: r.count, color: '#3B82F6' }))}
              type="area"
              height={200}
              showLabels={true}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">No data</div>
          )}
        </div>
      </div>

      {/* Groups: Creation and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Khitma Groups Created</h3>
          {dailyKhitma.length > 0 ? (
            <SimpleChart
              data={dailyKhitma.map((r: any) => ({ label: r.date, value: r.count, color: '#6366F1' }))}
              type="line"
              height={200}
              showLabels={true}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">No data</div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Dhikr Groups Created</h3>
          {dailyDhikr.length > 0 ? (
            <SimpleChart
              data={dailyDhikr.map((r: any) => ({ label: r.date, value: r.count, color: '#10B981' }))}
              type="line"
              height={200}
              showLabels={true}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">No data</div>
          )}
        </div>
      </div>

      {/* Group distribution and Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Group Distribution</h3>
          {groupDistribution.length > 0 ? (
            <SimplePieChart
              data={groupDistribution.map((d: any) => ({ label: d.type, value: d.count, color: d.color }))}
              size={220}
              showLegend
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">No data</div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Khitma Completion Rates</h3>
          {khitmaCompletion.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {khitmaCompletion.map((row: any) => (
                    <tr key={row.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{row.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{row.completed_assignments}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{row.total_assignments}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{row.completion_rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">No data</div>
          )}
        </div>
      </div>

      {/* Most Used Verses */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Most Used Verses</h3>
        {mostUsedVerses.length > 0 ? (
          <div className="space-y-3">
            {mostUsedVerses.map((v: any, idx: number) => (
              <div key={v.id || idx} className="flex items-center justify-between">
                <div className="text-sm text-gray-700">{v.verse_reference || `${v.surah_name} ${v.surah_number}:${v.ayah_number}`}</div>
                <div className="text-xs text-gray-500">{v.usage_count} uses</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500">No data</div>
        )}
      </div>
    </div>
  );
}
