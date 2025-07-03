import { UserInfo } from "../entities/user";

export interface AuthResult {
  success: boolean;
  error?: string;
  token?: string;
  user?: UserInfo;
  sessionId?: string;
  needsVerification?: boolean;
  verificationData?: Record<string, string>;
}

export interface AuthStrategy {
  id: string; // identifier
  name: string; // display name
  icon: React.ReactElement; // icon component

  // initiate auth process
  initiate(data: Record<string, string>): Promise<AuthResult>;

  // complete auth process
  complete(data: Record<string, string>): Promise<AuthResult>;

  // whether the current environment is supported
  isSupported(): boolean;
}
