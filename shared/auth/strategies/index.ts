import React from 'react';
import { AuthStrategy } from '../interfaces';
import { EmailStrategy } from './email';
import { GoogleStrategy } from './google';
import { UserInfo } from '../../entities/user';

const strategies: Record<string, AuthStrategy> = {
  [EmailStrategy.id]: EmailStrategy,
  [GoogleStrategy.id]: GoogleStrategy,
  'token-exchange': {
    id: 'token-exchange',
    name: 'Token Exchange',
    icon: React.createElement(React.Fragment),
    isSupported: () => true,
    initiate: async () => ({ success: false, error: 'Not supported' }),
    complete: async (data: Record<string, unknown>) => {
      if (data.token && data.user) {
        return {
          success: true,
          user: data.user as UserInfo,
          token: data.token as string,
          sessionId: data.sessionId as string | undefined,
        };
      }
      return { success: false, error: 'Missing token or user' };
    },
  },
};

export const registerStrategy = (strategy: AuthStrategy) => {
  strategies[strategy.id] = strategy;
};

export const getStrategy = (id: string) => strategies[id];

export const getAllStrategies = (): AuthStrategy[] => {
  return Object.values(strategies).filter((strategy) => strategy.isSupported());
};
