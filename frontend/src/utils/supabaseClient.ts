// Supabase Client Configuration
// This is the single source of truth for Supabase client initialization
// All Supabase operations should use this client instance

import { createClient } from '@supabase/supabase-js';
import type { Database as SupabaseDatabase } from '../types/supabase';

// Get Supabase credentials from environment variables
const supabaseUrl = (import.meta.env as any).VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta.env as any).VITE_SUPABASE_ANON_KEY;

// Create Supabase client with fallback values if env vars are missing
// This allows the app to load even if Supabase isn't configured
const safeUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeKey = supabaseAnonKey || 'placeholder-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Missing Supabase environment variables. The app will load but authentication will not work. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

// Create Supabase client
// Note: We'll add proper TypeScript types for the database schema later
export const supabase = createClient<SupabaseDatabase>(safeUrl, safeKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
        },
      }).catch((error) => {
        console.error('Supabase request failed:', error);
        throw error;
      });
    },
  },
});

// Check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Helper to get the current user
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// Helper to get the current session
export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

