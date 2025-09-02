import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  Eye, 
  MessageCircle, 
  Heart,
  Calendar,
  User,
  Package,
  Shield
} from 'lucide-react';
import { Item, User as UserType } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { calculateDistance } from '@/lib/utils';

interface MarketplaceItemCardProps {
  item: Item;
  user?: UserType | null;
  viewMode: 'grid' | 'list';
  latitude?: number;
  longitude?: number;
  onViewItem: (itemId: number) => void;
  onRent: (itemId: number) => void;
  onContact: (itemId: number) => void;
  onNavigate: (path: string) => void;
  prefersReducedMotion?: boolean;
  index: number;
}

const MarketplaceItemCard: React.FC<MarketplaceItemCardProps> = ({
  item,
  user,
  viewMode,
  latitude,
  longitude,
  onViewItem,
  onRent,
  onContact,
  onNavigate,
  prefersReducedMotion = false,
  index
}) => {
  const navigate = useNavigate();

  // Calculer la distance si les coordonnées sont disponibles
  const distance = React.useMemo(() => {
    if (!latitude || !longitude || !item.latitude || !item.longitude) return null;
    return calculateDistance(latitude, longitude, item.latitude, item.longitude);
  }, [latitude, longitude, item.latitude, item.longitude]);

  // Déterminer si l'utilisateur est le propriétaire
  const isOwner = user?.id === item.user_id;

  // Gérer les actions
  const handleViewItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewItem(item.id);
  };

  const handleRent = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOwner) return;
    onRent(item.id);
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOwner) return;
    onContact(item.id);
  };

  const handleOwnerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate(`/profile/${item.user_id}`);
  };

  // Animation
  const animationProps = prefersReducedMotion ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.1, duration: 0.5 }
  };

  // Rendu pour le mode liste
  if (viewMode === 'list') {
    return (
      <motion.div {...animationProps}>
        <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="flex gap-6">
            {/* Image */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center overflow-hidden">
                {item.images && item.images.length > 0 ? (
                  <img 
                    src={item.images[0]} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-8 h-8 text-emerald-600" />
                )}
              </div>
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {item.average_rating && (
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{item.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                  {distance && (
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{distance.toFixed(1)} km</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium text-slate-800">{item.daily_price} crédits/jour</span>
                  </div>
                  
                  {item.deposit && item.deposit > 0 && (
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      <span>{item.deposit} crédits de caution</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <button
                      onClick={handleOwnerClick}
                      className="hover:text-emerald-600 transition-colors"
                    >
                      {item.owner?.display_name || 'Propriétaire'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isOwner && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleContact}
                        className="border-slate-300 hover:border-emerald-500 hover:text-emerald-600"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Contacter
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleRent}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Louer
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleViewItem}
                    className="text-slate-600 hover:text-emerald-600"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
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
      <Card className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group h-full flex flex-col">
        {/* Image */}
        <div className="relative mb-4">
          <div className="aspect-square bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center overflow-hidden">
            {item.images && item.images.length > 0 ? (
              <img 
                src={item.images[0]} 
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <Package className="w-12 h-12 text-emerald-600" />
            )}
          </div>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {!item.available && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Indisponible
              </span>
            )}
            {item.average_rating && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                {item.average_rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Bouton favori */}
          <button className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors">
            <Heart className="w-4 h-4 text-slate-600 hover:text-red-500" />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2">
            {item.name}
          </h3>
          
          <p className="text-sm text-slate-600 mb-3 line-clamp-2 flex-1">
            {item.description}
          </p>

          {/* Prix et distance */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 text-emerald-600 font-semibold">
              <DollarSign className="w-4 h-4" />
              <span>{item.daily_price} crédits/jour</span>
            </div>
            
            {distance && (
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="w-4 h-4" />
                <span>{distance.toFixed(1)} km</span>
              </div>
            )}
          </div>

          {/* Propriétaire */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {(item.owner?.display_name || 'P')[0].toUpperCase()}
              </span>
            </div>
            <button
              onClick={handleOwnerClick}
              className="text-sm text-slate-600 hover:text-emerald-600 transition-colors truncate"
            >
              {item.owner?.display_name || 'Propriétaire'}
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            {!isOwner && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleContact}
                  className="flex-1 border-slate-300 hover:border-emerald-500 hover:text-emerald-600"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Contacter
                </Button>
                <Button
                  size="sm"
                  onClick={handleRent}
                  disabled={!item.available}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white disabled:opacity-50"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Louer
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleViewItem}
              className="text-slate-600 hover:text-emerald-600"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MarketplaceItemCard;
