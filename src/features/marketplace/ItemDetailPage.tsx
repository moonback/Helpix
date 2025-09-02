import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Calendar, 
  DollarSign, 
  Shield,
  User,
  MessageCircle,
  Heart,
  Share2,
  Package,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useMarketplaceStore } from '@/stores/marketplaceStore';
import { useAuthStore } from '@/stores/authStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Item, Rental } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import RentalModal from './components/RentalModal';
import ReviewsSection from './components/ReviewsSection';

const ItemDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();

  // Stores
  const { 
    fetchItemById, 
    fetchRentals,
    isLoading, 
    error 
  } = useMarketplaceStore();
  const { user } = useAuthStore();
  const { latitude, longitude } = useGeolocation();

  // State
  const [item, setItem] = useState<Item | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Charger l'objet
  useEffect(() => {
    if (itemId) {
      const loadItem = async () => {
        const itemData = await fetchItemById(parseInt(itemId));
        if (itemData) {
          setItem(itemData);
        }
      };
      loadItem();
    }
  }, [itemId, fetchItemById]);

  // Charger les locations
  useEffect(() => {
    if (itemId) {
      const loadRentals = async () => {
        const rentalsData = await fetchRentals();
        const itemRentals = rentalsData.filter(rental => rental.item_id === parseInt(itemId));
        setRentals(itemRentals);
      };
      loadRentals();
    }
  }, [itemId, fetchRentals]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-100 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Chargement de l'objet...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-100 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Objet non trouvé</h2>
          <p className="text-slate-600 mb-6">{error || 'Cet objet n\'existe pas ou a été supprimé.'}</p>
          <Button
            onClick={() => navigate('/marketplace')}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
          >
            Retour au marketplace
          </Button>
        </motion.div>
      </div>
    );
  }

  const isOwner = user?.id === item.user_id;
  const distance = latitude && longitude && item.latitude && item.longitude 
    ? calculateDistance(latitude, longitude, item.latitude, item.longitude)
    : null;

  const handleRent = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsRentalModalOpen(true);
  };

  const handleContact = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // TODO: Implémenter la création de conversation
    console.log('Contacter le propriétaire:', item.user_id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: item.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Afficher une notification de succès
    }
  };

  const handleOwnerClick = () => {
    navigate(`/profile/${item.user_id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/marketplace')}
                className="text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">{item.name}</h1>
                  <p className="text-sm text-slate-600">Détails de l'objet</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`${isFavorite ? 'text-red-500' : 'text-slate-600'} hover:text-red-500`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                onClick={handleShare}
                className="text-slate-600 hover:text-slate-800"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="space-y-4">
                {/* Image principale */}
                <div className="aspect-video bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[selectedImageIndex]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-emerald-600" />
                    </div>
                  )}
                </div>

                {/* Miniatures */}
                {item.images && item.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {item.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                          selectedImageIndex === index 
                            ? 'border-emerald-500' 
                            : 'border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${item.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6 mt-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Description</h2>
              <p className="text-slate-700 leading-relaxed">
                {item.description || 'Aucune description disponible.'}
              </p>
            </Card>

            {/* Avis */}
            <ReviewsSection itemId={item.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations principales */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <span className="text-2xl font-bold text-slate-800">
                      {item.daily_price} crédits/jour
                    </span>
                  </div>
                  {item.average_rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-slate-700">
                        {item.average_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {item.deposit && item.deposit > 0 && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Shield className="w-4 h-4" />
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
                    onClick={handleOwnerClick}
                    className="hover:text-emerald-600 transition-colors"
                  >
                    {item.owner?.display_name || 'Propriétaire'}
                  </button>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <div className="space-y-4">
                {!isOwner ? (
                  <>
                    <Button
                      onClick={handleRent}
                      disabled={!item.available}
                      className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {item.available ? 'Demander la location' : 'Indisponible'}
                    </Button>
                    
                    <Button
                      onClick={handleContact}
                      variant="outline"
                      className="w-full border-slate-300 hover:border-emerald-500 hover:text-emerald-600"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contacter le propriétaire
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">C'est votre objet</p>
                    <Button
                      onClick={() => navigate(`/marketplace/${item.id}/edit`)}
                      variant="outline"
                      className="mt-3 border-slate-300 hover:border-emerald-500 hover:text-emerald-600"
                    >
                      Modifier
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Informations détaillées */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Détails</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Catégorie</span>
                  <span className="font-medium text-slate-800">{item.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">État</span>
                  <span className="font-medium text-slate-800">{item.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Disponible</span>
                  <span className={`font-medium ${item.available ? 'text-emerald-600' : 'text-red-600'}`}>
                    {item.available ? 'Oui' : 'Non'}
                  </span>
                </div>
                {item.total_rentals && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Locations</span>
                    <span className="font-medium text-slate-800">{item.total_rentals}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modal de location */}
      <RentalModal
        isOpen={isRentalModalOpen}
        onClose={() => setIsRentalModalOpen(false)}
        item={item}
        user={user}
      />
    </div>
  );
};

// Fonction utilitaire pour calculer la distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default ItemDetailPage;
