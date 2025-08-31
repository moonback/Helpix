import { useState, useCallback, useRef } from 'react';

interface ReverseGeocodingState {
  address: string | null;
  isLoading: boolean;
  error: string | null;
}

interface UseReverseGeocodingReturn extends ReverseGeocodingState {
  getAddressFromCoords: (latitude: number, longitude: number) => Promise<void>;
  clearAddress: () => void;
  retry: () => void;
}

// Services de géocodification avec fallback
const GEOCODING_SERVICES = [
  {
    name: 'Nominatim',
    url: 'https://nominatim.openstreetmap.org/reverse',
    timeout: 5000,
    headers: {
      'Accept-Language': 'fr,en',
      'User-Agent': 'EntraideUniverselle/1.0'
    }
  },
  {
    name: 'LocationIQ (Fallback)',
    url: 'https://us1.locationiq.com/v1/reverse.php',
    timeout: 8000,
    headers: {
      'Accept-Language': 'fr,en'
    },
    // Nécessite une clé API gratuite
    requiresKey: true
  }
];

// Cache local pour éviter les appels répétés
const addressCache = new Map<string, { address: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

export const useReverseGeocoding = (): UseReverseGeocodingReturn => {
  const [state, setState] = useState<ReverseGeocodingState>({
    address: null,
    isLoading: false,
    error: null,
  });
  
  const currentRequest = useRef<AbortController | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const generateCacheKey = (lat: number, lon: number): string => {
    // Arrondir à 4 décimales pour éviter trop de variations
    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLon = Math.round(lon * 10000) / 10000;
    return `${roundedLat},${roundedLon}`;
  };

  const getCachedAddress = (lat: number, lon: number): string | null => {
    const key = generateCacheKey(lat, lon);
    const cached = addressCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.address;
    }
    
    return null;
  };

  const setCachedAddress = (lat: number, lon: number, address: string): void => {
    const key = generateCacheKey(lat, lon);
    addressCache.set(key, { address, timestamp: Date.now() });
  };

  const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  const parseNominatimResponse = (data: any): string => {
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

    return address || 'Adresse non disponible';
  };

  const tryGeocodingService = async (service: typeof GEOCODING_SERVICES[0], lat: number, lon: number): Promise<string> => {
    const params = new URLSearchParams({
      format: 'json',
      lat: lat.toString(),
      lon: lon.toString(),
      zoom: '18',
      addressdetails: '1'
    });

    const url = `${service.url}?${params.toString()}`;
    
    const response = await fetchWithTimeout(url, {
      headers: service.headers
    }, service.timeout);

    if (!response.ok) {
      throw new Error(`Service ${service.name} a retourné ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return parseNominatimResponse(data);
  };

  const getAddressFromCoords = useCallback(async (latitude: number, longitude: number) => {
    // Annuler la requête précédente si elle existe
    if (currentRequest.current) {
      currentRequest.current.abort();
    }

    // Vérifier le cache d'abord
    const cachedAddress = getCachedAddress(latitude, longitude);
    if (cachedAddress) {
      setState({
        address: cachedAddress,
        isLoading: false,
        error: null,
      });
      return;
    }

    // Créer un nouveau contrôleur pour cette requête
    currentRequest.current = new AbortController();
    retryCount.current = 0;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Essayer les services dans l'ordre
      let lastError: Error | null = null;
      
      for (const service of GEOCODING_SERVICES) {
        try {
          // Skip LocationIQ si pas de clé API
          if (service.requiresKey) {
            continue;
          }

          const address = await tryGeocodingService(service, latitude, longitude);
          
          // Mettre en cache l'adresse réussie
          setCachedAddress(latitude, longitude, address);
          
          setState({
            address,
            isLoading: false,
            error: null,
          });
          
          return;
        } catch (error) {
          lastError = error;
          console.warn(`Service ${service.name} a échoué:`, error);
          continue;
        }
      }

      // Si tous les services ont échoué, essayer de générer une adresse basique
      if (lastError) {
        const basicAddress = `Coordonnées: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setCachedAddress(latitude, longitude, basicAddress);
        
        setState({
          address: basicAddress,
          isLoading: false,
          error: null,
        });
      }

    } catch (error) {
      console.error('Erreur de géocodification inverse:', error);
      
      // Générer une adresse basique en cas d'échec total
      const fallbackAddress = `Coordonnées: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      setCachedAddress(latitude, longitude, fallbackAddress);
      
      setState(prev => ({
        ...prev,
        address: fallbackAddress,
        error: 'Service temporairement indisponible, affichage des coordonnées',
        isLoading: false,
      }));
    }
  }, []);

  const retry = useCallback(() => {
    if (retryCount.current < maxRetries) {
      retryCount.current++;
      // Retry avec un délai exponentiel
      setTimeout(() => {
        // Recharger la dernière position si disponible
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              getAddressFromCoords(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
              console.error('Erreur lors de la récupération de la position:', error);
              setState(prev => ({
                ...prev,
                error: 'Impossible de récupérer la position actuelle'
              }));
            }
          );
        }
      }, Math.pow(2, retryCount.current) * 1000); // 2s, 4s, 8s
    }
  }, [getAddressFromCoords]);

  const clearAddress = useCallback(() => {
    if (currentRequest.current) {
      currentRequest.current.abort();
    }
    
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
    retry,
  };
};
