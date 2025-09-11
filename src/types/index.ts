// API Response Types (matching Laravel structure)
export interface ApiResponse<T = any> {
  ok?: boolean;
  data?: T;
  error?: string;
  message?: string;
  // Laravel specific fields
  user?: T;
  token?: string;
  metrics?: T;
  analytics?: T;
  groups?: T;
  verses?: T;
  statistics?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

// Authentication Types (matching Laravel Admin model)
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'super_admin';
  avatar_url?: string;
  last_login_at?: string;
  created_at: string;
}

export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// User Management Types (matching Laravel User model)
export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  status?: 'active' | 'suspended';
  // Aggregates for groups
  groups_count?: number; // kept for backward-compat; not used in UI
  groups_joined?: number;
  groups_created?: number;
  last_activity_date?: string;
  last_activity_time?: string;
  stats?: {
    total_groups: number;
    groups_joined_total?: number;
    groups_created_total?: number;
    khitma_groups: number; // joined khitma groups
    dhikr_groups: number;  // joined dhikr groups
  };
  recent_activity?: Array<{
    activity_date: string;
    opened: boolean;
    reading: boolean;
  }>;
}

// Group Management Types (matching Laravel Group/DhikrGroup models)
export interface Group {
  id: number;
  name: string;
  type: 'khitma' | 'dhikr';
  creator_id: number;
  members_count: number;
  created_at: string;
  is_public: boolean;
  days_to_complete?: number;
  members_target?: number;
  start_date?: string;
  auto_assign_enabled?: boolean;
  // Dhikr specific fields
  dhikr_target?: number;
  dhikr_count?: number;
  dhikr_title?: string;
  dhikr_title_arabic?: string;
  // Summary data
  summary?: {
    completed_juz?: number;
    total_juz?: number;
  };
  members?: Array<{
    id: number;
    username: string;
    email: string;
    avatar_url?: string;
    role: 'admin' | 'member';
    dhikr_contribution?: number;
  }>;
}

// Motivational Verse Types (matching Laravel MotivationalVerse model)
export interface MotivationalVerse {
  id: number;
  surah_name?: string;
  surah_name_ar?: string;
  surah_number?: number;
  ayah_number?: number;
  arabic_text?: string;
  translation?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Notification Types (matching Laravel AppNotification model)
export interface AppNotification {
  id: number;
  user_id: number;
  type?: string;
  title?: string;
  body?: string;
  data?: any;
  read_at?: string;
  created_at: string;
}

export interface NotificationStats {
  total_sent: number;
  total_read: number;
}

// System Metrics Types (matching Laravel AdminAnalyticsController)
export interface SystemMetrics {
  total_users: number;
  active_users: number;
  new_users_today: number;
  total_groups: number;
  active_groups: number;
  total_verses: number;
  active_verses: number;
  notifications_sent_today: number;
}

// Analytics Types (matching Laravel analytics responses)
export interface UserAnalytics {
  daily_registrations: Array<{
    date: string;
    count: number;
  }>;
  daily_active_users: Array<{
    date: string;
    count: number;
  }>;
}

export interface GroupAnalytics {
  daily_khitma_groups: Array<{
    date: string;
    count: number;
  }>;
  daily_dhikr_groups: Array<{
    date: string;
    count: number;
  }>;
  khitma_completion_stats: Array<{
    id: number;
    name: string;
    total_assignments: number;
    completed_assignments: number;
    completion_rate: number;
  }>;
}

export interface ActivityAnalytics {
  daily_activity: Array<{
    date: string;
    active_users: number;
    app_opens: number;
    reading_sessions: number;
  }>;
  notification_stats: Array<{
    date: string;
    sent: number;
    read: number;
    read_rate: number;
  }>;
}

export interface ActivityData {
  date: string;
  users: number;
  groups: number;
  notifications: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface VerseForm {
  surahName: string;
  surahNameAr: string;
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translation: string;
  isActive: boolean;
}

// Common Types
export type UserAction = 'suspend' | 'activate' | 'delete' | 'view';
export type GroupAction = 'disable' | 'enable' | 'delete' | 'view';
export type VerseAction = 'activate' | 'deactivate' | 'edit' | 'delete';

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}