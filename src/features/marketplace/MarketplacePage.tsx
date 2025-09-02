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

import FilterButton from '@/components/ui/FilterButton';
import FilterBadge from '@/components/ui/FilterBadge';
import MarketplaceItemCard from './components/MarketplaceItemCard';
import MarketplaceItemSkeleton from './components/MarketplaceItemSkeleton';
import MarketplaceFilterModal from './components/MarketplaceFilterModal';
import CategoryGrid from './components/CategoryGrid';
import StatsOverview from './components/StatsOverview';

// Icons
import { 
  Search, 
  Plus, 
  Filter,
  SortAsc,
  SortDesc,
  Eye,

  Grid3X3,
  List,
  TrendingUp,
  Star,
  Package,


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

  // Statistiques
  const stats = useMemo(() => getMarketplaceStats(), [items]);

  // Objets filtrés
  const filteredItems = useMemo(() => {
    // Ne pas filtrer si on est en train de charger
    if (isLoading) {
      return [];
    }
    
    let filtered = getFilteredItems();
    
    // Filtre par catégorie sélectionnée
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

  const handleContactOwner = useCallback((itemId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    // TODO: Implémenter la création de conversation
    console.log('Contacter le propriétaire de l\'objet:', itemId);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Marketplace</h1>
                <p className="text-sm text-slate-600">Objets à partager et louer</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={handleCreateItem}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Proposer un objet
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <StatsOverview stats={stats} />
        </motion.section>

        {/* Catégories */}
        <AnimatePresence>
          {showCategories && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Catégories populaires
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCategories(false)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    Masquer
                  </Button>
                </div>
                <CategoryGrid 
                  selectedCategory={selectedCategory}
                  onCategorySelect={handleCategorySelect}
                  stats={stats}
                />
              </Card>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Recherche et filtres */}
        <section className="mb-8">
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Rechercher un objet, une catégorie, un tag..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSearch('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <FilterButton
                  onClick={() => setIsFilterModalOpen(true)}
                  activeFiltersCount={getActiveFiltersCount()}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white border-0"
                />
                
                <Button
                  variant="outline"
                  onClick={() => handleSortChange(sort.field)}
                  className="border-slate-200 hover:border-emerald-500 hover:text-emerald-600"
                >
                  {sort.direction === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                </Button>
                
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded-md transition-all text-sm ${
                      viewMode === 'list' 
                        ? 'bg-white shadow-sm text-emerald-600' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 rounded-md transition-all text-sm ${
                      viewMode === 'grid' 
                        ? 'bg-white shadow-sm text-emerald-600' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Résultats de recherche */}
            <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-emerald-50 rounded-lg p-4 mb-4 border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-semibold text-sm">{filteredItems.length}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">
                    {filteredItems.length} objet{filteredItems.length !== 1 ? 's' : ''} trouvé{filteredItems.length !== 1 ? 's' : ''}
                  </span>
                  {searchQuery && (
                    <span className="text-slate-500 text-sm ml-2">
                      pour "{searchQuery}"
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center text-sm text-slate-500">
                <Star className="w-4 h-4 mr-1" />
                {stats.averageRating.toFixed(1)}/5 en moyenne
              </div>
            </div>

            {/* Filtres actifs */}
            <AnimatePresence>
              {getActiveFiltersCount() > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200 mb-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filtres actifs
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                    >
                      Effacer tout
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
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
                        label={`Condition: ${filters.condition.join(', ')}`}
                        onRemove={() => setFilters({ ...filters, condition: undefined })}
                        variant="secondary"
                      />
                    )}
                    {filters.price_range && (filters.price_range.min > 0 || filters.price_range.max < 1000) && (
                      <FilterBadge
                        icon="💰"
                        label={`Prix: ${filters.price_range.min}-${filters.price_range.max} crédits`}
                        onRemove={() => setFilters({ ...filters, price_range: undefined })}
                        variant="success"
                      />
                    )}
                    {filters.rating_min && filters.rating_min > 0 && (
                      <FilterBadge
                        icon="⭐"
                        label={`Note min: ${filters.rating_min}/5`}
                        onRemove={() => setFilters({ ...filters, rating_min: undefined })}
                        variant="warning"
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </section>

        {/* Liste des objets */}
        <section>
          {isLoading ? (
            <div className={`grid gap-4 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <MarketplaceItemSkeleton key={i} viewMode={viewMode} />
              ))}
            </div>
          ) : error ? (
            <Card className="text-center py-16 bg-red-50 border border-red-200">
              <div className="text-red-600 mb-4">
                <Package className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Erreur de chargement</h3>
                <p className="text-red-500">{error}</p>
              </div>
              <Button
                onClick={() => fetchItems()}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Réessayer
              </Button>
            </Card>
          ) : filteredItems.length === 0 ? (
            <Card className="text-center py-16">
              <div className="text-6xl mb-6">📦</div>
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
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Proposer un objet
                </Button>
                
                {(searchQuery || getActiveFiltersCount() > 0) && (
                  <Button
                    onClick={() => {
                      handleSearch('');
                      clearFilters();
                      setSelectedCategory('all');
                    }}
                    variant="outline"
                    className="border-slate-300 hover:border-emerald-500 hover:text-emerald-600"
                  >
                    <Filter className="w-5 h-5 mr-2" />
                    Effacer les filtres
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className={`grid gap-4 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredItems.map((item, index) => (
                <MarketplaceItemCard
                  key={item.id}
                  item={item}
                  user={user}
                  viewMode={viewMode}
                  latitude={latitude || undefined}
                  longitude={longitude || undefined}
                  onViewItem={handleViewItem}
                  onRent={handleRentItem}
                  onContact={handleContactOwner}
                  onNavigate={navigate}
                  prefersReducedMotion={false}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Bouton Voir plus */}
          {filteredItems.length > 20 && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                className="border-slate-300 hover:border-emerald-500 hover:text-emerald-600"
              >
                <Eye className="w-5 h-5 mr-2" />
                Voir plus d'objets
              </Button>
            </div>
          )}
        </section>
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
