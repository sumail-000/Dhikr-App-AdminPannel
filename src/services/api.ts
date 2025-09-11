import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { config, endpoints } from '../utils/config';
import { getFromStorage, removeFromStorage } from '../utils';
import type {
  ApiResponse,
  AdminUser,
  User,
  Group,
  MotivationalVerse,
  SystemMetrics,
  PaginatedResponse,
} from '../types';

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: config.apiBaseUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      // Try both localStorage and sessionStorage for token
      let token: string | null = null;
      try {
        token = JSON.parse(localStorage.getItem('admin_token') || 'null');
      } catch {}
      if (!token) {
        try {
          token = JSON.parse(sessionStorage.getItem('admin_token') || 'null');
        } catch {}
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        // Clear auth data in both local and session storage and redirect to login
        try { localStorage.removeItem('admin_token'); } catch {}
        try { localStorage.removeItem('admin_user'); } catch {}
        try { sessionStorage.removeItem('admin_token'); } catch {}
        try { sessionStorage.removeItem('admin_user'); } catch {}
        
        // Dispatch logout event
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }

      // Handle network errors
      if (!error.response) {
        console.error('Network error:', error.message);
        return Promise.reject(new Error('Network error. Please check your connection.'));
      }

      // Handle API errors
      const apiError = error.response.data as ApiResponse;
      return Promise.reject(new Error(apiError.error || apiError.message || 'An error occurred'));
    }
  );

  return client;
};

// Create API client instance
const apiClient = createApiClient();

// Generic API request function
async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.request({
      method,
      url,
      data,
    });

    // Handle Laravel API response structure
    const responseData = response.data;
    
    // If response has 'ok' field, use it directly
    if (typeof responseData.ok !== 'undefined') {
      return responseData;
    }
    
    // For Laravel responses without 'ok' field, wrap them
    return {
      ok: true,
      data: responseData,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        ok: false,
        error: error.message,
      };
    }
    return {
      ok: false,
      error: 'An unexpected error occurred',
    };
  }
}

// Authentication Service
export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<{ user: AdminUser; token: string }>> {
    return apiRequest('POST', endpoints.auth.login, { email, password });
  },

  async logout(): Promise<ApiResponse<void>> {
    return apiRequest('POST', endpoints.auth.logout);
  },

  async me(): Promise<ApiResponse<AdminUser>> {
    return apiRequest('GET', endpoints.auth.me);
  },

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return apiRequest('POST', endpoints.auth.refresh);
  },
};

// User Management Service
export const userService = {
  async getUsers(page = 1, search = ''): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      ...(search && { search }),
    });
    return apiRequest('GET', `${endpoints.users.list}?${params}`);
  },

  async getUser(id: number): Promise<ApiResponse<User>> {
    return apiRequest('GET', endpoints.users.show(id));
  },

  async suspendUser(id: number): Promise<ApiResponse<void>> {
    return apiRequest('POST', endpoints.users.suspend(id));
  },

  async activateUser(id: number): Promise<ApiResponse<void>> {
    return apiRequest('POST', endpoints.users.activate(id));
  },

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return apiRequest('DELETE', endpoints.users.show(id));
  },
};

// Group Management Service
export const groupService = {
  async getGroups(type?: 'khitma' | 'dhikr'): Promise<ApiResponse<Group[]>> {
    const url = type === 'dhikr' ? endpoints.dhikrGroups.list : endpoints.groups.list;
    return apiRequest('GET', url);
  },

  async getGroup(id: number, type: 'khitma' | 'dhikr'): Promise<ApiResponse<Group>> {
    const url = type === 'dhikr' ? endpoints.dhikrGroups.show(id) : endpoints.groups.show(id);
    return apiRequest('GET', url);
  },

  async disableGroup(id: number, type: 'khitma' | 'dhikr'): Promise<ApiResponse<void>> {
    const url = type === 'dhikr' ? endpoints.dhikrGroups.disable(id) : endpoints.groups.disable(id);
    return apiRequest('POST', url);
  },

  async enableGroup(id: number, type: 'khitma' | 'dhikr'): Promise<ApiResponse<void>> {
    const url = type === 'dhikr' ? endpoints.dhikrGroups.enable(id) : endpoints.groups.enable(id);
    return apiRequest('POST', url);
  },

  async deleteGroup(id: number, type: 'khitma' | 'dhikr'): Promise<ApiResponse<void>> {
    const url = type === 'dhikr' ? endpoints.dhikrGroups.delete(id) : endpoints.groups.delete(id);
    return apiRequest('DELETE', url);
  },
};

