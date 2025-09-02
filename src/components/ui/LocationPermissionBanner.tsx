import React, { useState } from 'react';
import { AlertCircle, Navigation, Shield, Info, MapPin, Search } from 'lucide-react';
import Button from './Button';
import Input from './Input';

interface LocationPermissionBannerProps {
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
  onRequestLocation: () => void;
  onSetManualLocation?: (address: string) => void;
  className?: string;
}

const LocationPermissionBanner: React.FC<LocationPermissionBannerProps> = ({
  hasPermission,
  isLoading,
  error,
  onRequestLocation,
  onSetManualLocation,
  className = ''
}) => {
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  const handleManualLocationSubmit = () => {
    if (manualAddress.trim() && onSetManualLocation) {
      onSetManualLocation(manualAddress.trim());
      setShowManualInput(false);
      setManualAddress('');
    }
  };
  if (isLoading) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <div>
            <p className="text-sm font-medium text-blue-800">
              Localisation en cours...
            </p>
            <p className="text-xs text-blue-600">
              Nous récupérons votre position pour afficher les tâches les plus proches
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 mb-2">
              Erreur de géolocalisation
            </p>
            <p className="text-xs text-red-600 mb-3">
              {error}
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={onRequestLocation}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Navigation className="w-4 h-4 mr-1" />
                Réessayer
              </Button>
              {onSetManualLocation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Entrer mon adresse
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-100"
                onClick={() => window.open('https://support.google.com/chrome/answer/142065?hl=fr', '_blank')}
              >
                <Shield className="w-4 h-4 mr-1" />
                Aide
              </Button>
            </div>
            {showManualInput && onSetManualLocation && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-red-200">
                <div className="flex gap-2">
                  <Input
                    placeholder="Entrez votre adresse..."
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleManualLocationSubmit()}
                  />
                  <Button
                    size="sm"
                    onClick={handleManualLocationSubmit}
                    disabled={!manualAddress.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 mb-2">
              Géolocalisation requise
            </p>
            <p className="text-xs text-yellow-600 mb-3">
              Activez la géolocalisation pour voir les tâches les plus proches de chez vous
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={onRequestLocation}
                className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
              >
                <Navigation className="w-4 h-4 mr-1" />
                Activer la localisation
              </Button>
              {onSetManualLocation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Entrer mon adresse
                </Button>
              )}
            </div>
            {showManualInput && onSetManualLocation && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-yellow-200">
                <div className="flex gap-2">
                  <Input
                    placeholder="Entrez votre adresse..."
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleManualLocationSubmit()}
                  />
                  <Button
                    size="sm"
                    onClick={handleManualLocationSubmit}
                    disabled={!manualAddress.trim()}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LocationPermissionBanner;
