import { createElement } from 'react';
import { Mail } from 'lucide-react';
import { AuthStrategy, AuthResult } from '../interfaces';
import { API_ENDPOINTS } from '@/shared/constants/api';

export const EmailStrategy: AuthStrategy = {
  id: 'email',
  name: 'Email',
  icon: createElement(Mail),

  async initiate(data: { email: string }): Promise<AuthResult> {
    try {
      const res = await fetch(API_ENDPOINTS.AUTH_EMAIL_REQUEST_CODE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      const result = await res.json();
      if (res.ok) {
        return {
          success: true,
          needsVerification: true,
          verificationData: { email: data.email },
        };
      }
      return {
        success: false,
        error: result.error || 'Failed to send verification code',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send verification code',
      };
    }
  },

  async complete(data: {
    email: string;
    code: string;
    chatSessionId?: string;
  }): Promise<AuthResult> {
    try {
      const params = new URLSearchParams({
        email: data.email,
        code: data.code,
      });
      if (data.chatSessionId) params.append('session_id', data.chatSessionId);
      const res = await fetch(`/api/auth/email/verify?${params.toString()}`, {
        method: 'POST',
      });
      const result = await res.json();
      if (res.ok && result.token && result.user) {
        return {
          success: true,
          token: result.token,
          user: result.user,
          sessionId: result.session_id,
          needsVerification: result.needsProfile,
          verificationData: result.needsProfile
            ? { email: data.email }
            : undefined,
        };
      }
      return { success: false, error: result.error || 'Failed to verify code' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify code',
      };
    }
  },

  isSupported(): boolean {
    return true; // 邮箱认证总是支持的
  },
};
