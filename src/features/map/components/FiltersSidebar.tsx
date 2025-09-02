import React from 'react';
import { motion } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface FiltersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  // Filtres de catégorie
  filterCategory: 'local' | 'remote' | 'all';
  onCategoryChange: (category: 'local' | 'remote' | 'all') => void;
  // Filtres de priorité
  filterPriority: 'urgent' | 'high' | 'medium' | 'low' | 'all';
  onPriorityChange: (priority: 'urgent' | 'high' | 'medium' | 'low' | 'all') => void;
  // Filtres de distance
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  // Tri par distance
  sortByDistance: boolean;
  onSortByDistanceChange: (sort: boolean) => void;

  className?: string;
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  isOpen,
  onClose,
  filterCategory,
  onCategoryChange,
  filterPriority,
  onPriorityChange,
  radiusKm,
  onRadiusChange,
  sortByDistance,
  onSortByDistanceChange,

  className = ''
}) => {
  if (!isOpen) return null;

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterCategory !== 'all') count++;
    if (filterPriority !== 'all') count++;
    if (radiusKm > 0) count++;
    if (sortByDistance) count++;

    return count;
  };

  const resetFilters = () => {
    onCategoryChange('all');
    onPriorityChange('all');
    onRadiusChange(0);
    onSortByDistanceChange(false);

  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 right-0 h-full w-72 sm:w-80 lg:w-96 max-w-[90vw] bg-white shadow-xl z-40 overflow-y-auto ${className}`}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-slate-800">Filtres</h2>
            <div className="flex items-center space-x-2">
              {getActiveFiltersCount() > 0 && (
                <Button
                  onClick={resetFilters}
                  variant="ghost"
                  size="sm"
                  className="text-[10px] text-slate-500 hover:text-slate-700"
                >
                  Réinitialiser
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tâches Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-medium text-slate-700 mb-3 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Tâches
              </h3>
              
              {/* Catégorie */}
              <Card className="p-4 mb-4">
                <h4 className="text-xs font-medium text-slate-600 mb-3">Type de tâche</h4>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'Toutes', icon: '📍' },
                    { value: 'local', label: 'Local', icon: '🏠' },
                    { value: 'remote', label: 'À distance', icon: '💻' }
                  ].map(({ value, label, icon }) => (
                    <label key={value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={value}
                        checked={filterCategory === value}
                        onChange={(e) => onCategoryChange(e.target.value as any)}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-700">
                        {icon} {label}
                      </span>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Priorité */}
              <Card className="p-4 mb-4">
                <h4 className="text-xs font-medium text-slate-600 mb-3">Priorité</h4>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'Toutes', color: 'text-slate-500' },
                    { value: 'urgent', label: 'Urgente', color: 'text-red-600' },
                    { value: 'high', label: 'Élevée', color: 'text-orange-600' },
                    { value: 'medium', label: 'Moyenne', color: 'text-yellow-600' },
                    { value: 'low', label: 'Faible', color: 'text-green-600' }
                  ].map(({ value, label, color }) => (
                    <label key={value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={value}
                        checked={filterPriority === value}
                        onChange={(e) => onPriorityChange(e.target.value as any)}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className={`text-xs ${color}`}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Distance */}
              <Card className="p-4 mb-4">
                <h4 className="text-xs font-medium text-slate-600 mb-3">Distance</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-2">
                      Rayon: {radiusKm === 0 ? 'Illimité' : `${radiusKm} km`}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={radiusKm}
                      onChange={(e) => onRadiusChange(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>0 km</span>
                      <span>50 km</span>
                    </div>
                  </div>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sortByDistance}
                      onChange={(e) => onSortByDistanceChange(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-700">
                      Trier par distance
                    </span>
                  </label>
                </div>
              </Card>
            </div>


          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default FiltersSidebar;
