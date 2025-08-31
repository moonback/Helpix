import React, { useRef } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface LocationMapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  className?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({
  latitude,
  longitude,
  address,
  className = ""
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Ouvrir dans Google Maps
  const openInGoogleMaps = () => {
    if (latitude && longitude) {
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(url, '_blank');
    }
  };

  // Ouvrir dans OpenStreetMap
  const openInOpenStreetMap = () => {
    if (latitude && longitude) {
      const url = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;
      window.open(url, '_blank');
    }
  };

  if (!latitude || !longitude) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Aucune localisation sélectionnée</p>
        <p className="text-sm text-gray-400 mt-1">
          Utilisez la recherche d'adresse pour sélectionner un lieu
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Carte statique via OpenStreetMap */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        <div 
          ref={mapContainerRef}
          className="w-full h-48 bg-gray-200 relative"
        >
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            title="Carte de localisation"
            className="w-full h-full"
          />
          
          {/* Marqueur de position */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Informations de localisation */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-600" />
              Localisation sélectionnée
            </h3>
            
            {address && (
              <p className="text-gray-700 mb-2">{address}</p>
            )}
            
            <div className="text-sm text-gray-500 space-y-1">
              <p>Latitude: {latitude.toFixed(6)}</p>
              <p>Longitude: {longitude.toFixed(6)}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={openInGoogleMaps}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              title="Ouvrir dans Google Maps"
            >
              <ExternalLink className="w-4 h-4" />
              Google Maps
            </button>
            
            <button
              type="button"
              onClick={openInOpenStreetMap}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              title="Ouvrir dans OpenStreetMap"
            >
              <ExternalLink className="w-4 h-4" />
              OpenStreetMap
            </button>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <Navigation className="w-4 h-4" />
          Actions rapides
        </h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• 📱 Partager cette localisation</p>
          <p>• 🚗 Obtenir l'itinéraire</p>
          <p>• 📍 Sauvegarder comme favori</p>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
