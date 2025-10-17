import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

const supabaseUrl = 'https://your-project.supabase.co'; // Replace with actual URL
const supabaseAnonKey = 'your-anon-key'; // Replace with actual key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: browser,
    autoRefreshToken: browser,
  }
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          supabase_user_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          role: 'student' | 'guardian' | 'teacher' | 'admin';
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supabase_user_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          role?: 'student' | 'guardian' | 'teacher' | 'admin';
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supabase_user_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          role?: 'student' | 'guardian' | 'teacher' | 'admin';
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      teachers: {
        Row: {
          id: string;
          profile_id: string;
          verified: boolean;
          bio: string | null;
          subjects: string[] | null;
          verification_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          verified?: boolean;
          bio?: string | null;
          subjects?: string[] | null;
          verification_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          verified?: boolean;
          bio?: string | null;
          subjects?: string[] | null;
          verification_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notices: {
        Row: {
          id: string;
          title: string;
          body: string;
          language: 'bn' | 'en';
          is_published: boolean;
          author_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          language?: 'bn' | 'en';
          is_published?: boolean;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string;
          language?: 'bn' | 'en';
          is_published?: boolean;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      media: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          file_path: string;
          file_type: string;
          file_size: number | null;
          uploaded_by: string | null;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          file_path: string;
          file_type: string;
          file_size?: number | null;
          uploaded_by?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          file_path?: string;
          file_type?: string;
          file_size?: number | null;
          uploaded_by?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
      };
    };
  };
};