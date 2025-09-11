import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { PageLoader } from './ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user, token } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return <PageLoader text="Checking authentication..." />;
  }

  // Show login form if not authenticated
  if (!isAuthenticated || !token || !user) {
    return fallback || <LoginForm />;
  }

  // Render protected content
  return <>{children}</>;
}

// Higher-order component version
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook for components that require authentication
export function useRequireAuth() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      console.warn('Component requires authentication but user is not logged in');
    }
  }, [auth.loading, auth.isAuthenticated]);

  return auth;
}