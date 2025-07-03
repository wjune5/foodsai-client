import { createElement } from 'react';
// Using a different icon since Chrome is deprecated
import { Globe } from 'lucide-react';
import { AuthStrategy, AuthResult } from '../interfaces';

export const GoogleStrategy: AuthStrategy = {
  id: 'google',
  name: 'Google',
  icon: createElement(Globe),

  async initiate(): Promise<AuthResult> {
    try {
      window.location.href = '/api/auth/google';
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to initiate Google authentication',
      };
    }
  },

  async complete(data: { code: string; state: string }): Promise<AuthResult> {
    try {
      const res = await fetch(
        `/api/auth/google/callback?code=${encodeURIComponent(
          data.code
        )}&state=${encodeURIComponent(data.state)}`
      );
      const result = await res.json();
      if (res.ok && result.token && result.user) {
        return {
          success: true,
          token: result.token,
          user: result.user,
          sessionId: result.session_id,
        };
      }
      return {
        success: false,
        error: result.error || 'Failed to complete Google authentication',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to complete Google authentication',
      };
    }
  },

  isSupported(): boolean {
    return true;
  },
};
