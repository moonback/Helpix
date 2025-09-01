import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
}

interface UseGeolocationReturn extends GeolocationState {
  requestLocation: () => void;
  clearLocation: () => void;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    isLoading: false,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'La géolocalisation n\'est pas supportée par votre navigateur',
        isLoading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // Fonction pour essayer la géolocalisation avec différents niveaux de précision
    const tryGeolocation = (attempt: number = 1, maxAttempts: number = 3) => {
      const options = {
        enableHighAccuracy: attempt === 1, // Haute précision seulement au premier essai
        timeout: attempt === 1 ? 15000 : 10000, // Plus de temps pour la haute précision
        maximumAge: attempt === 1 ? 0 : 300000, // Pas de cache pour la haute précision
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Vérifier la précision (en mètres)
          const accuracy = position.coords.accuracy;
          
          // Si la précision est acceptable (< 100m) ou si c'est le dernier essai
          if (accuracy < 100 || attempt === maxAttempts) {
            setState({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              error: null,
              isLoading: false,
            });
          } else if (attempt < maxAttempts) {
            // Essayer avec moins de précision
            setTimeout(() => tryGeolocation(attempt + 1, maxAttempts), 1000);
          } else {
            // Accepter même si la précision n'est pas parfaite
            setState({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              error: null,
              isLoading: false,
            });
          }
        },
        (error) => {
          if (attempt < maxAttempts) {
            // Réessayer avec moins de précision
            setTimeout(() => tryGeolocation(attempt + 1, maxAttempts), 1000);
          } else {
            // Dernier essai échoué
            let errorMessage = 'Erreur de géolocalisation';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Permission de géolocalisation refusée. Veuillez l\'activer dans les paramètres de votre navigateur.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Informations de localisation indisponibles.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Délai d\'attente dépassé pour la géolocalisation.';
                break;
              default:
                errorMessage = 'Erreur inconnue lors de la géolocalisation.';
            }

            setState(prev => ({
              ...prev,
              error: errorMessage,
              isLoading: false,
            }));
          }
        },
        options
      );
    };

    // Commencer les tentatives
    tryGeolocation();
  }, []);

  const clearLocation = useCallback(() => {
    setState({
      latitude: null,
      longitude: null,
      accuracy: null,
      error: null,
      isLoading: false,
    });
  }, []);

  // Demander automatiquement la localisation au montage du composant
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    ...state,
    requestLocation,
    clearLocation,
  };
};
