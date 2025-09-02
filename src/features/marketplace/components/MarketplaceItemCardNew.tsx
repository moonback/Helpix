import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeImage from '@/components/ui/SafeImage';

import { 
  MapPin, 
  DollarSign, 
  Eye, 
  Heart,
  Calendar,
  User,
  Package,
  Shield,
  Share2
} from 'lucide-react';
import { Item } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { calculateDistance } from '@/lib/utils';
import { useMarketplaceStore } from '@/stores/marketplaceStore';

interface MarketplaceItemCardNewProps {
  item: Item;
  viewMode: 'grid' | 'list';
  latitude?: number;
  longitude?: number;
  onViewItem: (itemId: number) => void;
  onRent: (itemId: number) => void;
  onNavigate: (path: string) => void;
  prefersReducedMotion?: boolean;
  index: number;
}

const MarketplaceItemCardNew: React.FC<MarketplaceItemCardNewProps> = ({
  item,
  viewMode,
  latitude,
  longitude,
  onViewItem,
  onRent,
  onNavigate,
  prefersReducedMotion = false,
  index
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [owner, setOwner] = useState<any>(null);
  const { fetchUserInfo } = useMarketplaceStore();

  // Calculer la distance
  const distance = latitude && longitude && item.latitude && item.longitude
    ? calculateDistance(latitude, longitude, item.latitude, item.longitude)
    : null;

  // Charger les infos du propriétaire
  useEffect(() => {
    if (item.user_id) {
      fetchUserInfo(item.user_id).then(setOwner);
    }
  }, [item.user_id, fetchUserInfo]);

  // Animation props
  const animationProps = prefersReducedMotion ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.1, duration: 0.5 }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implémenter le partage
    console.log('Partager l\'objet:', item.id);
  };

  if (viewMode === 'list') {
    return (
      <motion.div {...animationProps}>
        <Card className="p-6 hover:shadow-2xl transition-all duration-500 cursor-pointer group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:scale-[1.02]">
          <div className="flex gap-6">
            {/* Image avec effet moderne */}
            <div className="flex-shrink-0 relative">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                {item.images && item.images.length > 0 ? (
                  <SafeImage 
                    src={item.images[0]} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    fallbackIcon={<Package className="w-10 h-10 text-emerald-600" />}
                  />
                ) : (
                  <Package className="w-10 h-10 text-emerald-600" />
                )}
              </div>
              
              {/* Indicateur de plusieurs images */}
              {item.images && item.images.length > 1 && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium shadow-lg">
                  +{item.images.length - 1}
                </div>
              )}

              {/* Badge de disponibilité */}
              <div className={`absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                item.available 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {item.available ? 'Disponible' : 'Indisponible'}
              </div>
            </div>

            {/* Contenu principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                    {item.name}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                    {item.description}
                  </p>
                  
                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions rapides */}
                <div className="flex items-center space-x-2 ml-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleFavorite}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorite 
                        ? 'bg-red-100 text-red-500' 
                        : 'bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShare}
                    className="p-2 rounded-full bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-500 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-600">
                    {item.daily_price} crédits/jour
                  </span>
                </div>
                
                {item.deposit && item.deposit > 0 && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Caution: {item.deposit} crédits</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {item.location || 'Localisation non spécifiée'}
                    {distance && ` • ${distance.toFixed(1)} km`}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-4 h-4" />
                  <button
                    onClick={() => onNavigate(`/profile/${item.user_id}`)}
                    className="hover:text-emerald-600 transition-colors"
                  >
                    {owner?.name || 'Propriétaire'}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => onViewItem(item.id)}
                  variant="outline"
                  className="flex-1 border-2 border-slate-200 hover:border-emerald-500 hover:text-emerald-600 rounded-xl py-3"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Voir les détails
                </Button>
                
                {item.available && (
                  <Button
                    onClick={() => onRent(item.id)}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Louer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Rendu pour le mode grille
  return (
    <motion.div {...animationProps}>
      <Card className="p-6 hover:shadow-2xl transition-all duration-500 cursor-pointer group h-full flex flex-col bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:scale-[1.02]">
        {/* Image principale avec overlay */}
        <div className="relative mb-6 overflow-hidden rounded-2xl">
          <div className="aspect-square bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center overflow-hidden">
            {item.images && item.images.length > 0 ? (
              <SafeImage 
                src={item.images[0]} 
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                fallbackIcon={<Package className="w-16 h-16 text-emerald-600" />}
              />
            ) : (
              <Package className="w-16 h-16 text-emerald-600" />
            )}
          </div>
          
          {/* Overlay avec actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleFavorite}
                className="p-3 bg-white/90 rounded-full shadow-lg"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-slate-600'}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="p-3 bg-white/90 rounded-full shadow-lg"
              >
                <Share2 className="w-5 h-5 text-slate-600" />
              </motion.button>
            </div>
          </div>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {!item.available && (
              <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                Indisponible
              </span>
            )}
            
            {item.images && item.images.length > 1 && (
              <span className="bg-white/90 text-slate-700 text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                +{item.images.length - 1} photos
              </span>
            )}
          </div>

          {/* Badge de catégorie */}
          <div className="absolute top-3 right-3">
            <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
              {item.category}
            </span>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors duration-300 line-clamp-2">
              {item.name}
            </h3>
            <p className="text-slate-600 text-sm line-clamp-2 mb-3">
              {item.description}
            </p>
            
            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {item.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
                {item.tags.length > 2 && (
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                    +{item.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Informations */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-emerald-600">
                  {item.daily_price} crédits/jour
                </span>
              </div>
              
              {item.deposit && item.deposit > 0 && (
                <div className="flex items-center gap-1 text-slate-500">
                  <Shield className="w-3 h-3" />
                  <span className="text-xs">{item.deposit}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <MapPin className="w-4 h-4" />
              <span className="truncate">
                {distance ? `${distance.toFixed(1)} km` : 'Distance inconnue'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto space-y-3">
            <Button
              onClick={() => onViewItem(item.id)}
              variant="outline"
              className="w-full border-2 border-slate-200 hover:border-emerald-500 hover:text-emerald-600 rounded-xl py-3"
            >
              <Eye className="w-4 h-4 mr-2" />
              Voir les détails
            </Button>
            
            {item.available && (
              <Button
                onClick={() => onRent(item.id)}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Louer maintenant
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MarketplaceItemCardNew;
