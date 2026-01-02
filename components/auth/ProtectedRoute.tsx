'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole = 'user',
  redirectTo = '/',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!loading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      // If role is required and user doesn't have it, redirect
      if (requiredRole === 'admin' && user?.role !== 'admin') {
        router.push(redirectTo);
        return;
      }
    }
  }, [isAuthenticated, loading, requiredRole, user, router, redirectTo]);

  // Show loading state while checking authentication
  if (loading || !isAuthenticated || (requiredRole === 'admin' && user?.role !== 'admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
