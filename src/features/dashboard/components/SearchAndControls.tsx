import React from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { SORT_OPTIONS } from '../constants';
import { TaskSort } from '@/types';

interface SearchAndControlsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  taskSort: TaskSort;
  onSortChange: (sort: TaskSort) => void;
  resultsCount: number;
}

const SearchAndControls: React.FC<SearchAndControlsProps> = ({
  searchTerm,
  onSearchChange,
  taskSort,
  onSortChange,
  resultsCount
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Barre de recherche */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            placeholder="Rechercher des tâches..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 w-full"
          />
        </div>

        {/* Contrôles de tri */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Trier par:
            </span>
            <select
              value={taskSort.field}
              onChange={(e) => onSortChange({ ...taskSort, field: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <motion.button
              onClick={() => onSortChange({ 
                ...taskSort, 
                direction: taskSort.direction === 'asc' ? 'desc' : 'asc' 
              })}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {taskSort.direction === 'asc' ? (
                <ArrowUpRight className="w-4 h-4 text-gray-600" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-gray-600" />
              )}
            </motion.button>
          </div>

          {/* Compteur de résultats */}
          <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <span className="font-medium">{resultsCount}</span> tâche(s) trouvée(s)
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchAndControls;
