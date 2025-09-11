import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AdminUser, AuthState } from '../types';
import { getFromStorage, setToStorage, removeFromStorage } from '../utils';

// Auth Actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: AdminUser; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: AdminUser }
  | { type: 'SET_LOADING'; payload: boolean };

// Auth Context Type
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: AdminUser) => void;
  clearError: () => void;
  error: string | null;
}

// Initial State
const initialState: AuthState & { error: string | null } = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Auth Reducer
function authReducer(
  state: AuthState & { error: string | null },
  action: AuthAction
): AuthState & { error: string | null } {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const remember = typeof window !== 'undefined' && localStorage.getItem('admin_remember_me') === 'true';
        const storage = remember ? localStorage : sessionStorage;
        const tokenRaw = storage.getItem('admin_token');
        const userRaw = storage.getItem('admin_user');
        const token = tokenRaw ? JSON.parse(tokenRaw) : null;
        const user = userRaw ? JSON.parse(userRaw) as AdminUser : null;

        if (token && user) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token },
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Import API service dynamically to avoid circular dependencies
      const { authService } = await import('../services/api');
      const response = await authService.login(email, password);

      if (response.ok && response.data) {
        const { user, token } = response.data;
        
        // Store in appropriate storage based on remember flag
        const remember = typeof window !== 'undefined' && localStorage.getItem('admin_remember_me') === 'true';
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('admin_token', JSON.stringify(token));
        storage.setItem('admin_user', JSON.stringify(user));

        // Clean up the other storage to avoid conflicts
        const other = remember ? sessionStorage : localStorage;
        other.removeItem('admin_token');
        other.removeItem('admin_user');

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    try {
      // Clear storage (both local and session)
      try { localStorage.removeItem('admin_token'); } catch {}
      try { localStorage.removeItem('admin_user'); } catch {}
      try { sessionStorage.removeItem('admin_token'); } catch {}
      try { sessionStorage.removeItem('admin_user'); } catch {}

      // Clear state
      dispatch({ type: 'LOGOUT' });

      // Optional: Call logout API endpoint
      import('../services/api').then(({ authService }) => {
        authService.logout().catch(console.error);
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear state even if API call fails
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Set user function
  const setUser = (user: AdminUser) => {
    setToStorage('admin_user', user);
    dispatch({ type: 'SET_USER', payload: user });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'LOGIN_FAILURE', payload: '' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    setUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for checking if user is authenticated
export function useRequireAuth(): AuthContextType {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      // Redirect to login or show login form
      console.warn('Authentication required');
    }
  }, [auth.loading, auth.isAuthenticated]);

  return auth;
}