'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  verifyToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  // Load token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setAuthState(prev => ({ ...prev, token }));
      verifyToken();
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const { user, token } = data.data;
        localStorage.setItem('auth_token', token);
        setAuthState({
          user,
          token,
          isLoading: false,
        });
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (data.success) {
        const { user, token } = data.data;
        localStorage.setItem('auth_token', token);
        setAuthState({
          user,
          token,
          isLoading: false,
        });
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
    });
  };

  const verifyToken = useCallback(async (): Promise<void> => {
    const token = authState.token || localStorage.getItem('auth_token');
    if (!token) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setAuthState({
          user: data.data.user,
          token,
          isLoading: false,
        });
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('auth_token');
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Token verification error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [authState.token]);

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    verifyToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};