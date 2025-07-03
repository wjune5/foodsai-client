import { CONFIG } from '@/shared/constants/config';
import { getCookie, deleteCookie, getCookieConsent } from '@/shared/utils/cookie';
import { UserInfo } from '@/shared/entities/user';

/**
 * Check if user is authenticated
 * Check token in both cookie and localStorage
 */
export const isAuthenticated = () => {
    if (typeof window === 'undefined') {
      return false;
    }
  
    try {
      // Try to get token from cookie
      const cookieToken = getCookie(CONFIG.TOKEN_KEY);
  
      // If there's a valid token in cookie, consider authenticated
      if (cookieToken && cookieToken !== 'undefined') {
        return true;
      }
  
      // Otherwise check localStorage
      const localToken = localStorage.getItem(CONFIG.TOKEN_KEY);
      return !!localToken && localToken !== 'undefined';
    } catch (error) {
      console.error('Failed to check authentication:', error);
      return false;
    }
  };
  
  // get auth info(token, user, sessionId) from cookie and localStorage
  export const getAuthInfo = () => {
    try {
      // Try to get token from cookie
      let token = getCookie(CONFIG.TOKEN_KEY);
  
      // If no token in cookie, try to get from localStorage
      if (!token) {
        token = localStorage.getItem(CONFIG.TOKEN_KEY);
      }
  
      const userStr = localStorage.getItem(CONFIG.USER_INFO_KEY);
      const sessionId = localStorage.getItem(CONFIG.SESSION_ID_KEY);
  
      return {
        token,
        user: userStr ? JSON.parse(userStr) : null,
        sessionId,
      };
    } catch (error) {
      console.error('Failed to get auth:', error);
      return { token: null, user: null, sessionId: null };
    }
  }
  
  /**
   * Save authentication information
   * Determine storage location based on cookie availability and user consent
   */
  export const setAuthInfo = (
    token: string,
    user: UserInfo,
    sessionId?: string,
    expiresIn?: number
  ) => {
    if (typeof window === 'undefined') {
      return false;
    }
  
    try {
      clearAuthInfo();
      localStorage.removeItem('chat_session');
  
      const essentialUserInfo = {
        userId: user.id,
        userName: user.username,
        nickName: user.nickname,
        email: user.email,
        avatar: user.avatar
      };
  
      // User information is always stored in localStorage
      localStorage.setItem(CONFIG.USER_INFO_KEY, JSON.stringify(essentialUserInfo));
      if (sessionId) {
        localStorage.setItem(CONFIG.SESSION_ID_KEY, sessionId);
      }
  
      // 只在 consent === 'accepted' 时写入 cookie
      const consent = getCookieConsent();
      if (consent === 'accepted') {
        let cookieString = `${CONFIG.TOKEN_KEY}=${token}; path=/; secure; SameSite=Lax`;
        if (expiresIn) {
          cookieString += `; max-age=${expiresIn}`;
          localStorage.setItem(
            'token_expiry',
            (Date.now() + expiresIn * 1000).toString()
          );
        }
        document.cookie = cookieString;
          localStorage.setItem(CONFIG.TOKEN_KEY, token);
      } else {
        // 只写入 localStorage
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
        if (expiresIn) {
          localStorage.setItem(
            'token_expiry',
            (Date.now() + expiresIn * 1000).toString()
          );
        }
      }
  
      window.dispatchEvent(new Event('auth-state-changed'));
      return true;
    } catch (error) {
      console.error('Failed to set auth:', error);
      return false;
    }
  };
  /**
   * Clear authentication information
   * Clear data from both cookie and localStorage
   */
  export const clearAuthInfo = () => {
    if (typeof window === 'undefined') {
      return;
    }
  
    try {
      // Clear data from localStorage
      localStorage.removeItem(CONFIG.TOKEN_KEY);
      localStorage.removeItem(CONFIG.USER_INFO_KEY);
      localStorage.removeItem(CONFIG.SESSION_ID_KEY);
      localStorage.removeItem('ts');
      localStorage.removeItem('chat_session');
      localStorage.removeItem('chat_history');
      localStorage.removeItem('token_expiry');
  
      // Clear auth token cookie
      deleteCookie(CONFIG.TOKEN_KEY);
  
      // Trigger authentication state update event
      window.dispatchEvent(new Event('auth-state-changed'));
    } catch (error) {
      console.error('Failed to clear auth:', error);
    }
  };