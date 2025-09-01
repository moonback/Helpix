import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter } from 'lucide-react';
import { FILTER_OPTIONS, STATUS_LABELS, PRIORITY_LABELS, COMPLEXITY_LABELS } from '../constants';
import { getStatusColor, getPriorityColor, getComplexityColor } from '../utils';
import { TaskFilter } from '@/types';

interface TaskFilters {
  status?: string[];
  priority?: string[];
  complexity?: string[];
}

interface AdvancedFiltersProps {
  isOpen: boolean;
  onToggle: () => void;
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  isOpen,
  onToggle,
  filters,
  onFiltersChange
}) => {
  const handleFilterToggle = (type: keyof TaskFilters, value: string) => {
    const currentFilters = filters[type] || [];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter(f => f !== value)
      : [...currentFilters, value];
    
    onFiltersChange({
      ...filters,
      [type]: newFilters
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    return (filters.status?.length || 0) + 
           (filters.priority?.length || 0) + 
           (filters.complexity?.length || 0);
  };

  const FilterSection = ({ 
    title, 
    type, 
    options, 
    getColor 
  }: {
    title: string;
    type: keyof TaskFilters;
    options: { value: string; label: string }[];
    getColor: (value: string) => string;
  }) => (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = filters[type]?.includes(option.value) || false;
          
          return (
            <motion.button
              key={option.value}
              onClick={() => handleFilterToggle(type, option.value)}
              className={`
                px-3 py-2 rounded-full text-sm font-medium border transition-all duration-200
                ${isActive 
                  ? `${getColor(option.value)} shadow-sm` 
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {option.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <motion.button
        onClick={onToggle}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Filter className="w-4 h-4" />
        <span>Filtres</span>
        {getActiveFiltersCount() > 0 && (
          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
            {getActiveFiltersCount()}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mt-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filtres avancés</h3>
              <div className="flex items-center space-x-2">
                {getActiveFiltersCount() > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    Effacer tout
                  </button>
                )}
                <button
                  onClick={onToggle}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FilterSection
                title="Statut"
                type="status"
                options={FILTER_OPTIONS.status}
                getColor={getStatusColor}
              />
              
              <FilterSection
                title="Priorité"
                type="priority"
                options={FILTER_OPTIONS.priority}
                getColor={getPriorityColor}
              />
              
              <FilterSection
                title="Complexité"
                type="complexity"
                options={FILTER_OPTIONS.complexity}
                getColor={getComplexityColor}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdvancedFilters;
