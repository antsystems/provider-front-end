'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import AuthContext from '@/contexts/AuthContext';
import authService from '@/services/auth';
import type { User, LoginCredentials, PhoneLoginCredentials } from '@/types/auth';
import { toast } from 'sonner';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!(user && token);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = authService.getCurrentToken();
        const storedUser = authService.getCurrentUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);

          // Token validation will happen when needed (e.g., on API calls)
          // No need to validate immediately on app startup
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid auth state
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);

      setUser(response.user);
      setToken(response.token || response.access_token);

      toast.success('Login successful!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginDirect = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.loginDirect(credentials);

      setUser(response.user);
      setToken(response.access_token ?? response.token ?? null);

      toast.success(response.message || 'Login successful!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPhone = async (credentials: PhoneLoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.verifyOTP(credentials);

      if (response.success) {
        // The auth service already handles user transformation and storage
        const currentUser = authService.getCurrentUser();
        const currentToken = authService.getCurrentToken();

        setUser(currentUser);
        setToken(currentToken);

        toast.success('OTP verification successful!');
      } else {
        throw new Error('OTP verification failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'OTP verification failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (phone: string) => {
    try {
      const response = await authService.sendOTP(phone);

      if (response.success) {
        toast.success(response.message || 'OTP sent successfully');
      } else {
        throw new Error('Failed to send OTP');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
  };

  const refreshProfile = async () => {
    try {
      if (!isAuthenticated) return;

      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error: unknown) {
      console.error('Profile refresh error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh profile';
      toast.error(errorMessage);

      // If token is invalid, logout
      if (error instanceof Error && (error.message?.includes('401') || error.message?.includes('unauthorized'))) {
        logout();
      }
    }
  };

  const validateToken = async (): Promise<boolean> => {
    try {
      const isValid = await authService.isAuthenticatedAsync();
      if (!isValid) {
        logout();
      }
      return isValid;
    } catch (error: unknown) {
      console.error('Token validation error:', error);
      logout();
      return false;
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    loginDirect,
    loginWithPhone,
    sendOTP,
    logout,
    refreshProfile,
    validateToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}