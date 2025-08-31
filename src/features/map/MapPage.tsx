import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Filter } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useTaskStore } from '@/stores/taskStore';
import { Task } from '@/types';

// Fix pour les icônes Leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Composant pour centrer la carte sur la position de l'utilisateur
const LocationMarker: React.FC = () => {
  const map = useMap();
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 13);
        },
        () => {
          // Fallback sur Paris si la géolocalisation échoue
          map.setView([48.8566, 2.3522], 13);
        }
      );
    } else {
      // Fallback sur Paris si la géolocalisation n'est pas supportée
      map.setView([48.8566, 2.3522], 13);
    }
  }, [map]);

  return null;
};

const MapPage: React.FC = () => {
  const { tasks, fetchTasks } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [mapView, setMapView] = useState<'map' | 'list'>('map');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Données mockées pour la démonstration
  const mockTasks = [
    {
      id: 1,
      title: 'Aide au jardinage',
      description: 'Besoin d\'aide pour entretenir mon jardin',
      category: 'local' as const,
      status: 'open' as const,
      created_at: new Date().toISOString(),
      user_id: '1',
      location: { lat: 48.8566, lng: 2.3522 },
    },
    {
      id: 2,
      title: 'Cours de cuisine',
      description: 'Apprendre à cuisiner des plats traditionnels',
      category: 'local' as const,
      status: 'open' as const,
      created_at: new Date().toISOString(),
      user_id: '2',
      location: { lat: 48.8606, lng: 2.3376 },
    },
    {
      id: 3,
      title: 'Aide informatique',
      description: 'Besoin d\'aide pour configurer mon ordinateur',
      category: 'remote' as const,
      status: 'open' as const,
      created_at: new Date().toISOString(),
      user_id: '3',
      location: { lat: 48.8526, lng: 2.3666 },
    },
  ];

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleMapViewToggle = () => {
    setMapView(mapView === 'map' ? 'list' : 'map');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Carte d'entraide 🗺️
            </h1>
            <p className="text-gray-600">
              Découvrez les opportunités près de chez vous
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleMapViewToggle}
            icon={mapView === 'map' ? <Users size={20} /> : <MapPin size={20} />}
          >
            {mapView === 'map' ? 'Liste' : 'Carte'}
          </Button>
        </div>
      </motion.header>

      {/* Map View */}
      {mapView === 'map' ? (
        <div className="h-[calc(100vh-200px)] relative">
          <MapContainer
            center={[48.8566, 2.3522]}
            zoom={13}
            className="h-full w-full"
            style={{ height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker />
            
            {mockTasks.map((task) => (
              <Marker
                key={task.id}
                position={[task.location.lat, task.location.lng]}
                eventHandlers={{
                  click: () => handleTaskClick(task),
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm">{task.title}</h3>
                    <p className="text-xs text-gray-600">{task.description}</p>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        task.category === 'local' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {task.category === 'local' ? 'Local' : 'À distance'}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Filter size={16} />}
              className="bg-white shadow-lg"
            >
              Filtres
            </Button>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="px-6 py-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Tâches à proximité
            </h2>
            <p className="text-gray-600">
              {mockTasks.length} tâche{mockTasks.length !== 1 ? 's' : ''} trouvée{mockTasks.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-4">
            {mockTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  onClick={() => handleTaskClick(task)}
                  hover
                  className="cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {task.category === 'local' ? '🏠' : '🌐'}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {task.title}
                        </h3>
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        {task.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📍 Proche de vous</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          task.category === 'local' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {task.category === 'local' ? 'Local' : 'À distance'}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Logique pour aider
                      }}
                    >
                      Aider
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50"
          onClick={() => setSelectedTask(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {selectedTask.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedTask.description}
            </p>
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  // Logique pour aider
                  setSelectedTask(null);
                }}
              >
                Aider
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedTask(null)}
              >
                Fermer
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MapPage;
