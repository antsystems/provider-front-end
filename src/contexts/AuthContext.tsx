'use client';

import { createContext, useContext } from 'react';
import type { User, LoginCredentials, PhoneLoginCredentials } from '@/types/auth';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginDirect: (credentials: LoginCredentials) => Promise<void>;
  loginWithPhone: (credentials: PhoneLoginCredentials) => Promise<void>;
  sendOTP: (phone: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;