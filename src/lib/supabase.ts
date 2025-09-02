import { createClient } from '@supabase/supabase-js';

// Remplacez par vos vraies clés Supabase
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

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
          // Schéma rétro-compatible: accepter l'ancien et le nouveau
          skill_name?: string | null;
          name?: string | null;
          level?: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert' | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          skill_name?: string | null;
          name?: string | null;
          level?: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert' | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          skill_name?: string | null;
          name?: string | null;
          level?: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert' | null;
        };
      };
      items: {
        Row: {
          id: number;
          user_id: string;
          // Rétro-compat: accepter item_name ou name
          item_name?: string | null;
          name?: string | null;
          description: string | null;
          available: boolean;
          is_rentable: boolean;
          daily_price: number | null; // crédits / jour
          deposit: number;
        };
        Insert: {
          id?: number;
          user_id: string;
          item_name?: string | null;
          name?: string | null;
          description?: string | null;
          available?: boolean;
          is_rentable?: boolean;
          daily_price?: number | null;
          deposit?: number;
        };
        Update: {
          id?: number;
          user_id?: string;
          item_name?: string | null;
          name?: string | null;
          description?: string | null;
          available?: boolean;
          is_rentable?: boolean;
          daily_price?: number | null;
          deposit?: number;
        };
      };
      rentals: {
        Row: {
          id: string;
          item_id: number;
          owner_id: string;
          renter_id: string;
          start_date: string; // ISO date
          end_date: string;   // ISO date
          daily_price: number;
          total_credits: number;
          deposit_credits: number;
          status: 'requested' | 'accepted' | 'active' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item_id: number;
          owner_id: string;
          renter_id: string;
          start_date: string;
          end_date: string;
          daily_price: number;
          total_credits: number;
          deposit_credits?: number;
          status?: 'requested' | 'accepted' | 'active' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['rentals']['Row']>;
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
      help_offers: {
        Row: {
          id: string;
          task_id: number;
          helper_id: string;
          status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
          message: string | null;
          proposed_duration: number | null;
          proposed_credits: number | null;
          created_at: string;
          updated_at: string;
          responded_at: string | null;
          response_message: string | null;
        };
        Insert: {
          id?: string;
          task_id: number;
          helper_id: string;
          status?: 'pending' | 'accepted' | 'rejected' | 'cancelled';
          message?: string | null;
          proposed_duration?: number | null;
          proposed_credits?: number | null;
          created_at?: string;
          updated_at?: string;
          responded_at?: string | null;
          response_message?: string | null;
        };
        Update: {
          id?: string;
          task_id?: number;
          helper_id?: string;
          status?: 'pending' | 'accepted' | 'rejected' | 'cancelled';
          message?: string | null;
          proposed_duration?: number | null;
          proposed_credits?: number | null;
          created_at?: string;
          updated_at?: string;
          responded_at?: string | null;
          response_message?: string | null;
        };
      };
      help_offer_notifications: {
        Row: {
          id: string;
          help_offer_id: string;
          user_id: string;
          type: 'new_offer' | 'offer_accepted' | 'offer_rejected' | 'offer_cancelled';
          title: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          help_offer_id: string;
          user_id: string;
          type: 'new_offer' | 'offer_accepted' | 'offer_rejected' | 'offer_cancelled';
          title: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          help_offer_id?: string;
          user_id?: string;
          type?: 'new_offer' | 'offer_accepted' | 'offer_rejected' | 'offer_cancelled';
          title?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
  };
};
