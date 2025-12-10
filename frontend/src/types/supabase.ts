// Supabase Database Types
// This file will be auto-generated from Supabase schema using:
// npx supabase gen types typescript --project-id <project-id> > src/types/supabase.ts
// 
// For now, this is a placeholder that will be replaced with actual generated types
// once the Supabase project is set up and migrations are run.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          name: string;
          email: string;
          // ... other fields will be added when types are generated
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          // ... other fields
        };
        Update: {
          id?: string;
          first_name?: string;
          // ... other fields
        };
      };
      // ... other tables will be added when types are generated
    };
    Views: {
      // Views will be added when types are generated
    };
    Functions: {
      // Functions will be added when types are generated
    };
    Enums: {
      // Enums will be added when types are generated
    };
  };
}

