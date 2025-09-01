import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Filter } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
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
  const navigate = useNavigate();
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const { user } = useAuthStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [mapView, setMapView] = useState<'map' | 'list'>('map');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Utiliser uniquement les vraies tâches de la BDD avec localisation
  const allTasks: MapTask[] = tasks
    .filter(task => task.latitude && task.longitude)
    .map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      status: task.status,
      priority: task.priority,
      estimated_duration: task.estimated_duration,
      budget_credits: task.budget_credits,
      required_skills: task.required_skills,
      tags: task.tags,
      created_at: task.created_at,
      user_id: task.user_id,
      location: { lat: task.latitude!, lng: task.longitude! },
    }));

  // Type partiel pour les tâches de la carte
  type MapTask = Pick<Task, 'id' | 'title' | 'description' | 'category' | 'status' | 'created_at' | 'user_id' | 'priority' | 'estimated_duration' | 'budget_credits' | 'required_skills' | 'tags'> & {
    location: { lat: number; lng: number };
  };

  const handleTaskClick = (task: MapTask) => {
    // Récupérer la tâche complète depuis le store
    const dbTask = tasks.find(t => t.id === task.id);
    if (dbTask) {
      setSelectedTask(dbTask);
    }
  };

  const handleMapViewToggle = () => {
    setMapView(mapView === 'map' ? 'list' : 'map');
  };

  const handleOfferHelp = (taskId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/task/${taskId}/offers`);
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
           {isLoading ? (
             <div className="h-full flex items-center justify-center bg-gray-50">
               <div className="text-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                 <p className="text-gray-600">Chargement des tâches...</p>
               </div>
             </div>
           ) : (
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
               
               {allTasks.length === 0 ? (
                 <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                   <div className="text-center">
                     <div className="text-6xl mb-4">🗺️</div>
                     <h3 className="text-lg font-semibold text-gray-900 mb-2">
                       Aucune tâche localisée
                     </h3>
                     <p className="text-gray-600">
                       Créez des tâches avec localisation pour les voir sur la carte
                     </p>
                   </div>
                 </div>
               ) : (
                 allTasks.map((task) => (
                                       <Marker
                      key={task.id}
                      position={[task.location.lat, task.location.lng]}
                    >
                                           <Popup className="min-w-[280px]">
                        <div className="p-3">
                          {/* Header avec titre et catégorie */}
                          <div className="mb-3">
                            <h3 className="font-semibold text-base text-gray-900 mb-1">{task.title}</h3>
                            <div className="flex items-center gap-2">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                                task.category === 'local' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {task.category === 'local' ? '📍 Sur place' : '💻 À distance'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(task.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                          
                          {/* Description */}
                          <p className="text-sm text-gray-700 mb-3 leading-relaxed">{task.description}</p>
                          
                          {/* Détails de la tâche */}
                          <div className="space-y-2 mb-3">
                            {/* Priorité */}
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500">Priorité:</span>
                              <span className={`px-2 py-1 rounded-full font-medium ${
                                task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {task.priority === 'urgent' ? '🔴 Urgente' :
                                 task.priority === 'high' ? '🟠 Élevée' :
                                 task.priority === 'medium' ? '🟡 Moyenne' : '🟢 Faible'}
                              </span>
                            </div>
                            
                            {/* Durée et budget */}
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <span>⏱️ {task.estimated_duration}h</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>💰 {task.budget_credits} crédits</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Compétences et tags */}
                          {task.required_skills && task.required_skills.length > 0 && (
                            <div className="mb-2">
                              <div className="text-xs text-gray-500 mb-1">Compétences requises:</div>
                              <div className="flex flex-wrap gap-1">
                                {task.required_skills.slice(0, 3).map((skill, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {skill}
                                  </span>
                                ))}
                                {task.required_skills.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    +{task.required_skills.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs text-gray-500 mb-1">Tags:</div>
                              <div className="flex flex-wrap gap-1">
                                {task.tags.slice(0, 4).map((tag, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    #{tag}
                                  </span>
                                ))}
                                {task.tags.length > 4 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    +{task.tags.length - 4}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Actions */}
                          <div className="flex gap-2 pt-2 border-t border-gray-200">
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() => handleTaskClick(task)}
                            >
                              Voir détails
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleOfferHelp(task.id)}
                            >
                              Aider
                            </Button>
                          </div>
                        </div>
                      </Popup>
                   </Marker>
                 ))
               )}
             </MapContainer>
           )}

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
               {allTasks.length} tâche{allTasks.length !== 1 ? 's' : ''} trouvée{allTasks.length !== 1 ? 's' : ''}
             </p>
           </div>

           <div className="space-y-4">
             {allTasks.map((task, index) => (
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
                        handleOfferHelp(task.id);
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-[9999]"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto relative z-[10000]"
              onClick={(e) => e.stopPropagation()}
            >
             {/* Header */}
             <div className="mb-6">
               <h3 className="text-2xl font-bold text-gray-900 mb-2">
                 {selectedTask.title}
               </h3>
               <div className="flex items-center gap-3 text-sm text-gray-600">
                 <span className={`px-3 py-1 rounded-full font-medium ${
                   selectedTask.category === 'local' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                 }`}>
                   {selectedTask.category === 'local' ? '📍 Sur place' : '💻 À distance'}
                 </span>
                 <span className={`px-3 py-1 rounded-full font-medium ${
                   selectedTask.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                   selectedTask.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                   selectedTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                   'bg-green-100 text-green-800'
                 }`}>
                   {selectedTask.priority === 'urgent' ? '🔴 Urgente' :
                    selectedTask.priority === 'high' ? '🟠 Élevée' :
                    selectedTask.priority === 'medium' ? '🟡 Moyenne' : '🟢 Faible'}
                 </span>
               </div>
             </div>

             {/* Description */}
             <div className="mb-6">
               <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
               <p className="text-gray-700 leading-relaxed">
                 {selectedTask.description}
               </p>
             </div>

             {/* Détails de la tâche */}
             <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-gray-50 p-4 rounded-lg">
                 <div className="flex items-center gap-2 mb-2">
                   <span className="text-2xl">⏱️</span>
                   <div>
                     <div className="font-medium text-gray-900">{selectedTask.estimated_duration}h</div>
                     <div className="text-sm text-gray-600">Durée estimée</div>
                   </div>
                 </div>
               </div>
               
               <div className="bg-gray-50 p-4 rounded-lg">
                 <div className="flex items-center gap-2 mb-2">
                   <span className="text-2xl">💰</span>
                   <div>
                     <div className="font-medium text-gray-900">{selectedTask.budget_credits} crédits</div>
                     <div className="text-sm text-gray-600">Budget</div>
                   </div>
                 </div>
               </div>
             </div>

             {/* Compétences requises */}
             {selectedTask.required_skills && selectedTask.required_skills.length > 0 && (
               <div className="mb-6">
                 <h4 className="font-semibold text-gray-900 mb-3">Compétences requises</h4>
                 <div className="flex flex-wrap gap-2">
                   {selectedTask.required_skills.map((skill, idx) => (
                     <span key={idx} className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">
                       {skill}
                     </span>
                   ))}
                 </div>
               </div>
             )}

             {/* Tags */}
             {selectedTask.tags && selectedTask.tags.length > 0 && (
               <div className="mb-6">
                 <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                 <div className="flex flex-wrap gap-2">
                   {selectedTask.tags.map((tag, idx) => (
                     <span key={idx} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-full font-medium">
                       #{tag}
                     </span>
                   ))}
                 </div>
               </div>
             )}

             {/* Informations de localisation */}
             {selectedTask.latitude && selectedTask.longitude && (
               <div className="mb-6">
                 <h4 className="font-semibold text-gray-900 mb-3">Localisation</h4>
                 <div className="bg-gray-50 p-4 rounded-lg">
                   <div className="text-sm text-gray-600 mb-2">Coordonnées GPS:</div>
                   <div className="font-mono text-gray-800">
                     {selectedTask.latitude.toFixed(6)}, {selectedTask.longitude.toFixed(6)}
                   </div>
                   {selectedTask.location && (
                     <div className="text-sm text-gray-600 mt-2">
                       Adresse: {selectedTask.location}
                     </div>
                   )}
                 </div>
               </div>
             )}

             {/* Informations temporelles */}
             <div className="mb-6">
               <h4 className="font-semibold text-gray-900 mb-3">Informations temporelles</h4>
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-gray-50 p-3 rounded-lg">
                   <div className="text-sm text-gray-600">Créée le</div>
                   <div className="font-medium text-gray-900">
                     {new Date(selectedTask.created_at).toLocaleDateString('fr-FR', {
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric'
                     })}
                   </div>
                 </div>
                 {selectedTask.deadline && (
                   <div className="bg-gray-50 p-3 rounded-lg">
                     <div className="text-sm text-gray-600">Date limite</div>
                     <div className="font-medium text-gray-900">
                       {new Date(selectedTask.deadline).toLocaleDateString('fr-FR', {
                         year: 'numeric',
                         month: 'long',
                         day: 'numeric'
                       })}
                     </div>
                   </div>
                 )}
               </div>
             </div>

             {/* Actions */}
             <div className="flex gap-3 pt-4 border-t border-gray-200">
               <Button
                 variant="primary"
                 className="flex-1"
                 onClick={() => {
                   handleOfferHelp(selectedTask.id);
                   setSelectedTask(null);
                 }}
               >
                 🤝 Aider
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
