import { create } from 'zustand';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateUserLocation: (latitude: number, longitude: number) => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  signUp: async (email: string, password: string, name: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Créer l'utilisateur dans notre table users
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              name,
              email,
              password_hash: '', // Supabase gère le hash
              credits: 100, // Crédits de bienvenue
            },
          ]);

        if (profileError) throw profileError;

        // Récupérer l'utilisateur créé
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userData) {
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erreur lors de l\'inscription',
        isLoading: false,
      });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Récupérer le profil utilisateur
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userData) {
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erreur lors de la connexion',
        isLoading: false,
      });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      await supabase.auth.signOut();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erreur lors de la déconnexion',
        isLoading: false,
      });
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    try {
      const { user } = get();
      if (!user) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Mettre à jour l'état local
      set({
        user: { ...user, ...updates },
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil',
      });
    }
  },

  updateUserLocation: async (latitude: number, longitude: number) => {
    try {
      const { user } = get();
      if (!user) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('users')
        .update({ 
          location: `${latitude},${longitude}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Mettre à jour l'état local
      set({
        user: { ...user, location: `${latitude},${longitude}` },
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la localisation',
      });
    }
  },

  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
