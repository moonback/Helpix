import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  MessageCircle,
  UserCheck,
  Award,
  Package
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { calculateDistance, formatDistance } from '@/lib/utils';
import { useReverseGeocoding } from '@/hooks/useReverseGeocoding';

interface RentableItem {
  id: number;
  name: string;
  description: string;
  daily_price: number | null;
  deposit: number;
  available: boolean;
  owner_id: string;
  location: { lat: number; lng: number } | null;
}

interface RentableItemCardProps {
  item: RentableItem;
  user: any;
  viewMode: 'grid' | 'list';
  latitude?: number;
  longitude?: number;
  onViewItem: (itemId: number) => void;
  onRent: (itemId: number) => void;
  onContact: (itemId: number) => void;
  onNavigate: (path: string) => void;
  prefersReducedMotion: boolean;
  index: number;
}

const RentableItemCard: React.FC<RentableItemCardProps> = React.memo(({
  item,
  user,
  viewMode,
  latitude,
  longitude,
  onViewItem,
  onRent,
  onContact,
  onNavigate,
  prefersReducedMotion,
  index
}) => {
  const { address: itemAddress, isLoading: isLoadingAddress, getAddressFromCoords } = useReverseGeocoding();

  // Convertir les coordonnées en adresse
  useEffect(() => {
    if (item.location?.lat && item.location?.lng) {
      getAddressFromCoords(item.location.lat, item.location.lng);
    }
  }, [item.location, getAddressFromCoords]);
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: prefersReducedMotion ? 0 : index * 0.05, duration: prefersReducedMotion ? 0 : 0.4 }}
      layout
    >
      <Card className={`group relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all duration-300 ${
        viewMode === 'grid' ? 'p-4' : 'p-6'
      }`}>
        {/* Availability Indicator */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
          item.available ? 'from-emerald-500 to-green-600' : 'from-red-500 to-red-600'
        }`}></div>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1 min-w-0">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-sm ${
                item.available ? 'bg-emerald-500' : 'bg-red-500'
              }`}>
                {item.available ? '✓' : '✗'}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 
                className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 cursor-pointer hover:text-emerald-600 transition-colors"
                onClick={() => onViewItem(item.id)}
              >
                {item.name}
              </h3>
              <div className="flex items-center flex-wrap gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                  item.available 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {item.available ? 'Disponible' : 'Indisponible'}
                </span>
                {latitude && longitude && item.location && (
                  <span className="text-sm text-emerald-600 flex items-center font-medium">
                    <MapPin className="w-3 h-3 mr-1" />
                    {formatDistance(calculateDistance(latitude, longitude, item.location.lat, item.location.lng))}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewItem(item.id)}
              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"
              aria-label="Voir les détails de l'objet"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-600 mb-6 leading-relaxed line-clamp-3">
          {item.description}
        </p>

        {/* Enhanced Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-700">
                  {item.daily_price ? `${item.daily_price} crédits/jour` : 'Prix sur demande'}
                </div>
                <div className="text-xs text-slate-500">Prix journalier</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-700">{item.deposit} crédits</div>
                <div className="text-xs text-slate-500">Caution</div>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        {item.location && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span className="font-medium truncate">
                {isLoadingAddress ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-500 mr-2"></div>
                    Chargement...
                  </span>
                ) : (
                  itemAddress || 'Adresse non disponible'
                )}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center space-x-3">
            {user && item.owner_id !== user.id ? (
              <>
                <Button
                  onClick={() => onRent(item.id)}
                  disabled={!item.available}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-2 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  aria-label="Louer cet objet"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {item.available ? 'Louer' : 'Indisponible'}
                </Button>
                <Button
                  onClick={() => onContact(item.id)}
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 px-6 py-2 rounded-2xl transition-all duration-200"
                  aria-label="Contacter le propriétaire"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contacter
                </Button>
              </>
            ) : !user ? (
              <Button
                onClick={() => onNavigate('/login')}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-2 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                aria-label="Se connecter pour louer"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Se connecter pour louer
              </Button>
            ) : (
              <div className="text-sm text-slate-500 italic flex items-center">
                <Award className="w-4 h-4 mr-2" />
                Votre objet
              </div>
            )}
          </div>
          
          <div className="text-right text-sm text-slate-500">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Objet louable</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

RentableItemCard.displayName = 'RentableItemCard';

export default RentableItemCard;
