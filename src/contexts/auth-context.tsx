"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  userType: 'customer' | 'business';
  fullName?: string;
  businessName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true);
    // Check for existing authentication on app start
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Only run on client side
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('smart_rewards_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Token is invalid, clear it
        if (typeof window !== 'undefined') {
          localStorage.removeItem('smart_rewards_token');
          localStorage.removeItem('smart_rewards_user');
        }
        setIsLoading(false);
        return;
      }

      const userData = await response.json();
      
      const user: User = {
        id: userData.id,
        email: userData.email,
        userType: userData.user_type,
        fullName: userData.customer?.full_name,
        businessName: userData.business?.business_name,
      };

      setUser(user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_rewards_user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear invalid data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('smart_rewards_token');
        localStorage.removeItem('smart_rewards_user');
      }
    } finally {
      setIsLoading(false);
    }
  };

    const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Starting login process for:', email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const { token } = await response.json();
      console.log('✅ Token received, fetching user profile...');
      
      // Store token (only on client side)
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_rewards_token', token);
      }

      // Get user profile to determine user type
      const profileResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await profileResponse.json();
      console.log('👤 User profile received:', userData);

      const user: User = {
        id: userData.id,
        email: userData.email,
        userType: userData.user_type,
        fullName: userData.customer?.full_name,
        businessName: userData.business?.business_name,
      };

      console.log('🚀 Login successful, user type:', user.userType);
      setUser(user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_rewards_user', JSON.stringify(user));
      }

      return user; // Return user object so caller can determine redirect
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('smart_rewards_user');
      localStorage.removeItem('smart_rewards_token');
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
