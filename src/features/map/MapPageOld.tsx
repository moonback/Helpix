import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users } from 'lucide-react';
import { MapContainer, TileLayer, useMap, Circle } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { Task } from '@/types';
import { calculateDistance } from '@/lib/utils';
import { requestRental } from '@/lib/rentals';
import { usePaymentNotifications } from '@/hooks/usePaymentNotifications';
import TaskMarker from './components/TaskMarker';



// Type partiel pour les tâches de la carte
export type MapTask = Pick<Task, 'id' | 'title' | 'description' | 'category' | 'status' | 'created_at' | 'user_id' | 'priority' | 'estimated_duration' | 'budget_credits' | 'required_skills' | 'tags'> & {
  location: { lat: number; lng: number };
};

// Définition locale pour typage interne des items louables


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

// Récupère l'instance de carte via useMap (compatible React-Leaflet v4)
const MapInstanceSetter: React.FC<{ onReady: (map: L.Map) => void }> = ({ onReady }) => {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
};

// Sous-composants extraits: voir src/features/map/components/*

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const { user } = useAuthStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [mapView, setMapView] = useState<'map' | 'list'>('map');
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'local' | 'remote' | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<'urgent' | 'high' | 'medium' | 'low' | 'all'>('all');
  const [radiusKm, setRadiusKm] = useState<number>(0);
  const [sortByDistance, setSortByDistance] = useState<boolean>(false);
  // Louables

  const [isItemsSidebarOpen, setIsItemsSidebarOpen] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [onlyAvailableItems, setOnlyAvailableItems] = useState(true);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [maxDeposit, setMaxDeposit] = useState<number>(1000);
  const [showTasks, setShowTasks] = useState(true);
  const [showLocations, setShowLocations] = useState(true);
  const { addNotification } = usePaymentNotifications();

  const [rentStart, setRentStart] = useState<string>('');
  const [rentEnd, setRentEnd] = useState<string>('');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Charger objets louables et positions propriétaires
  useEffect(() => {
    (async () => {
      // setItemsLoading(true); // This line is now handled by useRentableItems
      try {
        // const { data: items, error } = await supabase
        //   .from('items')
        //   .select('*')
        //   .eq('is_rentable', true);
        // if (error) throw error;
        // const ownerIds = Array.from(new Set((items || []).map((i: any) => i.user_id)));
        // const ownersLocationMap = new Map<string, { lat: number; lng: number } | null>();
        // if (ownerIds.length > 0) {
        //   const { data: usersRows, error: usersErr } = await supabase
        //   .from('users')
        //   .select('id, location')
        //   .in('id', ownerIds);
        //   if (usersErr) throw usersErr;
        //   (usersRows || []).forEach((u: any) => {
        //     const parts = String(u.location || '').split(',');
        //     if (parts.length === 2) {
        //       const lat = Number(parts[0]);
        //       const lng = Number(parts[1]);
        //     if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        //         ownersLocationMap.set(u.id, { lat, lng });
        //         return;
        //     }
        //   }
        //     ownersLocationMap.set(u.id, null);
        // });
        // }
        // const mapped: LocalRentableItemMarker[] = (items || []).map((it: any) => ({
        //     id: it.id,
        //   name: it.name ?? it.item_name,
        //     description: it.description || '',
        //     daily_price: it.daily_price ?? null,
        //     deposit: it.deposit ?? 0,
        //   available: !!it.available,
        //   owner_id: it.user_id,
        //   location: ownersLocationMap.get(it.user_id) ?? null,
        // }));
        // setRentableItems(mapped.filter(m => m.location));
      } catch (e) {
        console.error('Erreur chargement objets louables:', e);
      } finally {
        // setItemsLoading(false); // This line is now handled by useRentableItems
      }
    })();
  }, []);

  // Récupération position utilisateur (pour distance et rayon)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        () => {
          setUserLocation(null);
        }
      );
    }
  }, []);

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

  // Handlers mémoïsés
  const onTaskClick = useCallback((task: MapTask) => {
    // Récupérer la tâche complète depuis le store
    const dbTask = tasks.find((t: Task) => t.id === task.id);
    if (dbTask) {
      setSelectedTask(dbTask);
    }
  }, [tasks]);

  const onOfferHelp = useCallback((taskId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/task/${taskId}/offers`);
  }, [user, navigate]);





  // Filtrage, recherche et tri
  const filteredTasks: MapTask[] = ((): MapTask[] => {
    let result = [...allTasks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(q))
      );
    }

    if (filterCategory !== 'all') {
      result = result.filter(t => t.category === filterCategory);
    }

    if (filterPriority !== 'all') {
      result = result.filter(t => t.priority === filterPriority);
    }

    if (radiusKm > 0 && userLocation) {
      result = result.filter(t => calculateDistance(userLocation.lat, userLocation.lng, t.location.lat, t.location.lng) <= radiusKm);
    }

    if (sortByDistance && userLocation) {
      result = result.sort((a, b) =>
        calculateDistance(userLocation.lat, userLocation.lng, a.location.lat, a.location.lng) -
        calculateDistance(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng)
      );
    }

    return result;
  })();



  const recenterToUser = () => {
    if (!mapInstance) return;
    if (userLocation) {
      mapInstance.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 0.8 });
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          mapInstance.flyTo([latitude, longitude], 13, { duration: 0.8 });
        },
        () => {
          mapInstance.flyTo([48.8566, 2.3522], 13, { duration: 0.8 });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    }
  };

  // Supprimer setMapView non utilisé et bouton bascule si non nécessaire, sinon réintroduire handler
  const onMapViewToggle = useCallback(() => {
    setMapView((prev) => (prev === 'map' ? 'list' : 'map'));
  }, []);

  const hasNothingToShow = (showTasks ? filteredTasks.length : 0) === 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header - Amélioré pour le responsive */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200 px-responsive py-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-responsive-xl font-bold text-gray-900 truncate">
              Carte d'entraide 🗺️
            </h1>
            <p className="text-responsive-sm text-gray-600 hidden sm:block">
              Découvrez les opportunités près de chez vous
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Bouton de filtres pour mobile */}
            <button
              onClick={() => setIsItemsSidebarOpen(!isItemsSidebarOpen)}
              className="mobile-only touch-target bg-blue-600 text-white rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg"
              aria-label="Ouvrir les filtres"
            >
              <span className="text-lg">🛍️</span>
              <span className="text-sm font-medium">Filtres</span>
            </button>
            
            <Button
              variant="outline"
              onClick={onMapViewToggle}
              icon={mapView === 'map' ? <Users size={20} /> : <MapPin size={20} />}
              className="touch-target"
            >
              <span className="hidden sm:inline">
                {mapView === 'map' ? 'Liste' : 'Carte'}
              </span>
              <span className="sm:hidden">
                {mapView === 'map' ? 'Liste' : 'Carte'}
              </span>
            </Button>
          </div>
        </div>
      </motion.header>

             {/* Map View - Amélioré pour le responsive */}
       {mapView === 'map' ? (
         <div className="h-[calc(100vh-140px)] sm:h-[calc(100vh-180px)] lg:h-[calc(100vh-200px)] relative">
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
               <MapInstanceSetter onReady={setMapInstance} />
               {userLocation && radiusKm > 0 && (
                 <Circle
                   center={[userLocation.lat, userLocation.lng]}
                   radius={radiusKm * 1000}
                   pathOptions={{ color: '#3b82f6', fillColor: '#93c5fd', fillOpacity: 0.15 }}
                 />
               )}
               
               {hasNothingToShow ? (
                 <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                   <div className="text-center">
                     <div className="text-6xl mb-4">🗺️</div>
                     <h3 className="text-lg font-semibold text-gray-900 mb-2">Rien à afficher</h3>
                     <p className="text-gray-600">Ajustez vos filtres, créez une tâche ou activez la location d’un objet</p>
                   </div>
                 </div>
               ) : (
                 <>
                   {showTasks && filteredTasks.map((task) => (
                     <TaskMarker key={task.id} task={task} userLocation={userLocation} onTaskClick={onTaskClick} onOfferHelp={onOfferHelp} />
                   ))}

                 </>
               )}
             </MapContainer>
           )}

          {/* Sidebar gauche: filtres objets louables + tâches - Amélioré pour le responsive */}
          <div className={`absolute top-4 left-0 h-[calc(100%-2rem)] z-[2100] transition-transform duration-300 ease-in-out ${
            isItemsSidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%-3rem)]'
          } pointer-events-none`}>
            <div className="pointer-events-auto w-72 sm:w-80 lg:w-96 max-w-[90vw] h-full bg-white shadow-2xl border-r border-gray-200 rounded-r-2xl p-responsive flex flex-col overflow-y-auto">
              {/* Switch couches */}
              <div className="mb-3 grid grid-cols-1 gap-2">
                <label className="flex items-center justify-between text-sm text-gray-700">
                  <span>Afficher les tâches</span>
                  <input type="checkbox" checked={showTasks} onChange={(e)=>setShowTasks(e.target.checked)} />
                </label>
                <label className="flex items-center justify-between text-sm text-gray-700">
                  <span>Afficher les locations</span>
                  <input type="checkbox" checked={showLocations} onChange={(e)=>setShowLocations(e.target.checked)} />
                </label>
              </div>

              {/* Section Objets louables */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-blue-600 text-white text-[10px]">🛍️</span> Objets louables
                </div>
                <button onClick={() => setIsItemsSidebarOpen(false)} className="p-1 rounded-md hover:bg-gray-100" aria-label="Fermer les filtres">
                  <span className="inline-block w-4 h-4">✕</span>
                </button>
              </div>
              <input
                type="text"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="Rechercher un objet..."
                className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-responsive-sm mb-3 touch-target"
              />
              <label className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                <input type="checkbox" checked={onlyAvailableItems} onChange={(e) => setOnlyAvailableItems(e.target.checked)} />
                Uniquement disponibles
              </label>
              <div className="text-xs text-gray-600 mb-1">Prix/jour (crédits)</div>
              <div className="flex items-center gap-2 mb-2">
                <input type="number" value={minPrice} onChange={(e)=>setMinPrice(Number(e.target.value))} className="w-20 rounded-md border-gray-300 text-sm" />
                <span className="text-gray-400">—</span>
                <input type="number" value={maxPrice} onChange={(e)=>setMaxPrice(Number(e.target.value))} className="w-20 rounded-md border-gray-300 text-sm" />
              </div>
              <div className="text-xs text-gray-600 mb-1">Dépôt max (crédits)</div>
              <input type="number" value={maxDeposit} onChange={(e)=>setMaxDeposit(Number(e.target.value))} className="w-full rounded-md border-gray-300 text-sm mb-4" />

              {/* Séparateur */}
              <div className="border-t border-gray-200 my-3" />

              {/* Section Filtres tâches */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-gray-800 text-white text-[10px]">🗂️</span> Tâches
                </div>
                <button
                  className="text-xs px-2 py-1 border rounded-md hover:bg-gray-50"
                  onClick={recenterToUser}
                  aria-label="Me recentrer"
                >
                  Me recentrer
                </button>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher titre, description, tag..."
                className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-responsive-sm mb-3 touch-target"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <select
                  className="rounded-md border-gray-300 text-responsive-sm touch-target"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                >
                  <option value="all">Toutes catégories</option>
                  <option value="local">Sur place</option>
                  <option value="remote">À distance</option>
                </select>

                <select
                  className="rounded-md border-gray-300 text-responsive-sm touch-target"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                >
                  <option value="all">Toutes priorités</option>
                  <option value="urgent">Urgente</option>
                  <option value="high">Élevée</option>
                  <option value="medium">Moyenne</option>
                  <option value="low">Faible</option>
                </select>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Rayon de proximité</span>
                  <span>{radiusKm > 0 ? `${radiusKm} km` : 'désactivé'}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                <input
                  type="checkbox"
                  checked={sortByDistance}
                  onChange={(e) => setSortByDistance(e.target.checked)}
                />
                Trier par distance
              </label>


            </div>
            {/* Poignée de toggle - Améliorée pour le responsive */}
            <button 
              onClick={() => setIsItemsSidebarOpen(v => !v)} 
              className="pointer-events-auto absolute top-1/2 -right-4 -translate-y-1/2 h-12 w-12 sm:h-10 sm:w-10 rounded-full bg-white shadow-lg border flex items-center justify-center touch-target hover:shadow-xl transition-shadow" 
              aria-label="Ouvrir/fermer filtres"
            >
              <span className="text-lg">🛍️</span>
            </button>
          </div>

          {/* Map Controls supprimés (désormais dans la sidebar gauche) */}
        </div>
      ) : (
        /* List View - Amélioré pour le responsive */
        <div className="px-responsive py-responsive">
                     <div className="mb-6">
             <h2 className="text-responsive-xl font-semibold text-gray-900 mb-2">
               Tâches à proximité
             </h2>
             <p className="text-responsive-sm text-gray-600">
               {filteredTasks.length} tâche{filteredTasks.length !== 1 ? 's' : ''} trouvée{filteredTasks.length !== 1 ? 's' : ''}
             </p>
           </div>

           <div className="space-y-4">
             {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  onClick={() => onTaskClick(task)}
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
                        onOfferHelp(task.id);
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
                   onOfferHelp(selectedTask.id);
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
