'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo,
}: {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAppSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.replace(redirectTo);
    }
  }, [loading, isAuthenticated, user, requiredRole, redirectTo, router]);

  if (loading || !isAuthenticated) return null;

  return <>{children}</>;
}
