import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, MapPin, AlertTriangle, Clock, Target, Tag } from 'lucide-react';
import Button from './Button';
import { TaskFilter } from '@/types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: 'all' | 'local' | 'remote';
  selectedPriority: 'all' | 'low' | 'medium' | 'high' | 'urgent';
  onCategoryChange: (category: 'all' | 'local' | 'remote') => void;
  onPriorityChange: (priority: 'all' | 'low' | 'medium' | 'high' | 'urgent') => void;
  onAdvancedFiltersChange?: (filters: TaskFilter) => void;
  advancedFilters?: TaskFilter;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  selectedPriority,
  onCategoryChange,
  onPriorityChange,
  onAdvancedFiltersChange,
  advancedFilters = {},
}) => {
  const [localFilters, setLocalFilters] = useState<TaskFilter>(advancedFilters);
  const categories = [
    { key: 'all', label: 'Toutes', icon: '🔍', description: 'Afficher toutes les tâches' },
    { key: 'local', label: 'Sur place', icon: '📍', description: 'Tâches nécessitant une présence physique' },
    { key: 'remote', label: 'À distance', icon: '💻', description: 'Tâches réalisables en ligne' }
  ];

  const priorities = [
    { key: 'all', label: 'Toutes', icon: '🔍', description: 'Afficher toutes les priorités' },
    { key: 'urgent', label: 'Urgentes', icon: '🔴', description: 'Tâches nécessitant une action immédiate' },
    { key: 'high', label: 'Élevées', icon: '🟠', description: 'Tâches importantes à traiter rapidement' },
    { key: 'medium', label: 'Moyennes', icon: '🟡', description: 'Tâches avec une priorité normale' },
    { key: 'low', label: 'Faibles', icon: '🟢', description: 'Tâches non urgentes' }
  ];

  const statuses = [
    { key: 'open', label: 'Ouvertes', icon: '🔓', description: 'Tâches disponibles' },
    { key: 'in_progress', label: 'En cours', icon: '⚡', description: 'Tâches en cours d\'exécution' },
    { key: 'completed', label: 'Terminées', icon: '✅', description: 'Tâches terminées' },
    { key: 'cancelled', label: 'Annulées', icon: '❌', description: 'Tâches annulées' },
    { key: 'on_hold', label: 'En attente', icon: '⏸️', description: 'Tâches en attente' },
    { key: 'review', label: 'En révision', icon: '👀', description: 'Tâches en révision' }
  ];

  const complexities = [
    { key: 'simple', label: 'Simple', icon: '🟢', description: 'Tâches faciles à réaliser' },
    { key: 'moderate', label: 'Modérée', icon: '🟡', description: 'Tâches de difficulté moyenne' },
    { key: 'complex', label: 'Complexe', icon: '🔴', description: 'Tâches difficiles' }
  ];

  const handleFilterToggle = (type: keyof TaskFilter, value: string) => {
    const currentFilters = localFilters[type] as string[] || [];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter(f => f !== value)
      : [...currentFilters, value];
    
    setLocalFilters({
      ...localFilters,
      [type]: newFilters
    });
  };

  const handleApplyFilters = () => {
    if (onAdvancedFiltersChange) {
      onAdvancedFiltersChange(localFilters);
    }
    onClose();
  };

  const handleResetFilters = () => {
    setLocalFilters({});
    onCategoryChange('all');
    onPriorityChange('all');
    if (onAdvancedFiltersChange) {
      onAdvancedFiltersChange({});
    }
  };

  const getActiveFiltersCount = () => {
    return (localFilters.status?.length || 0) + 
           (localFilters.priority?.length || 0) + 
           (localFilters.complexity?.length || 0) +
           (localFilters.category?.length || 0);
  };



  const FilterChip = ({ 
    label, 
    isActive, 
    onClick, 
    color = 'primary' 
  }: { 
    label: string; 
    isActive: boolean; 
    onClick: () => void; 
    color?: 'primary' | 'blue' | 'green' | 'orange' | 'red';
  }) => {
    const colorClasses = {
      primary: isActive ? 'bg-primary-100 text-primary-700 border-primary-200' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200',
      blue: isActive ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200',
      green: isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200',
      orange: isActive ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200',
      red: isActive ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
    };

    return (
      <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${colorClasses[color]}`}
      >
        {label}
      </button>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full">
                      <Filter className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Filtres</h2>
                      <p className="text-primary-100 text-sm">
                        {getActiveFiltersCount()} filtre(s) actif(s)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                

              </div>

              {/* Content */}
              <div className="p-4 max-h-[calc(90vh-140px)] overflow-y-auto">
                <div className="space-y-3">
                  {/* Category Filter */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary-600" />
                      <h3 className="font-semibold text-gray-700 text-sm">Type de tâche</h3>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {categories.map((category) => (
                        <FilterChip
                          key={category.key}
                          label={category.label}
                          isActive={selectedCategory === category.key}
                          onClick={() => onCategoryChange(category.key as 'all' | 'local' | 'remote')}
                          color="primary"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Priority Filter */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-primary-600" />
                      <h3 className="font-semibold text-gray-700 text-sm">Priorité</h3>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {priorities.map((priority) => (
                        <FilterChip
                          key={priority.key}
                          label={priority.label}
                          isActive={selectedPriority === priority.key}
                          onClick={() => onPriorityChange(priority.key as 'all' | 'low' | 'medium' | 'high' | 'urgent')}
                          color={priority.key === 'urgent' ? 'red' : priority.key === 'high' ? 'orange' : 'primary'}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-primary-600" />
                      <h3 className="font-semibold text-gray-700 text-sm">Statut</h3>
                      {(localFilters.status?.length || 0) > 0 && (
                        <span className="bg-primary-100 text-primary-700 text-xs px-1.5 py-0.5 rounded-full">
                          {localFilters.status?.length || 0}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {statuses.map((status) => {
                        const isActive = localFilters.status?.includes(status.key as any) || false;
                        return (
                          <FilterChip
                            key={status.key}
                            label={status.label}
                            isActive={isActive}
                            onClick={() => handleFilterToggle('status', status.key as any)}
                            color="blue"
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Complexity Filter */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary-600" />
                      <h3 className="font-semibold text-gray-700 text-sm">Complexité</h3>
                      {(localFilters.complexity?.length || 0) > 0 && (
                        <span className="bg-primary-100 text-primary-700 text-xs px-1.5 py-0.5 rounded-full">
                          {localFilters.complexity?.length || 0}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {complexities.map((complexity) => {
                        const isActive = localFilters.complexity?.includes(complexity.key as any) || false;
                        return (
                          <FilterChip
                            key={complexity.key}
                            label={complexity.label}
                            isActive={isActive}
                            onClick={() => handleFilterToggle('complexity', complexity.key as any)}
                            color="green"
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Active Filters Summary */}
                {getActiveFiltersCount() > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-3">
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2 text-sm">
                      <Tag className="w-3 h-3" />
                      Filtres actifs ({getActiveFiltersCount()})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedCategory !== 'all' && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                          {categories.find(c => c.key === selectedCategory)?.label}
                        </span>
                      )}
                      {selectedPriority !== 'all' && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                          {priorities.find(p => p.key === selectedPriority)?.label}
                        </span>
                      )}
                      {localFilters.status?.map(status => (
                        <span key={status} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {statuses.find(s => s.key === status)?.label}
                        </span>
                      ))}
                      {localFilters.complexity?.map(complexity => (
                        <span key={complexity} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {complexities.find(c => c.key === complexity)?.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 p-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    className="flex-1 text-sm"
                  >
                    Réinitialiser
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleApplyFilters}
                    className="flex-1 text-sm"
                  >
                    Appliquer
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterModal;
