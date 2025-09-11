// Environment configuration utility
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  appName: import.meta.env.VITE_APP_NAME || 'Wered Admin Panel',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  nodeEnv: import.meta.env.VITE_NODE_ENV || 'development',
  isDevelopment: import.meta.env.VITE_NODE_ENV === 'development',
  isProduction: import.meta.env.VITE_NODE_ENV === 'production',
  
  // Feature flags
  useMockAuth: import.meta.env.VITE_USE_MOCK_AUTH === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  // Optional services
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
  googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
} as const;

// Validate required environment variables
const requiredEnvVars = ['VITE_API_BASE_URL'] as const;

export function validateConfig(): void {
  const missing = requiredEnvVars.filter(
    (key) => !import.meta.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// API endpoints configuration
export const endpoints = {
  auth: {
    login: '/admin/auth/login',
    logout: '/admin/auth/logout',
    me: '/admin/auth/me',
    refresh: '/admin/auth/refresh',
  },
  adminProfile: {
    update: '/admin/profile',
    deleteAvatar: '/admin/profile/avatar',
    changePassword: '/admin/profile/password',
  },
  users: {
    list: '/admin/users',
    show: (id: number) => `/admin/users/${id}`,
    suspend: (id: number) => `/admin/users/${id}/suspend`,
    activate: (id: number) => `/admin/users/${id}/activate`,
    statistics: '/admin/users/statistics',
  },
  groups: {
    list: '/admin/groups',
    show: (id: number) => `/admin/groups/${id}`,
    disable: (id: number) => `/admin/groups/${id}/disable`,
    enable: (id: number) => `/admin/groups/${id}/enable`,
    delete: (id: number) => `/admin/groups/${id}`,
  },
  dhikrGroups: {
    list: '/admin/dhikr-groups',
    show: (id: number) => `/admin/dhikr-groups/${id}`,
    disable: (id: number) => `/admin/dhikr-groups/${id}/disable`,
    enable: (id: number) => `/admin/dhikr-groups/${id}/enable`,
    delete: (id: number) => `/admin/dhikr-groups/${id}`,
  },
  verses: {
    list: '/admin/motivational-verses',
    create: '/admin/motivational-verses',
    show: (id: number) => `/admin/motivational-verses/${id}`,
    update: (id: number) => `/admin/motivational-verses/${id}`,
    delete: (id: number) => `/admin/motivational-verses/${id}`,
    toggle: (id: number) => `/admin/motivational-verses/${id}/toggle`,
  },
  analytics: {
    dashboard: '/admin/analytics/dashboard',
    users: '/admin/analytics/users',
    groups: '/admin/analytics/groups',
    activity: '/admin/analytics/activity',
    groupDistribution: '/admin/analytics/group-distribution',
    mostUsedVerses: '/admin/analytics/most-used-verses',
  },
} as const;