import { useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/services/AuthContext';
import toast from 'react-hot-toast';

export const useGuestModeWarning = () => {
  const { isGuestMode, guestModeState } = useAuth();

  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    if (isGuestMode && guestModeState.guestUser) {
      // Show browser's default "Leave Site?" dialog
      event.preventDefault();
      event.returnValue = 'You are in guest mode. Your data is stored locally and may be lost if you leave this page. Are you sure you want to leave?';
      return event.returnValue;
    }
  }, [isGuestMode, guestModeState.guestUser]);

  const handleVisibilityChange = useCallback(() => {
    if (isGuestMode && document.visibilityState === 'hidden') {
      // Show toast when user switches tabs or minimizes window
      toast('💡 Guest Mode: Your data is saved locally', {
        duration: 3000,
        icon: '👤',
        style: {
          background: '#fef3c7',
          color: '#92400e',
          border: '1px solid #f59e0b',
        },
      });
    }
  }, [isGuestMode]);

  const handlePageHide = useCallback(() => {
    if (isGuestMode) {
      // Show warning when page is about to be hidden
      toast('⚠️ Guest Mode: Your data is stored locally', {
        duration: 2000,
        icon: '⚠️',
        style: {
          background: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #f87171',
        },
      });
    }
  }, [isGuestMode]);

  useEffect(() => {
    if (isGuestMode) {
      // Add event listeners for window close/navigation
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('pagehide', handlePageHide);

      // Show initial guest mode notification
      toast('👤 Guest Mode Active', {
        duration: 4000,
        icon: '👤',
        style: {
          background: '#f0f9ff',
          color: '#0369a1',
          border: '1px solid #0ea5e9',
        },
        // description: 'Your data is stored locally on this device',
      });

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('pagehide', handlePageHide);
      };
    }
  }, [isGuestMode, handleBeforeUnload, handleVisibilityChange, handlePageHide]);

  return {
    isGuestMode,
    showGuestModeWarning: () => {
      if (isGuestMode) {
        toast('⚠️ Guest Mode Warning', {
          duration: 5000,
          icon: '⚠️',
          style: {
            background: '#fef3c7',
            color: '#92400e',
            border: '1px solid #f59e0b',
          },
        //   description: 'Your data is stored locally. Consider creating an account to save your data.',
        });
      }
    },
  };
}; 