import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook personnalisé pour gérer l'authentification avec persistance automatique
 * Initialise automatiquement l'état d'authentification au démarrage
 */
export const useAuth = () => {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updateUserLocation,
    setUser,
    setLoading,
    setError,
    initializeAuth,
  } = useAuthStore();

  // Initialiser l'authentification au montage du composant
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updateUserLocation,
    setUser,
    setLoading,
    setError,
  };
};
