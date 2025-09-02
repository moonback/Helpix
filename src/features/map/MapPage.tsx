import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Filter, Navigation, ShoppingBag, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { Task } from '@/types';
import { calculateDistance, formatDistance } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { requestRental } from '@/lib/rentals';
import { usePaymentNotifications } from '@/hooks/usePaymentNotifications';

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
  const [rentableItems, setRentableItems] = useState<RentableItemMarker[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [isItemsSidebarOpen, setIsItemsSidebarOpen] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [onlyAvailableItems, setOnlyAvailableItems] = useState(true);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [maxDeposit, setMaxDeposit] = useState<number>(1000);
  const { addNotification } = usePaymentNotifications();
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [rentItem, setRentItem] = useState<RentableItemMarker | null>(null);
  const [rentStart, setRentStart] = useState<string>('');
  const [rentEnd, setRentEnd] = useState<string>('');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Charger objets louables et positions propriétaires
  useEffect(() => {
    (async () => {
      setItemsLoading(true);
      try {
        const { data: items, error } = await supabase
          .from('items')
          .select('*')
          .eq('is_rentable', true);
        if (error) throw error;
        const ownerIds = Array.from(new Set((items || []).map((i: any) => i.user_id)));
        const ownersLocationMap = new Map<string, { lat: number; lng: number } | null>();
        if (ownerIds.length > 0) {
          const { data: usersRows, error: usersErr } = await supabase
            .from('users')
            .select('id, location')
            .in('id', ownerIds);
          if (usersErr) throw usersErr;
          (usersRows || []).forEach((u: any) => {
            const parts = String(u.location || '').split(',');
            if (parts.length === 2) {
              const lat = Number(parts[0]);
              const lng = Number(parts[1]);
              if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                ownersLocationMap.set(u.id, { lat, lng });
                return;
              }
            }
            ownersLocationMap.set(u.id, null);
          });
        }
        const mapped: RentableItemMarker[] = (items || []).map((it: any) => ({
          id: it.id,
          name: it.name ?? it.item_name,
          description: it.description || '',
          daily_price: it.daily_price ?? null,
          deposit: it.deposit ?? 0,
          available: !!it.available,
          owner_id: it.user_id,
          location: ownersLocationMap.get(it.user_id) ?? null,
        }));
        setRentableItems(mapped.filter(m => m.location));
      } catch (e) {
        console.error('Erreur chargement objets louables:', e);
      } finally {
        setItemsLoading(false);
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

  const filteredRentableItems = useMemo(() => {
    let items = [...rentableItems];
    if (itemSearch.trim()) {
      const q = itemSearch.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    if (onlyAvailableItems) items = items.filter(i => i.available);
    items = items.filter(i => (i.daily_price ?? 0) >= minPrice && (i.daily_price ?? 0) <= maxPrice);
    items = items.filter(i => (i.deposit ?? 0) <= maxDeposit);
    if (radiusKm > 0 && userLocation) {
      items = items.filter(i => i.location && calculateDistance(userLocation.lat, userLocation.lng, i.location.lat, i.location.lng) <= radiusKm);
    }
    if (sortByDistance && userLocation) {
      items = items.sort((a, b) =>
        calculateDistance(userLocation.lat, userLocation.lng, a.location!.lat, a.location!.lng) -
        calculateDistance(userLocation.lat, userLocation.lng, b.location!.lat, b.location!.lng)
      );
    }
    return items;
  }, [rentableItems, itemSearch, onlyAvailableItems, minPrice, maxPrice, maxDeposit, radiusKm, sortByDistance, userLocation]);

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
               <MapInstanceSetter onReady={setMapInstance} />
               {userLocation && radiusKm > 0 && (
                 <Circle
                   center={[userLocation.lat, userLocation.lng]}
                   radius={radiusKm * 1000}
                   pathOptions={{ color: '#3b82f6', fillColor: '#93c5fd', fillOpacity: 0.15 }}
                 />
               )}
               
               {filteredTasks.length === 0 ? (
                 <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                   <div className="text-center">
                     <div className="text-6xl mb-4">🗺️</div>
                     <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Aucune tâche localisée
                      </h3>
                     <p className="text-gray-600">
                      Ajustez vos filtres ou créez des tâches avec localisation
                     </p>
                   </div>
                 </div>
               ) : (
                 <>
                 {filteredTasks.map((task) => (
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
                              {userLocation && (
                                <span className="text-xs text-primary-600 font-medium">
                                  {formatDistance(calculateDistance(userLocation.lat, userLocation.lng, task.location.lat, task.location.lng))}
                                </span>
                              )}
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
                            <a
                              className="text-xs px-2 py-1 border rounded-md hover:bg-gray-50"
                              href={`https://www.google.com/maps/dir/?api=1&destination=${task.location.lat},${task.location.lng}`}
                              target="_blank" rel="noopener noreferrer"
                            >
                              Itinéraire
                            </a>
                          </div>
                        </div>
                      </Popup>
                   </Marker>
                 ))}
                 {filteredRentableItems.length === 0 && filteredTasks.length === 0 ? null : filteredRentableItems.map((it) => (
                   <Marker key={`item-${it.id}`} position={[it.location!.lat, it.location!.lng]}>
                     <Popup className="min-w-[280px]">
                       <div className="p-3">
                         <div className="flex items-center gap-2 mb-2">
                           <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                             <ShoppingBag size={16} />
                           </div>
                           <div>
                             <div className="font-semibold text-gray-900">{it.name}</div>
                             <div className="text-xs text-gray-500">Objet louable</div>
                           </div>
                         </div>
                         <p className="text-sm text-gray-700 mb-2">{it.description}</p>
                         <div className="text-sm text-gray-800 mb-2">{it.daily_price ?? '?'} crédits/jour • Dépôt {it.deposit ?? 0}</div>
                         {userLocation && it.location && (
                           <div className="text-xs text-primary-600 font-medium mb-2">
                             {formatDistance(calculateDistance(userLocation.lat, userLocation.lng, it.location.lat, it.location.lng))}
                           </div>
                         )}
                         <div className="space-y-2 mb-2">
                           <div className="grid grid-cols-2 gap-2">
                             <input type="date" className="border rounded-md px-2 py-1 text-sm" onChange={(e) => (it as any)._start = e.target.value} />
                             <input type="date" className="border rounded-md px-2 py-1 text-sm" onChange={(e) => (it as any)._end = e.target.value} />
                           </div>
                           <div className="text-xs text-gray-600">
                             Total estimé: {(() => {
                               const start = (it as any)._start; const end = (it as any)._end;
                               if (!start || !end || !it.daily_price) return '—';
                               const days = Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000*60*60*24)));
                               return `${days * it.daily_price} crédits`;
                             })()}
                           </div>
                         </div>
                         <div className="flex gap-2">
                           <Button size="sm" className="flex-1" onClick={() => { setRentItem(it); setRentStart(''); setRentEnd(''); setIsRentModalOpen(true); }}>Demander la location</Button>
                           <a className="text-xs px-2 py-1 border rounded-md hover:bg-gray-50" href={`https://www.google.com/maps/dir/?api=1&destination=${it.location!.lat},${it.location!.lng}`} target="_blank" rel="noopener noreferrer">Itinéraire</a>
                         </div>
                       </div>
                     </Popup>
                   </Marker>
                 ))}
               </>
               )}
             </MapContainer>
           )}

          {/* Sidebar gauche: filtres objets louables */}
          <div className={`absolute top-4 left-0 h-[calc(100%-2rem)] z-[2100] transition-transform ${isItemsSidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%-3rem)]'} pointer-events-none`}>
            <div className="pointer-events-auto w-72 max-w-[85vw] h-full bg-white shadow-2xl border-r border-gray-200 rounded-r-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <ShoppingBag size={16} /> Objets louables
                </div>
                <button onClick={() => setIsItemsSidebarOpen(false)} className="p-1 rounded-md hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>
              <input
                type="text"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="Rechercher un objet..."
                className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm mb-3"
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
              <div className="mt-auto text-xs text-gray-500">{itemsLoading ? 'Chargement des objets...' : `${filteredRentableItems.length} objet(s)`}</div>
            </div>
            {/* Poignée de toggle */}
            <button onClick={() => setIsItemsSidebarOpen(v => !v)} className="pointer-events-auto absolute top-1/2 -right-4 -translate-y-1/2 h-10 w-10 rounded-full bg-white shadow-lg border flex items-center justify-center">
              <ShoppingBag size={18} className="text-gray-700" />
            </button>
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2 w-[320px] max-w-[90vw] z-[2000]">
            <div className="bg-white shadow-lg rounded-lg p-3 border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Filter size={16} /> Filtres
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Navigation size={14} />}
                  onClick={recenterToUser}
                  className="text-xs"
                >
                  Me recentrer
                </Button>
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher titre, description, tag..."
                className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm"
              />

              <div className="grid grid-cols-2 gap-2">
                <select
                  className="rounded-md border-gray-300 text-sm"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                >
                  <option value="all">Toutes catégories</option>
                  <option value="local">Sur place</option>
                  <option value="remote">À distance</option>
                </select>

                <select
                  className="rounded-md border-gray-300 text-sm"
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

              <div>
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

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={sortByDistance}
                  onChange={(e) => setSortByDistance(e.target.checked)}
                />
                Trier par distance
              </label>
            </div>
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

      {/* Modal de demande de location */}
      {isRentModalOpen && rentItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsRentModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-[10000]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center"><ShoppingBag size={16} /></div>
                <div>
                  <div className="font-semibold text-gray-900">{rentItem.name}</div>
                  <div className="text-xs text-gray-500">{rentItem.daily_price ?? '?'} crédits/jour • Dépôt {rentItem.deposit ?? 0}</div>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600" onClick={() => setIsRentModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Début</label>
                  <input type="date" value={rentStart} onChange={(e)=>setRentStart(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Fin</label>
                  <input type="date" value={rentEnd} onChange={(e)=>setRentEnd(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="text-sm text-gray-700">
                Total estimé: {(() => {
                  if (!rentStart || !rentEnd || !rentItem.daily_price) return '—';
                  const days = Math.max(1, Math.ceil((new Date(rentEnd).getTime() - new Date(rentStart).getTime())/(1000*60*60*24)));
                  return `${days * rentItem.daily_price} crédits`;
                })()}
              </div>
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsRentModalOpen(false)}>Annuler</Button>
              <Button onClick={async () => {
                if (!user) { navigate('/login'); return; }
                if (!rentStart || !rentEnd || !rentItem.daily_price) { addNotification('warning','Dates manquantes','Sélectionnez des dates valides.'); return; }
                try {
                  await requestRental({
                    itemId: rentItem.id,
                    ownerId: rentItem.owner_id,
                    renterId: user.id,
                    startDate: rentStart,
                    endDate: rentEnd,
                    dailyPrice: rentItem.daily_price,
                    depositCredits: rentItem.deposit ?? 0,
                  });
                  addNotification('success','Demande envoyée','Votre demande de location a été envoyée.');
                  setIsRentModalOpen(false);
                } catch (e) {
                  console.error(e);
                  addNotification('error','Erreur','Impossible de créer la demande.');
                }
              }}>Confirmer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
