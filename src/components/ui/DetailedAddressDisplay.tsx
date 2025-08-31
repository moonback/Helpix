import React from 'react';
import { MapPin, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface DetailedAddressDisplayProps {
  address: string | null;
  isLoading: boolean;
  error: string | null;
  showIcon?: boolean;
  className?: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
}

const DetailedAddressDisplay: React.FC<DetailedAddressDisplayProps> = ({
  address,
  isLoading,
  error,
  showIcon = true,
  className = '',
  onRetry,
  showRetryButton = true
}) => {
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-blue-600 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Récupération de l'adresse...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-sm text-orange-600 ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span className="flex-1">
          {error.includes('Service temporairement indisponible') 
            ? 'Service temporairement indisponible'
            : 'Adresse non disponible'
          }
        </span>
        {showRetryButton && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="p-1 h-auto text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  if (address) {
    // Vérifier si c'est une adresse de fallback (coordonnées)
    const isFallbackAddress = address.startsWith('Coordonnées:');
    
    if (isFallbackAddress) {
      return (
        <div className={`flex items-center gap-2 text-sm text-amber-600 ${className}`}>
          <MapPin className="w-4 h-4" />
          <span className="flex-1">Position détectée (adresse en cours de récupération)</span>
          {showRetryButton && onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="p-1 h-auto text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
        </div>
      );
    }

    // Diviser l'adresse en parties pour un affichage plus structuré
    const addressParts = address.split(',');
    
    return (
      <div className={`flex items-start gap-2 ${className}`}>
        {showIcon && <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />}
        <div className="flex flex-col min-w-0">
          {addressParts.length > 1 ? (
            <>
              {/* Rue */}
              <span className="text-sm font-medium text-green-700 truncate">
                {addressParts[0].trim()}
              </span>
              {/* Ville et code postal */}
              <span className="text-xs text-green-600">
                {addressParts.slice(1).join(',').trim()}
              </span>
            </>
          ) : (
            <span className="text-sm text-green-700 truncate">
              {address}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
      <MapPin className="w-4 h-4" />
      <span>Adresse non disponible</span>
    </div>
  );
};

export default DetailedAddressDisplay;
