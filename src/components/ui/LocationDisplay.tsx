import React, { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { calculateDistance, formatDistance } from '@/lib/utils';

interface LocationDisplayProps {
  location: string;
  latitude?: number;
  longitude?: number;
  userLat?: number;
  userLon?: number;
  showDistance?: boolean;
  className?: string;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({
  location,
  latitude,
  longitude,
  userLat,
  userLon,
  showDistance = false,
  className = ''
}) => {
  const [detailedAddress, setDetailedAddress] = useState<string | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  
  const distance = userLat && userLon && latitude && longitude 
    ? calculateDistance(userLat, userLon, latitude, longitude)
    : null;

  // Récupérer l'adresse détaillée si on a les coordonnées
  useEffect(() => {
    if (latitude && longitude) {
      setIsLoadingAddress(true);
      
      // Utiliser l'API de géocodification inverse
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'fr,en',
            'User-Agent': 'EntraideUniverselle/1.0'
          }
        }
      )
        .then(response => response.json())
        .then(data => {
          if (data.address) {
            const addr = data.address;
            let address = '';
            
            // Construire l'adresse de rue
            if (addr.house_number && addr.road) {
              address = `${addr.house_number} ${addr.road}`;
            } else if (addr.road) {
              address = addr.road;
            }
            
            // Ajouter ville et code postal
            if (addr.postcode && addr.city) {
              address += address ? `, ${addr.postcode} ${addr.city}` : `${addr.postcode} ${addr.city}`;
            } else if (addr.city) {
              address += address ? `, ${addr.city}` : addr.city;
            }
            
            setDetailedAddress(address || location);
          } else {
            setDetailedAddress(location);
          }
        })
        .catch(() => {
          setDetailedAddress(location);
        })
        .finally(() => {
          setIsLoadingAddress(false);
        });
    } else {
      setDetailedAddress(location);
    }
  }, [latitude, longitude, location]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <MapPin className="w-4 h-4 text-gray-400" />
      <div className="flex flex-col min-w-0">
        {isLoadingAddress ? (
          <div className="flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
            <span className="text-xs text-gray-400">Chargement...</span>
          </div>
        ) : (
          <>
            <span className="truncate text-gray-600 text-sm">
              {detailedAddress || location}
            </span>
            {showDistance && distance !== null && (
              <span className="text-xs text-primary-600 font-medium">
                {formatDistance(distance)}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LocationDisplay;
