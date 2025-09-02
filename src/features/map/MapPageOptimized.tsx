import React, { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { Task } from '@/types';
import { usePaymentNotifications } from '@/hooks/usePaymentNotifications';
import { useRentableItems } from './hooks/useRentableItems';
import { useGeolocation } from '@/hooks/useGeolocation';

// Lazy load des composants lourds
const MapView = lazy(() => import('./components/MapView'));
const TasksListView = lazy(() => import('./components/TasksListView'));
const FiltersSidebar = lazy(() => import('./components/FiltersSidebar'));
const RentModal = lazy(() => import('./components/RentModal'));
const MapHeader = lazy(() => import('./components/MapHeader'));

// Type partiel pour les tâches de la carte
export type MapTask = Pick<Task, 'id' | 'title' | 'description' | 'category' | 'status' | 'created_at' | 'user_id' | 'priority' | 'estimated_duration' | 'budget_credits' | 'required_skills' | 'tags'> & {
  location: { lat: number; lng: number };
};

// Définition locale pour typage interne des items louables
interface LocalRentableItemMarker {
  id: number;
  name: string;
  description: string;
  daily_price: number | null;
  deposit: number;
  available: boolean;
  owner_id: string;
  location: { lat: number; lng: number } | null;
}

// Composant de chargement global
const MapPageLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <motion.div
      className="flex flex-col items-center space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
        <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Chargement de la carte</h2>
        <p className="text-sm text-slate-500">Préparation de l'interface...</p>
      </div>
    </motion.div>
  </div>
);

