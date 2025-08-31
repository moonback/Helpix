import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, MapPin, AlertTriangle } from 'lucide-react';
import Button from './Button';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: 'all' | 'local' | 'remote';
  selectedPriority: 'all' | 'low' | 'medium' | 'high' | 'urgent';
  onCategoryChange: (category: 'all' | 'local' | 'remote') => void;
  onPriorityChange: (priority: 'all' | 'low' | 'medium' | 'high' | 'urgent') => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  selectedPriority,
  onCategoryChange,
  onPriorityChange,
}) => {
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full">
                      <Filter className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Filtres</h2>
                      <p className="text-primary-100 text-sm">Affinez votre recherche</p>
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
              <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                {/* Category Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-lg">Type de tâche</h3>
                  </div>
                  <div className="grid gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.key}
                        onClick={() => onCategoryChange(category.key as 'all' | 'local' | 'remote')}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedCategory === category.key
                            ? 'border-primary-500 bg-primary-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-25'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{category.icon}</span>
                          <div className="flex-1">
                            <div className={`font-semibold ${
                              selectedCategory === category.key ? 'text-primary-700' : 'text-gray-800'
                            }`}>
                              {category.label}
                            </div>
                            <div className={`text-sm ${
                              selectedCategory === category.key ? 'text-primary-600' : 'text-gray-500'
                            }`}>
                              {category.description}
                            </div>
                          </div>
                          {selectedCategory === category.key && (
                            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <AlertTriangle className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-lg">Niveau de priorité</h3>
                  </div>
                  <div className="grid gap-3">
                    {priorities.map((priority) => (
                      <button
                        key={priority.key}
                        onClick={() => onPriorityChange(priority.key as 'all' | 'low' | 'medium' | 'high' | 'urgent')}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedPriority === priority.key
                            ? 'border-primary-500 bg-primary-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-25'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{priority.icon}</span>
                          <div className="flex-1">
                            <div className={`font-semibold ${
                              selectedPriority === priority.key ? 'text-primary-700' : 'text-gray-800'
                            }`}>
                              {priority.label}
                            </div>
                            <div className={`text-sm ${
                              selectedPriority === priority.key ? 'text-primary-600' : 'text-gray-500'
                            }`}>
                              {priority.description}
                            </div>
                          </div>
                          {selectedPriority === priority.key && (
                            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Filters Summary */}
                {(selectedCategory !== 'all' || selectedPriority !== 'all') && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-700 mb-3">Filtres actifs :</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategory !== 'all' && (
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                          {categories.find(c => c.key === selectedCategory)?.label}
                        </span>
                      )}
                      {selectedPriority !== 'all' && (
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                          {priorities.find(p => p.key === selectedPriority)?.label}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 p-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onCategoryChange('all');
                      onPriorityChange('all');
                    }}
                    className="flex-1"
                  >
                    Réinitialiser
                  </Button>
                  <Button
                    variant="primary"
                    onClick={onClose}
                    className="flex-1"
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