// Verse Management Service
export const verseService = {
  async getVerses(): Promise<ApiResponse<MotivationalVerse[]>> {
    return apiRequest('GET', endpoints.verses.list);
  },

  async getVerse(id: number): Promise<ApiResponse<MotivationalVerse>> {
    return apiRequest('GET', endpoints.verses.show(id));
  },

  async createVerse(verse: Omit<MotivationalVerse, 'id' | 'usageCount'>): Promise<ApiResponse<MotivationalVerse>> {
    return apiRequest('POST', endpoints.verses.create, verse);
  },

  async updateVerse(id: number, verse: Partial<MotivationalVerse>): Promise<ApiResponse<MotivationalVerse>> {
    return apiRequest('PUT', endpoints.verses.update(id), verse);
  },

  async deleteVerse(id: number): Promise<ApiResponse<void>> {
    return apiRequest('DELETE', endpoints.verses.delete(id));
  },

  async toggleVerse(id: number): Promise<ApiResponse<MotivationalVerse>> {
    return apiRequest('POST', endpoints.verses.toggle(id));
  },
};

/* Notifications removed by request */

// Admin Profile Service
export const adminProfileService = {
  async updateProfile(payload: { username: string; avatar?: File | null }): Promise<ApiResponse<any>> {
    const form = new FormData();
    form.append('username', payload.username);
    if (payload.avatar) {
      form.append('avatar', payload.avatar);
    }
    try {
      const response = await apiClient.post(endpoints.adminProfile.update, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const responseData = response.data;
      return typeof responseData.ok !== 'undefined' ? responseData : { ok: true, data: responseData };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'Profile update failed' };
    }
  },

  async deleteAvatar(): Promise<ApiResponse<void>> {
    return apiRequest('DELETE', endpoints.adminProfile.deleteAvatar);
  },

  async changePassword(current_password: string, new_password: string, new_password_confirmation: string): Promise<ApiResponse<any>> {
    return apiRequest('POST', endpoints.adminProfile.changePassword, {
      current_password,
      new_password,
      new_password_confirmation,
    });
  },
};

// Analytics Service
export const analyticsService = {
  async getDashboardMetrics(): Promise<ApiResponse<SystemMetrics>> {
    return apiRequest('GET', endpoints.analytics.dashboard);
  },

  async getUserAnalytics(days = 30): Promise<ApiResponse<any>> {
    return apiRequest('GET', `${endpoints.analytics.users}?days=${days}`);
  },

  async getGroupAnalytics(days = 30): Promise<ApiResponse<any>> {
    return apiRequest('GET', `${endpoints.analytics.groups}?days=${days}`);
  },

  async getActivityData(days = 30): Promise<ApiResponse<any>> {
    return apiRequest('GET', `${endpoints.analytics.activity}?days=${days}`);
  },

  async getGroupDistribution(): Promise<ApiResponse<any>> {
    return apiRequest('GET', endpoints.analytics.groupDistribution);
  },

  async getMostUsedVerses(limit = 5): Promise<ApiResponse<any>> {
    return apiRequest('GET', `${endpoints.analytics.mostUsedVerses}?limit=${limit}`);
  },
};

// Export the API client for direct use if needed
export { apiClient };

// Export a function to update the base URL (useful for testing)
export function updateApiBaseUrl(newBaseUrl: string): void {
  apiClient.defaults.baseURL = newBaseUrl;
}