import React from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressDisplayProps {
  address: string | null;
  isLoading: boolean;
  error: string | null;
  className?: string;
}

const AddressDisplay: React.FC<AddressDisplayProps> = ({
  address,
  isLoading,
  error,
  className = ''
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
        <MapPin className="w-4 h-4" />
        <span>Adresse non disponible</span>
      </div>
    );
  }

  if (address) {
    return (
      <div className={`flex items-center gap-2 text-sm text-green-600 ${className}`}>
        <MapPin className="w-4 h-4" />
        <span className="truncate max-w-48" title={address}>
          {address}
        </span>
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

export default AddressDisplay;
