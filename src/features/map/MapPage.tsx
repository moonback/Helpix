import React, { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { Task } from '@/types';
import { usePaymentNotifications } from '@/hooks/usePaymentNotifications';

import { useGeolocation } from '@/hooks/useGeolocation';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeader from '@/components/ui/SectionHeader';
import SkeletonList from '@/components/ui/SkeletonList';
import EmptyState from '@/components/ui/EmptyState';
import FilterBadge from '@/components/ui/FilterBadge';
import { MapPin } from 'lucide-react';

// Lazy load des composants lourds
const MapView = lazy(() => import('./components/MapView'));
const TasksListView = lazy(() => import('./components/TasksListView'));
const FiltersSidebar = lazy(() => import('./components/FiltersSidebar'));

const MapHeader = lazy(() => import('./components/MapHeader'));

// Type partiel pour les tâches de la carte
export type MapTask = Pick<Task, 'id' | 'title' | 'description' | 'category' | 'status' | 'created_at' | 'user_id' | 'priority' | 'estimated_duration' | 'budget_credits' | 'required_skills' | 'tags'> & {
  location: { lat: number; lng: number };
};



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

  const { addNotification } = usePaymentNotifications();

  // État de la vue
  const [mapView, setMapView] = useState<'map' | 'list'>('map');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Transformation des tâches pour la carte
  const mapTasks: MapTask[] = tasks.map(task => {
    let location = { lat: 48.8566, lng: 2.3522 }; // Fallback Paris

    // 1) Champs numériques directs
    if (typeof (task as any).latitude === 'number' && typeof (task as any).longitude === 'number') {
      location = { lat: (task as any).latitude as number, lng: (task as any).longitude as number };
    } else if (typeof task.location === 'string') {
      const raw = task.location.trim();
      // 2) Format "lat,lng"
      const match = raw.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
      if (match) {
        location = { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      } else if (raw.startsWith('{') || raw.startsWith('[') || raw.startsWith('"')) {
        // 3) JSON string
        try {
          const parsed: any = JSON.parse(raw);
          const lat = parsed.lat ?? parsed.latitude;
          const lng = parsed.lng ?? parsed.lon ?? parsed.longitude;
          if (typeof lat === 'number' && typeof lng === 'number') {
            location = { lat, lng };
          }
        } catch {
          // ignore parsing errors silently
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



  // État des modales
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Chargement initial
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Géolocalisation via hook centralisé
  const { latitude, longitude, error: geoError, requestLocation } = useGeolocation();

  useEffect(() => {
    if (typeof latitude === 'number' && typeof longitude === 'number') {
          setUserLocation({ lat: latitude, lng: longitude });
    } else if (geoError) {
      // Fallback si indisponible
      setUserLocation({ lat: 48.8566, lng: 2.3522 });
    }
  }, [latitude, longitude, geoError]);

  // Handlers
  const handleTaskClick = useCallback((task: MapTask) => {
    navigate(`/task/${task.id}`);
  }, [navigate]);

  const handleOfferHelp = useCallback((taskId: number) => {
    navigate(`/task/${taskId}?action=help`);
  }, [navigate]);



  const handleRecenter = useCallback(() => {
    requestLocation();
  }, [requestLocation]);



  // Calcul du nombre de filtres actifs
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterCategory !== 'all') count++;
    if (filterPriority !== 'all') count++;
    if (radiusKm > 0) count++;
    if (sortByDistance) count++;

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

        <PageContainer className="py-4">
          {mapView !== 'map' && (
            <SectionHeader
              title={'Tâches à proximité'}
              subtitle={'Filtrez et triez pour trouver la meilleure opportunité'}
              icon={<MapPin className="w-5 h-5" />}
            />
          )}

          {/* Badges de filtres actifs + compteur */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {filterCategory !== 'all' && (
              <FilterBadge
                icon="📍"
                label={filterCategory === 'local' ? 'Sur place' : 'À distance'}
                onRemove={() => setFilterCategory('all')}
              />
            )}
            {filterPriority !== 'all' && (
              <FilterBadge
                icon="⭐"
                label={`Priorité: ${filterPriority}`}
                onRemove={() => setFilterPriority('all')}
                variant="secondary"
              />
            )}
            {radiusKm > 0 && (
              <FilterBadge
                icon="🧭"
                label={`Rayon: ${radiusKm} km`}
                onRemove={() => setRadiusKm(0)}
                variant="success"
              />
            )}
            {sortByDistance && (
              <FilterBadge
                icon="↔️"
                label="Tri: distance"
                onRemove={() => setSortByDistance(false)}
              />
            )}


            <span className="ml-auto text-sm text-slate-500">
              {mapView === 'map' ? `${mapTasks.length} tâches` : `${mapTasks.length} résultats`}
                 </span>
             </div>

          {/* Contenu principal */}
          <div className="flex-1 mt-4">
            {mapView === 'map' ? (
              <div className="h-[calc(100vh-140px)] sm:h-[calc(100vh-180px)] lg:h-[calc(100vh-200px)]">
                <MapView
                  tasks={mapTasks}
                  userLocation={userLocation}
                  onTaskClick={handleTaskClick}
                  onOfferHelp={handleOfferHelp}
                  filterCategory={filterCategory}
                  filterPriority={filterPriority}
                  radiusKm={radiusKm}
                  isLoading={isLoading}
                  onRecenter={handleRecenter}
                />
             </div>
            ) : (
              <div className="h-[calc(100vh-140px)] sm:h-[calc(100vh-180px)] lg:h-[calc(100vh-200px)] overflow-y-auto">
                {isLoading ? (
                  <SkeletonList />
                ) : mapTasks.length === 0 ? (
                  <EmptyState
                    emoji="🤝"
                    title="Aucune tâche trouvée"
                    description={searchQuery ? 'Aucune tâche ne correspond à votre recherche. Essayez d\'ajuster vos filtres.' : 'Aucune tâche disponible pour le moment autour de vous.'}
                  />
                ) : (
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
                )}
                     </div>
                   )}
                 </div>
        </PageContainer>

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

        />


    </div>
    </Suspense>
  );
};

export default MapPageOptimized;
