import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/api';
import type { SystemMetrics } from '../types';

export interface DashboardData {
  metrics: SystemMetrics | null;
  userActivity: Array<{ date: string; users: number; groups: number }>;
  groupStats: Array<{ type: string; count: number; color: string }>;
  verseUsage: Array<{ verse: string; count: number }>;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface UseDashboardOptions {
  refreshInterval?: number; // in milliseconds
  autoRefresh?: boolean;
}

export function useDashboard(options: UseDashboardOptions = {}) {
  const { refreshInterval = 300000, autoRefresh = false } = options; // 5 minutes, disabled by default
  
  const [data, setData] = useState<DashboardData>({
    metrics: null,
    userActivity: [],
    groupStats: [],
    verseUsage: [],
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch system metrics from Laravel API
      const metricsResponse = await analyticsService.getDashboardMetrics();
      
      if (!metricsResponse.ok) {
        console.warn('Metrics API failed, using fallback data:', metricsResponse.error);
        // Use fallback metrics if API fails
        const fallbackMetrics = {
          total_users: 6,
          active_users: 3,
          new_users_today: 0,
          total_groups: 1,
          active_groups: 1,
          total_verses: 46,
          active_verses: 46,
          notifications_sent_today: 0,
        };
        
        setData({
          metrics: fallbackMetrics,
          userActivity: [],
          groupStats: [],
          verseUsage: [],
          loading: false,
          error: `API Error: ${metricsResponse.error || 'Failed to fetch metrics'}`,
          lastUpdated: new Date(),
        });
        return;
      }

      // ONLY use the dashboard endpoint that actually works
      // Don't call other endpoints that cause 500 errors

      // Create simple data based ONLY on the dashboard metrics that work
      const metrics = metricsResponse.data?.metrics || metricsResponse.metrics;
      
      // Simple user activity - just show current active users
      const userActivity = [];
      
      // Simple group distribution based on metrics
      const groupStats = metrics ? [
        { type: 'Khitma Groups', count: Math.ceil((metrics.total_groups || 0) * 0.6), color: '#3B82F6' },
        { type: 'Dhikr Groups', count: Math.floor((metrics.total_groups || 0) * 0.4), color: '#10B981' },
        { type: 'Inactive Groups', count: Math.max(0, (metrics.total_groups || 0) - (metrics.active_groups || 0)), color: '#F59E0B' },
      ] : [];

      // Simple verse usage - empty for now since API doesn't work
      const verseUsage: Array<{ verse: string; count: number }> = [];

      // Debug logging (only in development)
      if (import.meta.env.DEV) {
        console.log('Dashboard loaded with metrics:', metrics);
      }

      setData({
        metrics: metricsResponse.data?.metrics || metricsResponse.metrics || null,
        userActivity,
        groupStats,
        verseUsage,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchDashboardData, refreshInterval, autoRefresh]);

  return {
    ...data,
    refreshData,
  };
}

// Helper functions for processing Laravel API data
function processUserActivityData(dailyActiveUsers: Array<{ date: string; count: number }>): Array<{ date: string; users: number; groups: number }> {
  return dailyActiveUsers.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: item.count,
    groups: Math.floor(item.count / 10), // Estimate groups from users
  }));
}

function processGroupStats(analytics: { daily_khitma_groups?: any[]; daily_dhikr_groups?: any[]; khitma_completion_stats?: any[] }, metrics?: any): Array<{ type: string; count: number; color: string }> {
  // Use metrics data if available, otherwise fall back to analytics
  if (metrics) {
    const totalGroups = metrics.total_groups || 0;
    const activeGroups = metrics.active_groups || 0;
    const inactiveGroups = Math.max(0, totalGroups - activeGroups);
    
    // Estimate distribution (you can make this more accurate with separate API calls)
    const khitmaCount = Math.ceil(activeGroups * 0.6); // Assume 60% are Khitma
    const dhikrCount = activeGroups - khitmaCount;
    
    return [
      { type: 'Khitma Groups', count: khitmaCount, color: '#3B82F6' },
      { type: 'Dhikr Groups', count: dhikrCount, color: '#10B981' },
      { type: 'Inactive Groups', count: inactiveGroups, color: '#F59E0B' },
    ];
  }
  
  // Fallback to analytics data
  const khitmaCount = analytics.khitma_completion_stats?.length || 
                     analytics.daily_khitma_groups?.reduce((sum, item) => sum + item.count, 0) || 0;
  const dhikrCount = analytics.daily_dhikr_groups?.reduce((sum, item) => sum + item.count, 0) || 0;
  
  return [
    { type: 'Khitma Groups', count: khitmaCount, color: '#3B82F6' },
    { type: 'Dhikr Groups', count: dhikrCount, color: '#10B981' },
    { type: 'Inactive Groups', count: Math.max(0, Math.floor((khitmaCount + dhikrCount) * 0.1)), color: '#F59E0B' },
  ];
}

// Mock data generators (replace with actual API processing)
function generateMockActivityData(): Array<{ date: string; users: number; groups: number }> {
  const data = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      users: Math.floor(Math.random() * 100) + 50,
      groups: Math.floor(Math.random() * 20) + 10,
    });
  }
  
  return data;
}

function generateMockGroupStats(): Array<{ type: string; count: number; color: string }> {
  return [
    { type: 'Khitma Groups', count: 45, color: '#3B82F6' },
    { type: 'Dhikr Groups', count: 32, color: '#10B981' },
    { type: 'Inactive Groups', count: 8, color: '#F59E0B' },
  ];
}

function generateMockVerseUsage(): Array<{ verse: string; count: number }> {
  return [
    { verse: 'Al-Fatiha 1:1', count: 156 },
    { verse: 'Al-Baqarah 2:255', count: 134 },
    { verse: 'Al-Ikhlas 112:1-4', count: 98 },
    { verse: 'An-Nas 114:1-6', count: 87 },
    { verse: 'Al-Falaq 113:1-5', count: 76 },
  ];
}

// Export utility function for formatting dashboard data
export function formatMetricValue(value: number, type: 'number' | 'percentage' | 'currency' = 'number'): string {
  switch (type) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    default:
      return value.toLocaleString();
  }
}

// Export utility for calculating percentage changes
export function calculatePercentageChange(current: number, previous: number): {
  value: number;
  type: 'increase' | 'decrease';
} {
  if (previous === 0) {
    return { value: 0, type: 'increase' };
  }
  
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.round(Math.abs(change) * 10) / 10, // Round to 1 decimal place
    type: change >= 0 ? 'increase' : 'decrease',
  };
}