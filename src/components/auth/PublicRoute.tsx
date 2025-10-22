'use client';

import React, { ReactNode, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';

interface PublicRouteProps {
  children: ReactNode;
  redirectIfAuthenticated?: boolean;
  redirectTo?: string;
}

function AuthenticationCheck({
  children,
  redirectIfAuthenticated,
  redirectTo
}: PublicRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Skip redirection logic while loading
    if (isLoading) return;

    // Handle redirection for authenticated users
    if (isAuthenticated && redirectIfAuthenticated) {
      const handleRedirect = async () => {
        try {
          // Get return URL from query params
          const returnUrl = searchParams.get('returnUrl');

          // Determine destination based on precedence:
          // 1. Explicitly provided redirectTo
          // 2. Valid returnUrl from query params
          // 3. Role-based default route
          // 4. Fallback to dashboard
          let destination = redirectTo;

          if (!destination && returnUrl && returnUrl.startsWith('/') && !returnUrl.includes('/login')) {
            destination = returnUrl;
          }

          if (!destination) {
            // Role-based default routes
            destination = user?.role === 'employee' ? '/claims' : '/dashboard';
          }

          // Perform redirection
          router.push(destination);
          
          // Clear any existing return URL from URL if it exists
          if (returnUrl) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          }
        } catch (error) {
          console.error('Redirection error:', error);
        }
      };

      handleRedirect();
    }
  }, [isAuthenticated, isLoading, user, router, searchParams, redirectIfAuthenticated, redirectTo]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If authenticated and should redirect, don't render anything (redirect will happen)
  if (isAuthenticated && redirectIfAuthenticated) {
    return <LoadingScreen />;
  }

  // If not authenticated or should not redirect, render children
  return <>{children}</>;
}

export default function PublicRoute(props: PublicRouteProps) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AuthenticationCheck {...props} />
    </Suspense>
  );
}