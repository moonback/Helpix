import { createClient } from '@supabase/supabase-js';

// Remplacez par vos vraies clés Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Configuration améliorée pour la persistance de session
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configuration de la persistance de session
    persistSession: true,
    
    // Utiliser la clé de stockage par défaut de Supabase
    // storageKey: 'entraide-universelle-auth', // Commenté pour utiliser la clé par défaut
    
    // Gestion automatique du rafraîchissement des tokens
    autoRefreshToken: true,
    
    // Détection automatique de l'URL de redirection
    detectSessionInUrl: true,
    
    // Configuration des cookies
    cookieOptions: {
      // Nom du cookie de session
      name: 'entraide-universelle-session',
      
      // Durée de vie du cookie (7 jours par défaut)
      lifetime: 60 * 60 * 24 * 7,
      
      // Domaine du cookie (laisser undefined pour le domaine actuel)
      domain: undefined,
      
      // Chemin du cookie
      path: '/',
      
      // Cookie sécurisé en production
      secure: import.meta.env.PROD,
      
      // Protection contre les attaques XSS
      httpOnly: false, // Doit être false pour le côté client
      
      // Protection CSRF
      sameSite: 'lax' as const,
    }
  },
  
  // Configuration globale
  global: {
    headers: {
      'X-Client-Info': 'entraide-universelle-web',
    },
  },
});

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
