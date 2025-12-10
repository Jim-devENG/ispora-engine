// Supabase Auth Utility
// This replaces the old authAPI and uses Supabase Auth directly
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  // Add other fields as needed
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Register a new user with Supabase Auth
 * Also creates a profile entry in the profiles table
 */
export async function register(data: RegisterData): Promise<{ user: User | null; error: Error | null }> {
  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          name: `${data.firstName} ${data.lastName}`,
        },
      },
    });

    if (authError) {
      return { user: null, error: authError };
    }

    if (!authData.user) {
      return { user: null, error: new Error('User creation failed') };
    }

    // Create profile in profiles table
    // Note: Supabase triggers can handle this automatically, but we'll do it explicitly for now
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        // Set defaults for other required fields
        role: 'student',
        skills: [],
        expertise: [],
        interests: [],
        open_to: [],
        availability: {
          mentoring: false,
          collaboration: false,
          consultation: false,
        },
        social_links: {},
        achievements: [],
        universities: [],
        privacy: {
          profileVisibility: 'public',
          contactVisibility: 'alumni',
          professionalVisibility: 'public',
        },
        preferences: {
          language: 'en',
          timezone: 'UTC',
          theme: 'light',
        },
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Don't fail registration if profile creation fails - user can update it later
    }

    return { user: authData.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
}

/**
 * Login with Supabase Auth
 */
export async function login(data: LoginData): Promise<{ user: User | null; error: Error | null }> {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { user: null, error };
    }

    return { user: authData.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
}

/**
 * Logout from Supabase Auth
 */
export async function logout(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

/**
 * Refresh session (Supabase handles this automatically, but we provide a helper)
 */
export async function refreshSession() {
  const { data: { session }, error } = await supabase.auth.refreshSession();
  return { session, error };
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

/**
 * Auto-authenticate for development (creates a dev user if needed)
 * This replaces the old ensureDevAuth function
 */
export async function ensureDevAuth(): Promise<void> {
  if (!import.meta.env.DEV) {
    return; // Only run in development
  }

  try {
    // Check if we already have a session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      return; // Already authenticated
    }

    const devEmail = 'dev@aspora.local';
    const devPassword = 'dev123456';

    // Try to login first
    const { user: loginUser, error: loginError } = await login({
      email: devEmail,
      password: devPassword,
    });

    if (loginUser && !loginError) {
      return; // Login successful
    }

    // If login fails, try to register
    const { user: registerUser, error: registerError } = await register({
      email: devEmail,
      password: devPassword,
      firstName: 'Dev',
      lastName: 'User',
    });

    if (registerError) {
      console.warn('Could not auto-authenticate dev user:', registerError);
    }
  } catch (error) {
    console.warn('Dev auth setup failed:', error);
  }
}

/**
 * Listen to auth state changes
 * Useful for React components that need to react to login/logout
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}

