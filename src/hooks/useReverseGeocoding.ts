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

      // Construire une adresse lisible et complète
      let address = '';
      let streetAddress = '';
      let cityInfo = '';
      
      if (data.address) {
        const addr = data.address;
        
        // Construire l'adresse de rue
        if (addr.house_number && addr.road) {
          streetAddress = `${addr.house_number} ${addr.road}`;
        } else if (addr.road) {
          streetAddress = addr.road;
        }
        
        // Construire les informations de ville
        if (addr.postcode && addr.city) {
          cityInfo = `${addr.postcode} ${addr.city}`;
        } else if (addr.city) {
          cityInfo = addr.city;
        }
        
        // Assembler l'adresse complète
        if (streetAddress && cityInfo) {
          address = `${streetAddress}, ${cityInfo}`;
        } else if (streetAddress) {
          address = streetAddress;
        } else if (cityInfo) {
          address = cityInfo;
        }
        
        // Ajouter le pays si différent de la France
        if (addr.country && addr.country !== 'France' && address) {
          address += `, ${addr.country}`;
        }
      }

      // Si pas d'adresse détaillée, utiliser le nom d'affichage
      if (!address && data.display_name) {
        const parts = data.display_name.split(',');
        // Prendre les 3 premières parties pour éviter une adresse trop longue
        address = parts.slice(0, 3).join(',').trim();
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
