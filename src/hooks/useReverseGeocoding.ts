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
    timeout: 8000,
    headers: {
      'Accept-Language': 'fr,en',
      'User-Agent': 'EntraideUniverselle/1.0'
    }
  },
  {
    name: 'BigDataCloud',
    url: 'https://api.bigdatacloud.net/data/reverse-geocode-client',
    timeout: 10000,
    headers: {
      'Accept-Language': 'fr,en'
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
    let regionInfo = '';
    
    if (data.address) {
      const addr = data.address;
      
      // Construire l'adresse de rue (plus détaillée)
      if (addr.house_number && addr.road) {
        streetAddress = `${addr.house_number} ${addr.road}`;
      } else if (addr.road) {
        streetAddress = addr.road;
      } else if (addr.pedestrian) {
        streetAddress = addr.pedestrian;
      } else if (addr.footway) {
        streetAddress = addr.footway;
      } else if (addr.path) {
        streetAddress = addr.path;
      }
      
      // Construire les informations de ville (plus complètes)
      let cityParts = [];
      
      // Ajouter le code postal
      if (addr.postcode) {
        cityParts.push(addr.postcode);
      }
      
      // Ajouter la ville (priorité aux différents types)
      if (addr.city) {
        cityParts.push(addr.city);
      } else if (addr.town) {
        cityParts.push(addr.town);
      } else if (addr.village) {
        cityParts.push(addr.village);
      } else if (addr.hamlet) {
        cityParts.push(addr.hamlet);
      } else if (addr.municipality) {
        cityParts.push(addr.municipality);
      }
      
      cityInfo = cityParts.join(' ');
      
      // Construire les informations de région
      let regionParts = [];
      
      // Ajouter le département/région
      if (addr.county) {
        regionParts.push(addr.county);
      } else if (addr.state) {
        regionParts.push(addr.state);
      } else if (addr.region) {
        regionParts.push(addr.region);
      }
      
      // Ajouter le pays si différent de la France
      if (addr.country && addr.country !== 'France') {
        regionParts.push(addr.country);
      }
      
      regionInfo = regionParts.join(', ');
      
      // Assembler l'adresse complète de manière hiérarchique
      let addressParts = [];
      
      if (streetAddress) {
        addressParts.push(streetAddress);
      }
      
      if (cityInfo) {
        addressParts.push(cityInfo);
      }
      
      if (regionInfo) {
        addressParts.push(regionInfo);
      }
      
      address = addressParts.join(', ');
    }

    // Si pas d'adresse détaillée, utiliser le nom d'affichage avec plus de contexte
    if (!address && data.display_name) {
      const parts = data.display_name.split(',');
      // Prendre les 4 premières parties pour plus de contexte
      address = parts.slice(0, 4).join(',').trim();
    }

    // Nettoyer l'adresse finale
    if (address) {
      // Supprimer les espaces multiples
      address = address.replace(/\s+/g, ' ').trim();
      // Supprimer les virgules multiples
      address = address.replace(/,+/g, ',').trim();
      // Supprimer les virgules en début/fin
      address = address.replace(/^,|,$/g, '').trim();
    }

    return address || 'Adresse non disponible';
  };

  const parseBigDataCloudResponse = (data: any): string => {
    let address = '';
    let addressParts = [];
    
    if (data.localityInfo && data.localityInfo.administrative) {
      const admin = data.localityInfo.administrative;
      
      // Construire l'adresse de rue
      if (data.streetNumber && data.street) {
        addressParts.push(`${data.streetNumber} ${data.street}`);
      } else if (data.street) {
        addressParts.push(data.street);
      }
      
      // Ajouter la ville et le code postal
      if (data.postcode && data.city) {
        addressParts.push(`${data.postcode} ${data.city}`);
      } else if (data.city) {
        addressParts.push(data.city);
      }
      
      // Ajouter la région/département
      if (admin[1] && admin[1].name) {
        addressParts.push(admin[1].name);
      }
      
      // Ajouter le pays si différent de la France
      if (data.countryName && data.countryName !== 'France') {
        addressParts.push(data.countryName);
      }
      
      address = addressParts.join(', ');
    }

    return address || data.locality || 'Adresse non disponible';
  };

  const tryGeocodingService = async (service: typeof GEOCODING_SERVICES[0], lat: number, lon: number): Promise<string> => {
    let params: URLSearchParams;
    let url: string;
    
    if (service.name === 'BigDataCloud') {
      params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        localityLanguage: 'fr'
      });
      url = `${service.url}?${params.toString()}`;
    } else {
      // Nominatim et autres services
      params = new URLSearchParams({
        format: 'json',
        lat: lat.toString(),
        lon: lon.toString(),
        zoom: '18',
        addressdetails: '1',
        extratags: '1',
        namedetails: '1',
        'accept-language': 'fr,en'
      });
      url = `${service.url}?${params.toString()}`;
    }
    
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

    // Parser selon le service
    if (service.name === 'BigDataCloud') {
      return parseBigDataCloudResponse(data);
    } else {
      return parseNominatimResponse(data);
    }
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
