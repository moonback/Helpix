import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, List, Filter } from 'lucide-react';
import Button from '@/components/ui/Button';

interface MapHeaderProps {
  mapView: 'map' | 'list';
  onViewChange: (view: 'map' | 'list') => void;
  onFilterClick: () => void;
  activeFiltersCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

const MapHeader: React.FC<MapHeaderProps> = ({
  mapView,
  onViewChange,
  onFilterClick,
  activeFiltersCount,
  searchQuery,
  onSearchChange,
  className = ''
}) => {
  return (
    <motion.header
      className={`bg-white/80 backdrop-blur-sm border-b border-slate-200/50 shadow-sm sticky top-0 z-40 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-12xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          {/* Title Section */}
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Carte des Tâches</h1>
              <p className="text-xs text-slate-500">
                Découvrez les opportunités près de chez vous
              </p>
            </div>
          </motion.div>

          {/* Search and Controls */}
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher des tâches..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-64 px-4 py-2 pl-10 pr-4 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filter Button */}
            <Button
              onClick={onFilterClick}
              variant="outline"
              size="sm"
              className="relative border-slate-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <Button
                onClick={() => onViewChange('map')}
                variant={mapView === 'map' ? 'primary' : 'ghost'}
                size="sm"
                className={`px-3 py-1 text-xs transition-all duration-200 ${
                  mapView === 'map' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <MapPin className="w-4 h-4 mr-1" />
                Carte
              </Button>
              <Button
                onClick={() => onViewChange('list')}
                variant={mapView === 'list' ? 'primary' : 'ghost'}
                size="sm"
                className={`px-3 py-1 text-xs transition-all duration-200 ${
                  mapView === 'list' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <List className="w-4 h-4 mr-1" />
                Liste
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Mobile & Tablet Layout */}
        <div className="md:hidden">
          {/* Top Row: Title and View Toggle */}
          <motion.div
            className="flex items-center justify-between mb-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Mobile Title */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-slate-800 leading-tight">
                  Carte des Tâches
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 hidden xs:block">
                  Opportunités près de chez vous
                </p>
              </div>
            </div>

            {/* Mobile View Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <Button
                onClick={() => onViewChange('map')}
                variant={mapView === 'map' ? 'primary' : 'ghost'}
                size="sm"
                className={`px-2 py-1 text-[10px] transition-all duration-200 ${
                  mapView === 'map' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-1">Carte</span>
              </Button>
              <Button
                onClick={() => onViewChange('list')}
                variant={mapView === 'list' ? 'primary' : 'ghost'}
                size="sm"
                className={`px-2 py-1 text-[10px] transition-all duration-200 ${
                  mapView === 'list' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <List className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-1">Liste</span>
              </Button>
            </div>
          </motion.div>

          {/* Bottom Row: Search and Filter */}
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Mobile Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full px-3 py-2 pl-9 pr-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Mobile Filter Button */}
            <Button
              onClick={onFilterClick}
              variant="outline"
              size="sm"
              className="relative border-slate-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 p-2"
            >
              <Filter className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default MapHeader;
