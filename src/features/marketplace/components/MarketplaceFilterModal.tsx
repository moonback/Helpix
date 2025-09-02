import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { MarketplaceFilter, ItemCategory, ItemCondition } from '@/types';
import Button from '@/components/ui/Button';


interface MarketplaceFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MarketplaceFilter;
  onFiltersChange: (filters: MarketplaceFilter) => void;
}

const MarketplaceFilterModal: React.FC<MarketplaceFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange
}) => {
  const [localFilters, setLocalFilters] = useState<MarketplaceFilter>(filters);

  // Synchroniser les filtres locaux avec les props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const categories: { value: ItemCategory; label: string; icon: string }[] = [
    { value: 'tools', label: 'Outils', icon: '🔧' },
    { value: 'vehicles', label: 'Véhicules', icon: '🚗' },
    { value: 'sports', label: 'Sport', icon: '⚽' },
    { value: 'electronics', label: 'Électronique', icon: '📱' },
    { value: 'home', label: 'Maison', icon: '🏠' },
    { value: 'garden', label: 'Jardin', icon: '🌱' },
    { value: 'books', label: 'Livres', icon: '📚' },
    { value: 'clothing', label: 'Vêtements', icon: '👕' },
    { value: 'musical', label: 'Musique', icon: '🎵' },
    { value: 'photography', label: 'Photo', icon: '📸' },
    { value: 'outdoor', label: 'Plein air', icon: '🏔️' },
    { value: 'other', label: 'Autres', icon: '📦' },
  ];

  const conditions: { value: ItemCondition; label: string; description: string }[] = [
    { value: 'excellent', label: 'Excellent', description: 'Comme neuf' },
    { value: 'good', label: 'Bon', description: 'Très bon état' },
    { value: 'fair', label: 'Correct', description: 'État correct' },
    { value: 'poor', label: 'Usé', description: 'Fonctionnel mais usé' },
  ];

  const handleCategoryToggle = (category: ItemCategory) => {
    const currentCategories = localFilters.category || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    setLocalFilters({
      ...localFilters,
      category: newCategories.length > 0 ? newCategories : undefined
    });
  };

  const handleConditionToggle = (condition: ItemCondition) => {
    const currentConditions = localFilters.condition || [];
    const newConditions = currentConditions.includes(condition)
      ? currentConditions.filter(c => c !== condition)
      : [...currentConditions, condition];
    
    setLocalFilters({
      ...localFilters,
      condition: newConditions.length > 0 ? newConditions : undefined
    });
  };

  const handlePriceRangeChange = (field: 'min' | 'max', value: number) => {
    setLocalFilters({
      ...localFilters,
      price_range: {
        ...localFilters.price_range,
        [field]: value
      }
    });
  };

  const handleRatingChange = (rating: number) => {
    setLocalFilters({
      ...localFilters,
      rating_min: rating > 0 ? rating : undefined
    });
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters: MarketplaceFilter = {
      available_only: false,
      price_range: { min: 0, max: 1000 } as { min: number; max: number },
      location_radius: 50,
    };
    setLocalFilters(resetFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.category && localFilters.category.length > 0) count++;
    if (localFilters.condition && localFilters.condition.length > 0) count++;
    if (localFilters.price_range && (localFilters.price_range.min > 0 || localFilters.price_range.max < 1000)) count++;
    if (localFilters.rating_min && localFilters.rating_min > 0) count++;
    return count;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Filtres</h2>
                  <p className="text-sm text-slate-600">
                    {getActiveFiltersCount()} filtre{getActiveFiltersCount() !== 1 ? 's' : ''} actif{getActiveFiltersCount() !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Réinitialiser
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-8">
                {/* Catégories */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Catégories</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => handleCategoryToggle(category.value)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                          localFilters.category?.includes(category.value)
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 hover:border-emerald-300 text-slate-700'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg mb-1">{category.icon}</div>
                          <div className="text-xs font-medium">{category.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">État de l'objet</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {conditions.map((condition) => (
                      <button
                        key={condition.value}
                        onClick={() => handleConditionToggle(condition.value)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                          localFilters.condition?.includes(condition.value)
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 hover:border-emerald-300 text-slate-700'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium">{condition.label}</div>
                          <div className="text-xs text-slate-500">{condition.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prix */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Prix par jour (crédits)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-2">Prix minimum</label>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={localFilters.price_range?.min || 0}
                        onChange={(e) => handlePriceRangeChange('min', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2">Prix maximum</label>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={localFilters.price_range?.max || 1000}
                        onChange={(e) => handlePriceRangeChange('max', parseInt(e.target.value) || 1000)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Note minimale */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Note minimale</h3>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleRatingChange(rating)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 ${
                          (localFilters.rating_min || 0) === rating
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 hover:border-emerald-300 text-slate-700'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium">{rating}</div>
                          <div className="text-xs">⭐</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Options supplémentaires */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Options</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={localFilters.available_only || false}
                        onChange={(e) => setLocalFilters({
                          ...localFilters,
                          available_only: e.target.checked
                        })}
                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm text-slate-700">Objets disponibles uniquement</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
              <div className="text-sm text-slate-600">
                {getActiveFiltersCount()} filtre{getActiveFiltersCount() !== 1 ? 's' : ''} sélectionné{getActiveFiltersCount() !== 1 ? 's' : ''}
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleApplyFilters}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                >
                  Appliquer les filtres
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MarketplaceFilterModal;
