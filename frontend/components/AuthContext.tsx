import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../src/utils/supabaseClient';
import { login as supabaseLogin, register as supabaseRegister, logout as supabaseLogout, getCurrentUser } from '../src/utils/auth';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    let mounted = true;
    
    checkSession();

    // Listen to auth state changes (with error handling)
    let subscription: { unsubscribe: () => void } | null = null;
    
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      });
      subscription = data;
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
      setLoading(false);
    }

    return () => {
      mounted = false;
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from auth state:', error);
        }
      }
    };
  }, []);

  const checkSession = async () => {
    try {
      // Check if Supabase is configured first
      const { isSupabaseConfigured } = await import('../src/utils/supabaseClient');
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured, skipping session check');
        setUser(null);
        setLoading(false);
        return;
      }

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session check timeout')), 5000)
      );

      // Use getSession instead of getUser for initial check (less strict)
      const sessionPromise = supabase.auth.getSession();
      
      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
      
      if (error || !session) {
        setUser(null);
      } else {
        setUser(session.user);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user: loggedInUser, error } = await supabaseLogin({ email, password });
      
      if (error) {
        const errorMessage = error.message || 'Failed to log in';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (loggedInUser) {
        setUser(loggedInUser);
        // Wait a bit for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 100));
        toast.success('Logged in successfully!');
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      const errorMessage = error?.message || 'An unexpected error occurred';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user: newUser, error } = await supabaseRegister({
        email,
        password,
        firstName,
        lastName,
      });

      if (error) {
        const errorMessage = error.message || 'Failed to register';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (newUser) {
        setUser(newUser);
        // Wait a bit for session to be fully established and profile to be created
        await new Promise(resolve => setTimeout(resolve, 500));
        toast.success('Account created successfully!');
        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      const errorMessage = error?.message || 'An unexpected error occurred';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabaseLogout();
      if (error) {
        toast.error('Failed to log out');
        return;
      }
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  const refreshUser = async (): Promise<void> => {
    await checkSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
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

