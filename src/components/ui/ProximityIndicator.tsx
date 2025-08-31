import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { calculateDistance, formatDistance } from '@/lib/utils';

interface ProximityIndicatorProps {
  userLat: number;
  userLon: number;
  taskLat: number;
  taskLon: number;
  showIcon?: boolean;
  className?: string;
}

const ProximityIndicator: React.FC<ProximityIndicatorProps> = ({
  userLat,
  userLon,
  taskLat,
  taskLon,
  showIcon = true,
  className = ''
}) => {
  const distance = calculateDistance(userLat, userLon, taskLat, taskLon);
  
  // Définir la couleur et l'icône selon la distance
  const getProximityStyle = (distance: number) => {
    if (distance <= 1) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: '🟢',
        label: 'Très proche'
      };
    } else if (distance <= 5) {
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: '🔵',
        label: 'Proche'
      };
    } else if (distance <= 20) {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: '🟡',
        label: 'Moyenne'
      };
    } else {
      return {
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        icon: '⚪',
        label: 'Loin'
      };
    }
  };

  const style = getProximityStyle(distance);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bgColor} ${style.color} ${style.borderColor} border`}>
          <Navigation className="w-3 h-3" />
          <span>{style.icon}</span>
        </div>
      )}
      <span className={`text-sm font-medium ${style.color}`}>
        {formatDistance(distance)}
      </span>
      <span className="text-xs text-gray-500">
        {style.label}
      </span>
    </div>
  );
};

export default ProximityIndicator;
