/**
 * Utility functions for managing onboarding state
 * Useful for development and testing
 */

import { databaseService } from '@/shared/services/DatabaseService';

/**
 * Reset onboarding status - useful for testing
 */
export const resetOnboardingStatus = async (): Promise<void> => {
  try {
    await databaseService.resetOnboardingStatus();
    console.log('Onboarding status reset successfully');
  } catch (error) {
    console.error('Failed to reset onboarding status:', error);
    throw error;
  }
};

/**
 * Check if onboarding is completed
 */
export const isOnboardingCompleted = async (): Promise<boolean> => {
  try {
    return await databaseService.hasCompletedOnboarding();
  } catch (error) {
    console.error('Failed to check onboarding status:', error);
    return false;
  }
};

/**
 * Mark onboarding as completed
 */
export const markOnboardingCompleted = async (): Promise<void> => {
  try {
    await databaseService.markOnboardingCompleted();
    console.log('Onboarding marked as completed');
  } catch (error) {
    console.error('Failed to mark onboarding as completed:', error);
    throw error;
  }
};

// For development - expose these functions to window object
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).onboardingUtils = {
    reset: resetOnboardingStatus,
    check: isOnboardingCompleted,
    complete: markOnboardingCompleted,
  };
}
