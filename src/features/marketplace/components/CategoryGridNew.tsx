import React from 'react';
import { motion } from 'framer-motion';
import { ItemCategory } from '@/types';

interface CategoryGridNewProps {
  selectedCategory: ItemCategory | 'all';
  onCategorySelect: (category: ItemCategory | 'all') => void;
  stats: {
    categories: Record<ItemCategory, number>;
  };
}

const categoryConfig = {
  tools: { icon: '🔧', label: 'Outils', color: 'from-blue-500 to-blue-600', bgColor: 'from-blue-50 to-blue-100' },
  vehicles: { icon: '🚗', label: 'Véhicules', color: 'from-gray-500 to-gray-600', bgColor: 'from-gray-50 to-gray-100' },
  sports: { icon: '⚽', label: 'Sport', color: 'from-green-500 to-green-600', bgColor: 'from-green-50 to-green-100' },
  electronics: { icon: '📱', label: 'Électronique', color: 'from-purple-500 to-purple-600', bgColor: 'from-purple-50 to-purple-100' },
  home: { icon: '🏠', label: 'Maison', color: 'from-orange-500 to-orange-600', bgColor: 'from-orange-50 to-orange-100' },
  garden: { icon: '🌱', label: 'Jardin', color: 'from-emerald-500 to-emerald-600', bgColor: 'from-emerald-50 to-emerald-100' },
  books: { icon: '📚', label: 'Livres', color: 'from-indigo-500 to-indigo-600', bgColor: 'from-indigo-50 to-indigo-100' },
  clothing: { icon: '👕', label: 'Vêtements', color: 'from-pink-500 to-pink-600', bgColor: 'from-pink-50 to-pink-100' },
  musical: { icon: '🎵', label: 'Musique', color: 'from-yellow-500 to-yellow-600', bgColor: 'from-yellow-50 to-yellow-100' },
  photography: { icon: '📸', label: 'Photo', color: 'from-red-500 to-red-600', bgColor: 'from-red-50 to-red-100' },
  outdoor: { icon: '🏔️', label: 'Plein air', color: 'from-teal-500 to-teal-600', bgColor: 'from-teal-50 to-teal-100' },
  other: { icon: '📦', label: 'Autres', color: 'from-slate-500 to-slate-600', bgColor: 'from-slate-50 to-slate-100' },
};

const CategoryGridNew: React.FC<CategoryGridNewProps> = ({
  selectedCategory,
  onCategorySelect,
  stats
}) => {
  const categories = Object.entries(categoryConfig) as [ItemCategory, typeof categoryConfig[ItemCategory]][];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
    >
      {/* Toutes les catégories */}
      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onCategorySelect('all')}
        className={`relative p-6 rounded-2xl transition-all duration-300 ${
          selectedCategory === 'all'
            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-xl ring-2 ring-emerald-300'
            : 'bg-white/80 hover:bg-white border border-slate-200 hover:border-emerald-300 shadow-lg hover:shadow-xl'
        }`}
      >
        <div className="text-center">
          <motion.div 
            className="text-3xl mb-3"
            animate={selectedCategory === 'all' ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            🌟
          </motion.div>
          <div className="text-sm font-semibold">Tous les objets</div>
          <div className="text-xs opacity-75 mt-1">
            {Object.values(stats.categories).reduce((sum, count) => sum + count, 0)}
          </div>
        </div>
        {selectedCategory === 'all' && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center"
          >
            <div className="w-2 h-2 bg-white rounded-full" />
          </motion.div>
        )}
      </motion.button>

      {/* Catégories individuelles */}
      {categories.map(([category, config], index) => {
        const count = stats.categories[category];
        const isSelected = selectedCategory === category;

        return (
          <motion.button
            key={category}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategorySelect(category)}
            className={`relative p-6 rounded-2xl transition-all duration-300 ${
              isSelected
                ? `bg-gradient-to-r ${config.color} text-white shadow-xl ring-2 ring-white/20`
                : `bg-white/80 hover:bg-white border border-slate-200 hover:border-${config.color.split('-')[1]}-300 shadow-lg hover:shadow-xl`
            }`}
          >
            <div className="text-center">
              <motion.div 
                className="text-3xl mb-3"
                animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {config.icon}
              </motion.div>
              <div className="text-sm font-semibold">{config.label}</div>
              <div className={`text-xs mt-1 ${
                isSelected ? 'opacity-75' : 'text-slate-500'
              }`}>
                {count} objet{count > 1 ? 's' : ''}
              </div>
            </div>

            {/* Indicateur de sélection */}
            {isSelected && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </motion.div>
            )}

            {/* Badge de popularité pour les catégories avec beaucoup d'objets */}
            {count > 10 && !isSelected && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
              >
                <span className="text-xs font-bold text-white">🔥</span>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
};

export default CategoryGridNew;
