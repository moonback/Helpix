import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarketplaceStore } from '@/stores/marketplaceStore';
import { useAuthStore } from '@/stores/authStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { ItemCategory, MarketplaceFilter, MarketplaceSort } from '@/types';

// Components
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

import FilterBadge from '@/components/ui/FilterBadge';
import MarketplaceItemCard from './components/MarketplaceItemCardNew';
import MarketplaceItemSkeleton from './components/MarketplaceItemSkeleton';
import MarketplaceFilterModal from './components/MarketplaceFilterModal';
import CategoryGrid from './components/CategoryGridNew';
import StatsOverview from './components/StatsOverviewNew';

// Icons
import { 
  Search, 
  Plus, 
  Filter,
  SortAsc,
  Eye,
  Grid3X3,
  List,
  TrendingUp,
  Package,
  MapPin,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Heart,
  Bell
} from 'lucide-react';

const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Stores
  const { 
    items, 
    isLoading, 
    error, 
    filters, 
    sort, 
    searchQuery,
    fetchItems, 
    setFilters, 
    setSort, 
    setSearchQuery, 
    clearFilters,
    getFilteredItems,
    getMarketplaceStats
  } = useMarketplaceStore();
  
  const { user } = useAuthStore();
  const { latitude, longitude } = useGeolocation();

  // State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showQuickFilters, setShowQuickFilters] = useState(false);

  // Statistiques
  const stats = useMemo(() => getMarketplaceStats(), [items]);

  // Objets filtrés
  const filteredItems = useMemo(() => {
    if (isLoading) {
      return [];
    }
    
    let filtered = getFilteredItems();
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    return filtered;
  }, [getFilteredItems, selectedCategory, isLoading]);

  // Handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  const handleFilterChange = useCallback((newFilters: MarketplaceFilter) => {
    setFilters(newFilters);
  }, [setFilters]);

  const handleSortChange = useCallback((field: MarketplaceSort['field']) => {
    const newSort: MarketplaceSort = {
      field,
      direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc'
    };
    setSort(newSort);
  }, [sort, setSort]);

  const handleCategorySelect = useCallback((category: ItemCategory | 'all') => {
    setSelectedCategory(category);
    if (category !== 'all') {
      setFilters({ ...filters, category: [category] });
    } else {
      const { category: _, ...restFilters } = filters;
      setFilters(restFilters);
    }
  }, [filters, setFilters]);

  const handleViewItem = useCallback((itemId: number) => {
    navigate(`/marketplace/${itemId}`);
  }, [navigate]);

  const handleRentItem = useCallback((itemId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/marketplace/${itemId}/rent`);
  }, [user, navigate]);



  const handleCreateItem = useCallback(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/marketplace/create');
  }, [user, navigate]);

  // Effects
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (latitude && longitude) {
      // Mettre à jour la localisation dans le store si nécessaire
    }
  }, [latitude, longitude]);

  // Calcul du nombre de filtres actifs
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category && filters.category.length > 0) count++;
    if (filters.condition && filters.condition.length > 0) count++;
    if (filters.price_range && (filters.price_range.min > 0 || filters.price_range.max < 1000)) count++;
    if (filters.available_only) count++;
    if (filters.rating_min && filters.rating_min > 0) count++;
    if (searchQuery) count++;
    return count;
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-100">
      {/* Header moderne avec glassmorphism */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo et titre */}
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <Package className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Marketplace
                </h1>
                <p className="text-sm text-slate-600">
                  {stats.totalItems} objets disponibles
                </p>
              </div>
            </div>
            
            {/* Actions rapides */}
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
              >
                <Bell className="w-5 h-5 text-slate-600" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
              >
                <Heart className="w-5 h-5 text-slate-600" />
              </motion.button>

              <Button
                onClick={handleCreateItem}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un objet
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section de recherche moderne */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Barre de recherche principale */}
              <div className="flex-1 relative">
                <div className={`relative transition-all duration-300 ${
                  searchFocused ? 'scale-105' : ''
                }`}>
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher des objets, catégories, marques..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="pl-12 pr-4 py-4 text-lg bg-white/80 border-2 border-slate-200 focus:border-emerald-500 rounded-2xl shadow-lg"
                  />
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => handleSearch('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center hover:bg-slate-300 transition-colors"
                    >
                      ×
                    </motion.button>
                  )}
                </div>
              </div>
              
              {/* Filtres rapides */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsFilterModalOpen(true)}
                  variant="outline"
                  className="border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 rounded-2xl px-6 py-4"
                >
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filtres
                  {getActiveFiltersCount() > 0 && (
                    <span className="ml-2 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </Button>
                
                <div className="flex bg-white/80 rounded-2xl p-1 shadow-lg">
                  <Button
                    onClick={() => setViewMode('grid')}
                    variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                    size="sm"
                    className="rounded-xl"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setViewMode('list')}
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                    className="rounded-xl"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Filtres rapides étendus */}
            <AnimatePresence>
              {showQuickFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-slate-200"
                >
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleSortChange('created_at')}
                      variant={sort.field === 'created_at' ? 'primary' : 'outline'}
                      size="sm"
                      className="rounded-xl"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Plus récents
                    </Button>
                    <Button
                      onClick={() => handleSortChange('daily_price')}
                      variant={sort.field === 'daily_price' ? 'primary' : 'outline'}
                      size="sm"
                      className="rounded-xl"
                    >
                      <SortAsc className="w-4 h-4 mr-2" />
                      Prix croissant
                    </Button>
                    <Button
                      onClick={() => setFilters({ ...filters, available_only: !filters.available_only })}
                      variant={filters.available_only ? 'primary' : 'outline'}
                      size="sm"
                      className="rounded-xl"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Disponibles
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setShowQuickFilters(!showQuickFilters)}
                className="flex items-center text-sm text-slate-600 hover:text-emerald-600 transition-colors"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Filtres rapides
              </button>
              
              {getActiveFiltersCount() > 0 && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-red-500"
                >
                  Effacer tous les filtres
                </Button>
              )}
            </div>
          </Card>
        </motion.section>

        {/* Statistiques en temps réel */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <StatsOverview stats={stats} />
        </motion.section>

        {/* Catégories avec design moderne */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Catégories</h2>
              </div>
              <Button
                onClick={() => setShowCategories(!showCategories)}
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-emerald-600"
              >
                {showCategories ? 'Masquer' : 'Afficher'}
              </Button>
            </div>

            <AnimatePresence>
              {showCategories && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <CategoryGrid 
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                    stats={stats}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.section>

        {/* Filtres actifs */}
        {getActiveFiltersCount() > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-6"
          >
            <Card className="p-4 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Filtres actifs :</span>
                </div>
                    <Button
                  onClick={clearFilters}
                      variant="ghost"
                      size="sm"
                  className="text-slate-500 hover:text-red-500"
                    >
                      Effacer tout
                    </Button>
                  </div>
              <div className="flex flex-wrap gap-2 mt-3">
                    {selectedCategory !== 'all' && (
                      <FilterBadge
                        icon="📦"
                        label={selectedCategory}
                        onRemove={() => handleCategorySelect('all')}
                        variant="primary"
                      />
                    )}
                    {filters.condition && filters.condition.length > 0 && (
                      <FilterBadge
                        icon="⭐"
                    label={`État: ${filters.condition.join(', ')}`}
                    onRemove={() => setFilters({ ...filters, condition: [] })}
                      />
                    )}
                    {filters.price_range && (filters.price_range.min > 0 || filters.price_range.max < 1000) && (
                      <FilterBadge
                        icon="💰"
                        label={`Prix: ${filters.price_range.min}-${filters.price_range.max} crédits`}
                    onRemove={() => setFilters({ ...filters, price_range: { min: 0, max: 1000 } })}
                  />
                )}
                {filters.available_only && (
                  <FilterBadge
                    icon="✅"
                    label="Disponibles uniquement"
                    onRemove={() => setFilters({ ...filters, available_only: false })}
                  />
                )}
                {searchQuery && (
                      <FilterBadge
                    icon="🔍"
                    label={`Recherche: "${searchQuery}"`}
                    onRemove={() => setSearchQuery('')}
                      />
                    )}
                  </div>
            </Card>
          </motion.section>
        )}

        {/* Résultats avec animations */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-slate-800">
                {filteredItems.length} objet{filteredItems.length > 1 ? 's' : ''} trouvé{filteredItems.length > 1 ? 's' : ''}
              </h2>
              {isLoading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full"
                />
              )}
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4" />
              <span>Trié par {sort.field === 'created_at' ? 'date' : 'prix'} ({sort.direction === 'asc' ? 'croissant' : 'décroissant'})</span>
            </div>
          </div>

          {isLoading ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {Array.from({ length: 8 }).map((_, index) => (
                <MarketplaceItemSkeleton key={index} viewMode={viewMode} />
              ))}
            </div>
          ) : error ? (
            <Card className="text-center py-16 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <div className="text-6xl mb-6">⚠️</div>
                <h3 className="text-xl font-semibold mb-2">Erreur de chargement</h3>
              <p className="text-red-500 mb-6">{error}</p>
              <Button
                onClick={() => fetchItems()}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Réessayer
              </Button>
            </Card>
          ) : filteredItems.length === 0 ? (
            <Card className="text-center py-16 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-6xl mb-6"
              >
                📦
              </motion.div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                Aucun objet trouvé
              </h3>
              <p className="text-slate-600 text-base mb-8 max-w-2xl mx-auto">
                {searchQuery || getActiveFiltersCount() > 0
                  ? 'Aucun objet ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                  : 'Aucun objet n\'est actuellement disponible. Soyez le premier à proposer un objet !'
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleCreateItem}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un objet
                </Button>
                {(searchQuery || getActiveFiltersCount() > 0) && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-slate-300 hover:border-emerald-500 hover:text-emerald-600"
                  >
                    Effacer les filtres
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <motion.div 
              className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
              }`}
            >
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ delay: index * 0.05 }}
                >
                                    <MarketplaceItemCard
                    item={item}
                    viewMode={viewMode}
                    latitude={latitude || undefined}
                    longitude={longitude || undefined}
                    onViewItem={handleViewItem}
                    onRent={handleRentItem}
                    onNavigate={navigate}
                    prefersReducedMotion={false}
                    index={index}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Bouton Voir plus avec animation */}
          {filteredItems.length > 20 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-12"
            >
              <Button
                variant="outline"
                className="border-2 border-slate-300 hover:border-emerald-500 hover:text-emerald-600 rounded-2xl px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Eye className="w-5 h-5 mr-2" />
                Voir plus d'objets
              </Button>
            </motion.div>
          )}
        </motion.section>
      </div>

      {/* Modales */}
      <MarketplaceFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={handleFilterChange}
      />
    </div>
  );
};

export default MarketplacePage;