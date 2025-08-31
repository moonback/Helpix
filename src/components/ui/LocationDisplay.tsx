import React from 'react';
import { MapPin } from 'lucide-react';
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
  const distance = userLat && userLon && latitude && longitude 
    ? calculateDistance(userLat, userLon, latitude, longitude)
    : null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <MapPin className="w-4 h-4 text-gray-400" />
      <div className="flex flex-col">
        <span className="truncate text-gray-600">{location}</span>
        {showDistance && distance !== null && (
          <span className="text-xs text-primary-600 font-medium">
            {formatDistance(distance)}
          </span>
        )}
      </div>
    </div>
  );
};

export default LocationDisplay;
