import React, { Suspense, lazy, useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import { MapPin, Loader2 } from 'lucide-react';
import { MapTask } from '../MapPage';
import RecenterControl from './RecenterControl';
import MapErrorBoundary from './MapErrorBoundary';
import { useMapKey } from '@/hooks/useMapKey';

// React-Leaflet components imported directly to avoid Suspense remounts

interface RentableItemMarker {
  id: number;
  name: string;
  description: string;
  daily_price: number | null;
  deposit: number;
  available: boolean;
  owner_id: string;
  location: { lat: number; lng: number } | null;
}

interface MapViewProps {
  // Tâches
  tasks: MapTask[];
  userLocation: { lat: number; lng: number } | null;
  onTaskClick: (task: MapTask) => void;
  onOfferHelp: (taskId: number) => void;
  // Items louables
  rentableItems: RentableItemMarker[];
  onItemClick: (item: RentableItemMarker) => void;
  // Filtres
  filterCategory: 'local' | 'remote' | 'all';
  filterPriority: 'urgent' | 'high' | 'medium' | 'low' | 'all';
  radiusKm: number;
  itemSearch: string;
  onlyAvailableItems: boolean;
  minPrice: number;
  maxPrice: number;
  // État
  isLoading: boolean;
  itemsLoading: boolean;
  // Actions
  onRecenter: () => void;
  className?: string;
}

// Composant de chargement
const MapLoadingFallback: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center bg-slate-50">
    <motion.div
      className="flex flex-col items-center space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
        <MapPin className="w-8 h-8 text-white" />
      </div>
      <div className="flex items-center space-x-2">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        <span className="text-slate-600 font-medium">Chargement de la carte...</span>
      </div>
    </motion.div>
  </div>
);

// Composant interne de la carte (sans lazy loading)
const MapContent: React.FC<MapViewProps> = (props) => {
  const {
    tasks,
    userLocation,
    onTaskClick,
    onOfferHelp,
    rentableItems,
    onItemClick,
    filterCategory,
    filterPriority,
    radiusKm,
    itemSearch,
    onlyAvailableItems,
    minPrice,
    maxPrice,
    isLoading,
    itemsLoading,
    onRecenter,
    className = ''
  } = props;

  // Lazy load MarkersLayer
  const MarkersLayer = lazy(() => import('./MarkersLayer'));

  const CenterOnLocation: React.FC<{ center: { lat: number; lng: number } | null }> = ({ center }) => {
    const map = useMap();
    React.useEffect(() => {
      if (center) {
        map.setView([center.lat, center.lng], map.getZoom() || 13, { animate: true });
      }
    }, [center, map]);
    return null;
  };

  const [mounted, setMounted] = useState(false);
  const mapKey = useMapKey();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {!mounted ? (
        <MapLoadingFallback />
      ) : (
        <MapErrorBoundary>
          <MapContainer
            key={mapKey}
            center={userLocation || [48.8566, 2.3522]}
            zoom={userLocation ? 13 : 10}
            className="w-full h-full z-0"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Center the map when userLocation becomes available */}
            <CenterOnLocation center={userLocation} />

            <Suspense fallback={null}>
              <MarkersLayer
                tasks={tasks}
                userLocation={userLocation}
                onTaskClick={onTaskClick}
                onOfferHelp={onOfferHelp}
                rentableItems={rentableItems}
                onItemClick={onItemClick}
                filterCategory={filterCategory}
                filterPriority={filterPriority}
                radiusKm={radiusKm}
                itemSearch={itemSearch}
                onlyAvailableItems={onlyAvailableItems}
                minPrice={minPrice}
                maxPrice={maxPrice}
                isLoading={isLoading}
                itemsLoading={itemsLoading}
              />
            </Suspense>
          </MapContainer>

          {/* Contrôle de recentrage */}
          <RecenterControl
            onRecenter={onRecenter}
            userLocation={userLocation}
          />
        </MapErrorBoundary>
      )}
    </div>
  );
};

// Composant principal avec lazy loading
const MapView: React.FC<MapViewProps> = (props) => {
  return (
    <Suspense fallback={<MapLoadingFallback />}>
      <MapContent {...props} />
    </Suspense>
  );
};

export default MapView;
