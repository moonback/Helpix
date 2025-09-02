import React from 'react';
import { motion } from 'framer-motion';
import { ItemCategory } from '@/types';

interface CategoryGridProps {
  selectedCategory: ItemCategory | 'all';
  onCategorySelect: (category: ItemCategory | 'all') => void;
  stats: {
    categories: Record<ItemCategory, number>;
  };
}

const categoryConfig = {
  tools: { icon: '🔧', label: 'Outils', color: 'from-blue-500 to-blue-600' },
  vehicles: { icon: '🚗', label: 'Véhicules', color: 'from-gray-500 to-gray-600' },
  sports: { icon: '⚽', label: 'Sport', color: 'from-green-500 to-green-600' },
  electronics: { icon: '📱', label: 'Électronique', color: 'from-purple-500 to-purple-600' },
  home: { icon: '🏠', label: 'Maison', color: 'from-orange-500 to-orange-600' },
  garden: { icon: '🌱', label: 'Jardin', color: 'from-emerald-500 to-emerald-600' },
  books: { icon: '📚', label: 'Livres', color: 'from-indigo-500 to-indigo-600' },
  clothing: { icon: '👕', label: 'Vêtements', color: 'from-pink-500 to-pink-600' },
  musical: { icon: '🎵', label: 'Musique', color: 'from-yellow-500 to-yellow-600' },
  photography: { icon: '📸', label: 'Photo', color: 'from-red-500 to-red-600' },
  outdoor: { icon: '🏔️', label: 'Plein air', color: 'from-teal-500 to-teal-600' },
  other: { icon: '📦', label: 'Autres', color: 'from-slate-500 to-slate-600' },
};

const CategoryGrid: React.FC<CategoryGridProps> = ({
  selectedCategory,
  onCategorySelect,
  stats
}) => {
  const categories = Object.entries(categoryConfig) as [ItemCategory, typeof categoryConfig[ItemCategory]][];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {/* Toutes les catégories */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onCategorySelect('all')}
        className={`relative p-4 rounded-xl transition-all duration-300 ${
          selectedCategory === 'all'
            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
            : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300'
        }`}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">🌟</div>
          <div className="text-sm font-medium">Toutes</div>
          <div className="text-xs opacity-75">
            {Object.values(stats.categories).reduce((sum, count) => sum + count, 0)}
          </div>
        </div>
      </motion.button>

      {/* Catégories individuelles */}
      {categories.map(([category, config], index) => {
        const count = stats.categories[category];
        const isSelected = selectedCategory === category;

        return (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onCategorySelect(category)}
            className={`relative p-4 rounded-xl transition-all duration-300 ${
              isSelected
                ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{config.icon}</div>
              <div className="text-sm font-medium">{config.label}</div>
              <div className={`text-xs ${isSelected ? 'opacity-75' : 'text-slate-500'}`}>
                {count} objet{count !== 1 ? 's' : ''}
              </div>
            </div>
            
            {/* Indicateur de sélection */}
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
