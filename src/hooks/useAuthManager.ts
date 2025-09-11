import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';

/**
 * Custom hook for managing authentication state and token refresh
 */
export function useAuthManager() {
    const auth = useAuth();

    // Token refresh function
    const refreshToken = useCallback(async () => {
        try {
            if (!auth.token) return false;

            const response = await authService.refreshToken();
            if (response.ok && response.data) {
                // Update token in storage and context
                const { token } = response.data;
                localStorage.setItem('admin_token', JSON.stringify(token));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }, [auth.token]);

    // Validate current session
    const validateSession = useCallback(async () => {
        try {
            if (!auth.token) return false;

            const response = await authService.me();
            if (response.ok && response.data) {
                // Update user data if it has changed
                if (JSON.stringify(auth.user) !== JSON.stringify(response.data)) {
                    auth.setUser(response.data);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Session validation failed:', error);
            return false;
        }
    }, [auth.token, auth.user, auth.setUser]);

    // Handle token expiration
    const handleTokenExpiration = useCallback(async () => {
        const refreshed = await refreshToken();
        if (!refreshed) {
            // Token refresh failed, logout user
            auth.logout();
            return false;
        }
        return true;
    }, [refreshToken, auth.logout]);

    // Set up token refresh interval
    useEffect(() => {
        if (!auth.isAuthenticated || !auth.token) return;

        // Validate session on mount
        validateSession();

        // Set up periodic token refresh (every 50 minutes for 1-hour tokens)
        const refreshInterval = setInterval(() => {
            handleTokenExpiration();
        }, 50 * 60 * 1000); // 50 minutes

        return () => clearInterval(refreshInterval);
    }, [auth.isAuthenticated, auth.token, validateSession, handleTokenExpiration]);

    // Listen for logout events from other tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'admin_token' && e.newValue === null) {
                // Token was removed in another tab, logout this tab too
                auth.logout();
            }
        };

        const handleLogoutEvent = () => {
            auth.logout();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('auth:logout', handleLogoutEvent);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('auth:logout', handleLogoutEvent);
        };
    }, [auth.logout]);

    // Handle page visibility change (validate session when page becomes visible)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && auth.isAuthenticated) {
                validateSession();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [auth.isAuthenticated, validateSession]);

    return {
        ...auth,
        refreshToken,
        validateSession,
        handleTokenExpiration,
    };
}

/**
 * Hook for handling login with better UX
 */
export function useLogin() {
    const auth = useAuth();

    const login = useCallback(
        async (email: string, password: string, options?: { rememberMe?: boolean }) => {
            try {
                await auth.login(email, password);

                // Optional: Handle "remember me" functionality
                if (options?.rememberMe) {
                    localStorage.setItem('admin_remember_me', 'true');
                }

                return { success: true };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Login failed',
                };
            }
        },
        [auth.login]
    );

    return {
        login,
        loading: auth.loading,
        error: auth.error,
        clearError: auth.clearError,
    };
}

/**
 * Hook for handling logout with cleanup
 */
export function useLogout() {
    const auth = useAuth();

    const logout = useCallback(
        async (options?: { redirectTo?: string }) => {
            try {
                // Clear remember me flag
                localStorage.removeItem('admin_remember_me');

                // Logout
                auth.logout();

                // Optional: Redirect to specific page
                if (options?.redirectTo) {
                    window.location.href = options.redirectTo;
                }

                return { success: true };
            } catch (error) {
                console.error('Logout error:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Logout failed',
                };
            }
        },
        [auth.logout]
    );

    return { logout };
}