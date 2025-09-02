import React, { useMemo } from 'react';
import { Circle } from 'react-leaflet';
import { MapTask } from '../MapPage';
import TaskMarker from './TaskMarker';



interface MarkersLayerProps {
  // Tâches
  tasks: MapTask[];
  userLocation: { lat: number; lng: number } | null;
  onTaskClick: (task: MapTask) => void;
  onOfferHelp: (taskId: number) => void;
  // Filtres
  filterCategory: 'local' | 'remote' | 'all';
  filterPriority: 'urgent' | 'high' | 'medium' | 'low' | 'all';
  radiusKm: number;
  // État
  isLoading: boolean;
}

const MarkersLayer: React.FC<MarkersLayerProps> = ({
  tasks,
  userLocation,
  onTaskClick,
  onOfferHelp,
  filterCategory,
  filterPriority,
  radiusKm,
  isLoading
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


    </>
  );
};

export default MarkersLayer;
