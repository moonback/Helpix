import { createClient } from '@supabase/supabase-js';

// Remplacez par vos vraies clés Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour les tables Supabase
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          password_hash: string;
          avatar_url: string | null;
          bio: string | null;
          location: string | null;
          credits: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          password_hash: string;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          credits?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          password_hash?: string;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          credits?: number;
          created_at?: string;
        };
      };
      skills: {
        Row: {
          id: number;
          user_id: string;
          skill_name: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          skill_name: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          skill_name?: string;
        };
      };
      items: {
        Row: {
          id: number;
          user_id: string;
          item_name: string;
          description: string | null;
          available: boolean;
        };
        Insert: {
          id?: number;
          user_id: string;
          item_name: string;
          description?: string | null;
          available?: boolean;
        };
        Update: {
          id?: number;
          user_id?: string;
          item_name?: string;
          description?: string | null;
          available?: boolean;
        };
      };
      tasks: {
        Row: {
          id: number;
          user_id: string;
          title: string;
          description: string | null;
          category: 'local' | 'remote';
          status: 'open' | 'in_progress' | 'completed' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          title: string;
          description?: string | null;
          category?: 'local' | 'remote';
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: 'local' | 'remote';
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: number;
          sender_id: string;
          receiver_id: string;
          credits: number;
          task_id: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          sender_id: string;
          receiver_id: string;
          credits: number;
          task_id?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          sender_id?: string;
          receiver_id?: string;
          credits?: number;
          task_id?: number | null;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: number;
          sender_id: string;
          receiver_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          sender_id: string;
          receiver_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          sender_id?: string;
          receiver_id?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
  };
};