const MapPageOptimized: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const { user } = useAuthStore();
  const { items: rentableItems, loading: itemsLoading } = useRentableItems();
  const { addNotification } = usePaymentNotifications();

  // État de la vue
  const [mapView, setMapView] = useState<'map' | 'list'>('map');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Transformation des tâches pour la carte
  const mapTasks: MapTask[] = tasks.map(task => {
    let location = { lat: 48.8566, lng: 2.3522 }; // Fallback Paris

    if (typeof (task as any).latitude === 'number' && typeof (task as any).longitude === 'number') {
      location = { lat: (task as any).latitude as number, lng: (task as any).longitude as number };
    } else if (typeof task.location === 'string') {
      const raw = task.location.trim();
      const match = raw.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
      if (match) {
        location = { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      } else if (raw.startsWith('{') || raw.startsWith('[') || raw.startsWith('"')) {
        try {
          const parsed: any = JSON.parse(raw);
          const lat = parsed.lat ?? parsed.latitude;
          const lng = parsed.lng ?? parsed.lon ?? parsed.longitude;
          if (typeof lat === 'number' && typeof lng === 'number') {
            location = { lat, lng };
          }
        } catch {
          // ignore parsing errors
        }
      }
    }

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      status: task.status,
      created_at: task.created_at,
      user_id: task.user_id,
      priority: task.priority,
      estimated_duration: task.estimated_duration,
      budget_credits: task.budget_credits,
      required_skills: task.required_skills,
      tags: task.tags,
      location
    };
  });

  // État des filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'local' | 'remote' | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<'urgent' | 'high' | 'medium' | 'low' | 'all'>('all');
  const [radiusKm, setRadiusKm] = useState<number>(0);
  const [sortByDistance, setSortByDistance] = useState<boolean>(false);

  // État des items louables
  const [isItemsSidebarOpen, setIsItemsSidebarOpen] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [onlyAvailableItems, setOnlyAvailableItems] = useState(true);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);

  // État des modales
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<LocalRentableItemMarker | null>(null);
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);

  // Chargement initial
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Géolocalisation via hook
  const { latitude, longitude, isLoading: geoLoading, error: geoError, requestLocation } = useGeolocation();

  useEffect(() => {
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      setUserLocation({ lat: latitude, lng: longitude });
    } else if (geoError) {
      setUserLocation({ lat: 48.8566, lng: 2.3522 });
    }
  }, [latitude, longitude, geoError]);

  // Géolocalisation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Fallback sur Paris si la géolocalisation échoue
          setUserLocation({ lat: 48.8566, lng: 2.3522 });
        }
      );
    } else {
      setUserLocation({ lat: 48.8566, lng: 2.3522 });
    }
  }, []);

  // Handlers
  const handleTaskClick = useCallback((task: MapTask) => {
    navigate(`/task/${task.id}`);
  }, [navigate]);

  const handleOfferHelp = useCallback((taskId: number) => {
    navigate(`/task/${taskId}?action=help`);
  }, [navigate]);

  const handleItemClick = useCallback((item: LocalRentableItemMarker) => {
    setSelectedItem(item);
    setIsRentModalOpen(true);
  }, []);

  const handleRecenter = useCallback(() => {
    requestLocation();
  }, [requestLocation]);

  const handleRentConfirm = useCallback(async () => {
    if (!selectedItem || !user) return;

    try {
      // Logique de location ici
      addNotification('success', 'Location confirmée', 'Votre demande de location a été envoyée');
      setIsRentModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      addNotification('error', 'Erreur', 'Impossible de traiter votre demande');
    }
  }, [selectedItem, user, addNotification]);

  // Calcul du nombre de filtres actifs
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterCategory !== 'all') count++;
    if (filterPriority !== 'all') count++;
    if (radiusKm > 0) count++;
    if (sortByDistance) count++;
    if (itemSearch) count++;
    if (onlyAvailableItems) count++;
    if (minPrice > 0 || maxPrice < 1000) count++;
    return count;
  };

  return (
    <Suspense fallback={<MapPageLoadingFallback />}>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <MapHeader
          mapView={mapView}
          onViewChange={setMapView}
          onFilterClick={() => setIsFilterModalOpen(true)}
          activeFiltersCount={getActiveFiltersCount()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Contenu principal */}
        <div className="flex-1">
          {mapView === 'map' ? (
            <div className="h-[calc(100vh-140px)] sm:h-[calc(100vh-180px)] lg:h-[calc(100vh-200px)]">
              <MapView
                tasks={mapTasks}
                userLocation={userLocation}
                onTaskClick={handleTaskClick}
                onOfferHelp={handleOfferHelp}
                rentableItems={rentableItems}
                onItemClick={handleItemClick}
                filterCategory={filterCategory}
                filterPriority={filterPriority}
                radiusKm={radiusKm}
                itemSearch={itemSearch}
                onlyAvailableItems={onlyAvailableItems}
                minPrice={minPrice}
                maxPrice={maxPrice}
                isLoading={isLoading}
                itemsLoading={itemsLoading}
                onRecenter={handleRecenter}
              />
            </div>
          ) : (
            <div className="h-[calc(100vh-140px)] sm:h-[calc(100vh-180px)] lg:h-[calc(100vh-200px)] overflow-y-auto">
              <TasksListView
                tasks={mapTasks}
                userLocation={userLocation}
                searchQuery={searchQuery}
                filterCategory={filterCategory}
                filterPriority={filterPriority}
                radiusKm={radiusKm}
                sortByDistance={sortByDistance}
                isLoading={isLoading}
                onTaskClick={handleTaskClick}
                onOfferHelp={handleOfferHelp}
              />
            </div>
          )}
        </div>

        {/* Sidebar des filtres */}
        <FiltersSidebar
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filterCategory={filterCategory}
          onCategoryChange={setFilterCategory}
          filterPriority={filterPriority}
          onPriorityChange={setFilterPriority}
          radiusKm={radiusKm}
          onRadiusChange={setRadiusKm}
          sortByDistance={sortByDistance}
          onSortByDistanceChange={setSortByDistance}
          isItemsSidebarOpen={isItemsSidebarOpen}
          onItemsSidebarToggle={() => setIsItemsSidebarOpen(!isItemsSidebarOpen)}
          itemSearch={itemSearch}
          onItemSearchChange={setItemSearch}
          onlyAvailableItems={onlyAvailableItems}
          onOnlyAvailableItemsChange={setOnlyAvailableItems}
          minPrice={minPrice}
          onMinPriceChange={setMinPrice}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
        />

        {/* Modal de location */}
        {selectedItem && (
          <RentModal
            isOpen={isRentModalOpen}
            item={selectedItem}
            start=""
            end=""
            onClose={() => {
              setIsRentModalOpen(false);
              setSelectedItem(null);
            }}
            onConfirm={handleRentConfirm}
            onStartChange={() => {}}
            onEndChange={() => {}}
          />
        )}
      </div>
    </Suspense>
  );
};

export default MapPageOptimized;
