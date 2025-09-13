'use client';

import { FC, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/shared/context/AuthContext';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';

interface OnboardingGuardProps {
  children: ReactNode;
}

const OnboardingGuard: FC<OnboardingGuardProps> = ({ children }) => {
  const { hasCompletedOnboarding, onboardingLoading, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const localize = useLocalizedPath();

  useEffect(() => {
    // Don't redirect if still loading
    if (loading || onboardingLoading) {
      return;
    }

    // Don't redirect if already on onboarding page
    if (pathname?.includes('/onboarding')) {
      return;
    }

    // Don't redirect if user has completed onboarding
    if (hasCompletedOnboarding) {
      return;
    }

    // Redirect to onboarding if not completed
    router.push(localize('/onboarding'));
  }, [hasCompletedOnboarding, onboardingLoading, loading, pathname, router, localize]);

  // Show loading state while checking onboarding status
  if (loading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not completed onboarding and not on onboarding page, don't render children
  // (redirect will happen in useEffect)
  if (!hasCompletedOnboarding && !pathname?.includes('/onboarding')) {
    return null;
  }

  // Render children if onboarding is completed or on onboarding page
  return <>{children}</>;
};

export default OnboardingGuard;
