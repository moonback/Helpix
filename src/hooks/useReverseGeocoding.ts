import { useState, useEffect, useCallback } from 'react';

interface ReverseGeocodingState {
  address: string | null;
  isLoading: boolean;
  error: string | null;
}

interface UseReverseGeocodingReturn extends ReverseGeocodingState {
  getAddressFromCoords: (latitude: number, longitude: number) => Promise<void>;
  clearAddress: () => void;
}

export const useReverseGeocoding = (): UseReverseGeocodingReturn => {
  const [state, setState] = useState<ReverseGeocodingState>({
    address: null,
    isLoading: false,
    error: null,
  });

  const getAddressFromCoords = useCallback(async (latitude: number, longitude: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Utiliser l'API de géocodification inverse gratuite (Nominatim/OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'fr,en',
            'User-Agent': 'EntraideUniverselle/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'adresse');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Construire une adresse lisible
      let address = '';
      
      if (data.address) {
        const addr = data.address;
        
        // Construire l'adresse de manière logique
        if (addr.house_number && addr.road) {
          address += `${addr.house_number} ${addr.road}`;
        } else if (addr.road) {
          address += addr.road;
        }
        
        if (addr.postcode && addr.city) {
          address += address ? `, ${addr.postcode} ${addr.city}` : `${addr.postcode} ${addr.city}`;
        } else if (addr.city) {
          address += address ? `, ${addr.city}` : addr.city;
        }
        
        if (addr.country && address) {
          address += `, ${addr.country}`;
        }
      }

      // Si pas d'adresse détaillée, utiliser le nom d'affichage
      if (!address && data.display_name) {
        address = data.display_name.split(',').slice(0, 3).join(',');
      }

      setState({
        address: address || 'Adresse non disponible',
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Erreur de géocodification inverse:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération de l\'adresse',
        isLoading: false,
      }));
    }
  }, []);

  const clearAddress = useCallback(() => {
    setState({
      address: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    getAddressFromCoords,
    clearAddress,
  };
};
