import React, { useMemo } from 'react';
import { Circle } from 'react-leaflet';
import { MapTask } from '../MapPage';
import TaskMarker from './TaskMarker';
import ItemMarker from './ItemMarker';

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

interface MarkersLayerProps {
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
}

const MarkersLayer: React.FC<MarkersLayerProps> = ({
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
  itemsLoading
}) => {
  // Filtrage des tâches
  const filteredTasks = useMemo(() => {
    if (isLoading) return [];

    return tasks.filter(task => {
      // Filtre par catégorie
      if (filterCategory !== 'all' && task.category !== filterCategory) {
        return false;
      }

      // Filtre par priorité
      if (filterPriority !== 'all' && task.priority !== filterPriority) {
        return false;
      }

      // Filtre par distance
      if (radiusKm > 0 && userLocation) {
        const distance = Math.sqrt(
          Math.pow(task.location.lat - userLocation.lat, 2) +
          Math.pow(task.location.lng - userLocation.lng, 2)
        ) * 111; // Approximation grossière en km
        if (distance > radiusKm) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filterCategory, filterPriority, radiusKm, userLocation, isLoading]);

  // Filtrage des items louables
  const filteredItems = useMemo(() => {
    if (itemsLoading) return [];

    return rentableItems.filter(item => {
      // Filtre par disponibilité
      if (onlyAvailableItems && !item.available) {
        return false;
      }

      // Filtre par recherche
      if (itemSearch && !item.name.toLowerCase().includes(itemSearch.toLowerCase())) {
        return false;
      }

      // Filtre par prix
      if (item.daily_price !== null) {
        if (item.daily_price < minPrice || item.daily_price > maxPrice) {
          return false;
        }
      }

      return true;
    });
  }, [rentableItems, onlyAvailableItems, itemSearch, minPrice, maxPrice, itemsLoading]);

  return (
    <>
      {/* Cercle de distance si un rayon est défini */}
      {userLocation && radiusKm > 0 && (
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={radiusKm * 1000} // Conversion km en mètres
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            weight: 2,
            dashArray: '5, 5'
          }}
        />
      )}

      {/* Marqueurs des tâches */}
      {filteredTasks.map(task => (
        <TaskMarker
          key={`task-${task.id}`}
          task={task}
          userLocation={userLocation}
          onTaskClick={onTaskClick}
          onOfferHelp={onOfferHelp}
        />
      ))}

      {/* Marqueurs des items louables */}
      {filteredItems.map(item => (
        <ItemMarker
          key={`item-${item.id}`}
          item={item}
          userLocation={userLocation}
          onOpenModal={onItemClick}
        />
      ))}
    </>
  );
};

export default MarkersLayer;
