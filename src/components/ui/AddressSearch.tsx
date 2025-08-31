import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddressSearchProps {
  value: string;
  onChange: (address: string) => void;
  onLocationSelect?: (lat: number, lng: number) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    country?: string;
  };
}

const AddressSearch: React.FC<AddressSearchProps> = ({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Rechercher une adresse...",
  label = "Adresse",
  required = false,
  className = ""
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Recherche d'adresses via OpenStreetMap Nominatim
  const searchAddresses = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1&countrycodes=fr,be,ch,ca&accept-language=fr`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresse:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Utiliser la localisation actuelle
  const useCurrentLocationHandler = () => {
    if (navigator.geolocation) {
      setUseCurrentLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLocation({ lat: latitude, lng: longitude });
          
          // Récupérer l'adresse correspondante
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=fr`
            );
            const data = await response.json();
            const address = data.display_name;
            setQuery(address);
            onChange(address);
            if (onLocationSelect) {
              onLocationSelect(latitude, longitude);
            }
          } catch (error) {
            console.error('Erreur lors de la récupération de l\'adresse:', error);
            // Utiliser les coordonnées si l'adresse ne peut pas être récupérée
            const coordsAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setQuery(coordsAddress);
            onChange(coordsAddress);
          }
          setUseCurrentLocation(false);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          setUseCurrentLocation(false);
        }
      );
    }
  };

  // Gérer la saisie avec debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        searchAddresses(query);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Sélectionner une suggestion
  const selectSuggestion = (suggestion: AddressSuggestion) => {
    const address = suggestion.display_name;
    setQuery(address);
    onChange(address);
    setSelectedLocation({ lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) });
    setShowSuggestions(false);
    
    if (onLocationSelect) {
      onLocationSelect(parseFloat(suggestion.lat), parseFloat(suggestion.lon));
    }
  };

  // Formater l'adresse pour l'affichage
  const formatAddress = (suggestion: AddressSuggestion) => {
    const { address } = suggestion;
    const parts = [];
    
    if (address.house_number && address.road) {
      parts.push(`${address.house_number} ${address.road}`);
    } else if (address.road) {
      parts.push(address.road);
    }
    
    if (address.postcode && address.city) {
      parts.push(`${address.postcode} ${address.city}`);
    } else if (address.city) {
      parts.push(address.city);
    }
    
    if (address.country) {
      parts.push(address.country);
    }
    
    return parts.length > 0 ? parts.join(', ') : suggestion.display_name;
  };

  // Effacer la recherche
  const clearSearch = () => {
    setQuery('');
    onChange('');
    setSelectedLocation(null);
    setSuggestions([]);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required={required}
        />
        
        {/* Bouton de localisation actuelle */}
        <button
          type="button"
          onClick={useCurrentLocationHandler}
          disabled={useCurrentLocation}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-600 hover:text-primary-700 disabled:opacity-50"
          title="Utiliser ma localisation actuelle"
        >
          {useCurrentLocation ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
          ) : (
            <Navigation className="h-5 w-5" />
          )}
        </button>
        
        {/* Bouton d'effacement */}
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-12 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            title="Effacer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Indicateur de localisation sélectionnée */}
      {selectedLocation && (
        <div className="mt-2 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
          <MapPin className="w-4 h-4" />
          <span>Localisation sélectionnée : {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</span>
        </div>
      )}

      {/* Suggestions d'adresses */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
                Recherche en cours...
              </div>
            ) : (
              <div className="py-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {formatAddress(suggestion)}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {suggestion.display_name}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Type: {suggestion.type} • Coordonnées: {parseFloat(suggestion.lat).toFixed(4)}, {parseFloat(suggestion.lon).toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="mt-2 text-xs text-gray-500">
        💡 Tapez au moins 3 caractères pour voir les suggestions • 🧭 Cliquez sur l'icône de navigation pour utiliser votre localisation actuelle
      </div>
    </div>
  );
};

export default AddressSearch;
