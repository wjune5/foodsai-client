'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { AuthResult } from '@/shared/auth/interfaces';
import { UserInfo } from '@/shared/entities/user';
import { getUserInfo, refreshUserInfo } from './UserService';
import { getStrategy } from '@/shared/auth/strategies';
import { getAuthInfo, setAuthInfo, clearAuthInfo, isAuthenticated } from '@/shared/auth/utils/auth_utils';
import { guestModeService, GuestModeState } from './GuestModeService';

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  isAuthenticated: boolean;
  isGuestMode: boolean;
  guestModeState: GuestModeState;
  login: (
    strategyId: string,
    data: Record<string, unknown>
  ) => Promise<AuthResult>;
  completeAuth: (
    strategyId: string,
    data: Record<string, unknown>
  ) => Promise<AuthResult>;
  logout: () => void;
  refreshUser: () => Promise<UserInfo | null>;
  enterGuestMode: () => Promise<void>;
  exitGuestMode: () => Promise<void>;
  migrateToAuthenticatedUser: (authenticatedUser: UserInfo) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestModeState, setGuestModeState] = useState<GuestModeState>({
    isGuestMode: false,
    guestUser: null,
    isInitialized: false
  });

  // initialize user info from local storage
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo) {
      setUser(userInfo);
      setLoading(false);
    } else {
      // if the original method does not get the user info, try to use the auth tool
      const { user: authUser } = getAuthInfo();
      if (authUser) {
        setUser(authUser);
      }
      setLoading(false);
    }

    // set up periodic refresh user info (every 30 minutes)
    const refreshInterval = setInterval(async () => {
      const refreshedUser = await refreshUserInfo();
      if (refreshedUser) {
        setUser(refreshedUser);
      }
    }, 30 * 60 * 1000);

    // listen to auth state change event
    const handleAuthChange = () => {
      const { user: updatedUser } = getAuthInfo();
      setUser(updatedUser);
    };

    window.addEventListener('auth-state-changed', handleAuthChange);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('auth-state-changed', handleAuthChange);
    };
  }, []);

  // login method
  const login = async (
    strategyId: string,
    data: Record<string, unknown>
  ): Promise<AuthResult> => {
    const strategy = getStrategy(strategyId);
    if (!strategy) return { success: false, error: 'Strategy not found' };
    return await strategy.initiate(data as Record<string, string>);
  };

  // complete auth method
  const completeAuth = async (
    strategyId: string,
    data: Record<string, unknown>
  ): Promise<AuthResult> => {
    const strategy = getStrategy(strategyId);
    if (!strategy) return { success: false, error: 'Login method not found' };
    const result = await strategy.complete(data as Record<string, string>);
    if (result.success && result.user && result.token) {
      setAuthInfo(result.token, result.user, result.sessionId);
      setUser(result.user as UserInfo);
    }
    return result;
  };

  const logout = () => {
    clearAuthInfo();
    setUser(null);
  };

  const refreshUser = async (): Promise<UserInfo | null> => {
    try {
      const refreshedUser = await refreshUserInfo();
      if (refreshedUser) {
        setUser(refreshedUser);
      }
      return refreshedUser;
    } catch (error) {
      console.error('Failed to refresh user info:', error);
      return null;
    }
  };

  // Guest mode methods
  const enterGuestMode = async (): Promise<void> => {
    try {
      const guestUser = await guestModeService.initializeGuestMode();
      const guestUserInfo = guestModeService.getUserInfo();
      
      setGuestModeState({
        isGuestMode: true,
        guestUser,
        isInitialized: true
      });
      
      if (guestUserInfo) {
        // FIXME convert guestUserInfo to UserInfo
        setUser(guestUserInfo as UserInfo);
      }
    } catch (error) {
      console.error('Failed to enter guest mode:', error);
      throw error;
    }
  };

  const exitGuestMode = async (): Promise<void> => {
    try {
      await guestModeService.clearDBData();
      setGuestModeState({
        isGuestMode: false,
        guestUser: null,
        isInitialized: false
      });
      setUser(null);
    } catch (error) {
      console.error('Failed to exit guest mode:', error);
      throw error;
    }
  };

  const migrateToAuthenticatedUser = async (authenticatedUser: UserInfo): Promise<void> => {
    try {
      await guestModeService.migrateToAuthenticatedUser(authenticatedUser);
      setGuestModeState({
        isGuestMode: false,
        guestUser: null,
        isInitialized: false
      });
      setUser(authenticatedUser);
    } catch (error) {
      console.error('Failed to migrate to authenticated user:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: isAuthenticated() || guestModeState.isGuestMode,
    isGuestMode: guestModeState.isGuestMode,
    guestModeState,
    login,
    completeAuth,
    logout,
    refreshUser,
    enterGuestMode,
    exitGuestMode,
    migrateToAuthenticatedUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
