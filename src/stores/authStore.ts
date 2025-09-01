import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true, // Commencer en chargement
      isAuthenticated: false,
      error: null,

      // Initialisation de l'authentification au démarrage
      initializeAuth: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Récupérer la session actuelle
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Erreur lors de la récupération de la session:', error);
            set({ isLoading: false, isAuthenticated: false, user: null });
            return;
          }

          if (session?.user) {
            // Récupérer le profil utilisateur depuis la base de données
            const { data: userData, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError) {
              console.error('Erreur lors de la récupération du profil:', profileError);
              set({ isLoading: false, isAuthenticated: false, user: null });
              return;
            }

            if (userData) {
              set({
                user: userData,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } else {
              set({ isLoading: false, isAuthenticated: false, user: null });
            }
          } else {
            set({ isLoading: false, isAuthenticated: false, user: null });
          }
        } catch (error) {
          console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de l\'initialisation',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
        }
      },

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

          // Vérifier si le profil existe déjà
          const { error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

          if (checkError && checkError.code === 'PGRST116') {
            // L'utilisateur n'existe pas, le créer
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: user.id,
                email: user.email,
                name: user.name || 'Utilisateur',
                ...updates,
                created_at: new Date().toISOString()
              });

            if (createError) throw createError;
          } else if (checkError) {
            throw checkError;
          } else {
            // L'utilisateur existe, le mettre à jour
            const { error: updateError } = await supabase
              .from('users')
              .update(updates)
              .eq('id', user.id);

            if (updateError) throw updateError;
          }

          // Mettre à jour l'état local
          set({
            user: { ...user, ...updates },
          });
        } catch (error) {
          console.error('Erreur lors de la mise à jour du profil:', error);
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil',
          });
        }
      },

      updateUserLocation: async (latitude: number, longitude: number) => {
        try {
          const { user } = get();
          if (!user) throw new Error('Utilisateur non connecté');

          // Vérifier si le profil existe déjà
          const { error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

          if (checkError && checkError.code === 'PGRST116') {
            // L'utilisateur n'existe pas, le créer
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: user.id,
                email: user.email,
                name: user.name || 'Utilisateur',
                location: `${latitude},${longitude}`,
                created_at: new Date().toISOString()
              });

            if (createError) throw createError;
          } else if (checkError) {
            throw checkError;
          } else {
            // L'utilisateur existe, le mettre à jour
            const { error: updateError } = await supabase
              .from('users')
              .update({ 
                location: `${latitude},${longitude}`
              })
              .eq('id', user.id);

            if (updateError) throw updateError;
          }

          // Mettre à jour l'état local
          set({
            user: { ...user, location: `${latitude},${longitude}` },
          });
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la localisation:', error);
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
    }),
    {
      name: 'entraide-universelle-auth', // Clé de stockage unique
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
