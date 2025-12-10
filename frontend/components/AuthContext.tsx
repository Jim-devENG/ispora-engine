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
    checkSession();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      // Use getSession instead of getUser for initial check (less strict)
      const { data: { session }, error } = await supabase.auth.getSession();
      
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

