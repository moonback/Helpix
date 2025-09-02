import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { MapTask } from '../MapPage';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { calculateDistance } from '@/lib/utils';

interface TasksListViewProps {
  tasks: MapTask[];
  userLocation: { lat: number; lng: number } | null;
  searchQuery: string;
  filterCategory: 'local' | 'remote' | 'all';
  filterPriority: 'urgent' | 'high' | 'medium' | 'low' | 'all';
  radiusKm: number;
  sortByDistance: boolean;
  isLoading: boolean;
  onTaskClick: (task: MapTask) => void;
  onOfferHelp: (taskId: number) => void;
  className?: string;
}

const TasksListView: React.FC<TasksListViewProps> = ({
  tasks,
  userLocation,
  searchQuery,
  filterCategory,
  filterPriority,
  radiusKm,
  sortByDistance,
  isLoading,
  onTaskClick,
  onOfferHelp,
  className = ''
}) => {
  // Filtrage et tri des tâches
  const filteredAndSortedTasks = useMemo(() => {
    if (isLoading) return [];

    let filtered = tasks.filter(task => {
      // Filtre par recherche
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !task.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

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
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          task.location.lat,
          task.location.lng
        );
        if (distance > radiusKm) {
          return false;
        }
      }

      return true;
    });

    // Tri par distance si activé
    if (sortByDistance && userLocation) {
      filtered.sort((a, b) => {
        const distanceA = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          a.location.lat,
          a.location.lng
        );
        const distanceB = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          b.location.lat,
          b.location.lng
        );
        return distanceA - distanceB;
      });
    }

    return filtered;
  }, [tasks, searchQuery, filterCategory, filterPriority, radiusKm, sortByDistance, userLocation, isLoading]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    return category === 'local' ? '🏠' : '💻';
  };

  if (isLoading) {
    return (
      <div className={`p-4 sm:p-6 ${className}`}>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (filteredAndSortedTasks.length === 0) {
    return (
      <div className={`p-4 sm:p-6 ${className}`}>
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-600 mb-2">
            Aucune tâche trouvée
          </h3>
          <p className="text-slate-500">
            Essayez de modifier vos filtres ou votre recherche
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">
          Tâches disponibles
        </h2>
        <p className="text-sm text-slate-500">
          {filteredAndSortedTasks.length} tâche{filteredAndSortedTasks.length > 1 ? 's' : ''} trouvée{filteredAndSortedTasks.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-4">
        {filteredAndSortedTasks.map((task, index) => {
          const distance = userLocation ? calculateDistance(
            userLocation.lat,
            userLocation.lng,
            task.location.lat,
            task.location.lng
          ) : null;

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Card
                className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => onTaskClick(task)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getCategoryIcon(task.category)}</span>
                      <h3 className="text-base font-medium text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {task.description}
                    </p>

                    {/* Meta info */}
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.estimated_duration}h</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span>{task.budget_credits} crédits</span>
                      </div>
                      {distance && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{distance.toFixed(1)} km</span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {task.required_skills.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {task.required_skills.slice(0, 3).map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {task.required_skills.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-slate-50 text-slate-500 rounded-full">
                              +{task.required_skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOfferHelp(task.id);
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                    >
                      Aider
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick(task);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs px-3 py-1 border-slate-300 hover:border-blue-500 hover:text-blue-600"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TasksListView;
