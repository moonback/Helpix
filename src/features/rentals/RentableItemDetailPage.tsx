import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  ShoppingBag, 
  MessageCircle, 
  Award, 
  Package,
  Clock,
  Shield,
  Eye,
  Share2
} from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useReverseGeocoding } from '@/hooks/useReverseGeocoding';
import { calculateDistance, formatDistance } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const RentableItemDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const { latitude, longitude } = useGeolocation();
  const { address: itemAddress, isLoading: isLoadingAddress, getAddressFromCoords } = useReverseGeocoding();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const item = null; // Objets prêtables supprimés

  useEffect(() => {
    const loadItem = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        setError('Objets prêtables non disponibles');
      } catch (err) {
        setError('Erreur lors du chargement de l\'objet');
        console.error('Erreur:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadItem();
  }, [itemId]);

  // Charger l'adresse de l'objet
  useEffect(() => {
    if (item?.location?.lat && item?.location?.lng) {
      getAddressFromCoords(item.location.lat, item.location.lng);
    }
  }, [getAddressFromCoords]);

  const handleRent = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/rentals/${itemId}/rent`);
  };

  const handleContact = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // TODO: Implémenter la création de conversation
    console.log('Contacter le propriétaire de l\'objet:', itemId);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item?.name,
        text: item?.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copier l'URL dans le presse-papiers
      navigator.clipboard.writeText(window.location.href);
      // TODO: Afficher une notification de succès
    }
  };

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
          className="text-center max-w-md mx-auto p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-6xl mb-6">📦</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Objet non trouvé
          </h1>
          <p className="text-slate-600 mb-8">
            {error || 'Objets prêtables non disponibles'}
          </p>
          <Button
            onClick={() => navigate('/rentals')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux objets
          </Button>
        </motion.div>
      </div>
    );
  }

  const isOwner = user && item.owner_id === user.id;
  const distance = latitude && longitude && item.location 
    ? calculateDistance(latitude, longitude, item.location.lat, item.location.lng)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-100 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Détail de l'objet
              </h1>
              <p className="text-sm text-gray-500">
                ID: {item.id} • {item.available ? 'Disponible' : 'Indisponible'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="p-2"
              aria-label="Partager cet objet"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
              item.available 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                : 'bg-red-100 text-red-800 border-red-200'
            }`}>
              {item.available ? 'Disponible' : 'Indisponible'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Informations principales */}
            <Card className="p-8 bg-white rounded-3xl shadow-lg border border-white/50">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center shadow-lg">
                    <Package className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg ${
                    item.available ? 'bg-emerald-500' : 'bg-red-500'
                  }`}>
                    {item.available ? '✓' : '✗'}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-800 mb-4">
                    {item.name}
                  </h1>
                  <p className="text-slate-600 text-lg leading-relaxed mb-6">
                    {item.description}
                  </p>
                  
                  {/* Actions principales */}
                  <div className="flex items-center space-x-4">
                    {isOwner ? (
                      <div className="text-slate-500 italic flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        Votre objet
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={handleRent}
                          disabled={!item.available}
                          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        >
                          <ShoppingBag className="w-5 h-5 mr-2" />
                          {item.available ? 'Louer cet objet' : 'Indisponible'}
                        </Button>
                        <Button
                          onClick={handleContact}
                          variant="outline"
                          className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 px-8 py-4 rounded-2xl transition-all duration-200"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Contacter le propriétaire
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Détails de l'objet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prix et caution */}
              <Card className="p-6 bg-white rounded-2xl shadow-sm border border-white/50">
                <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
                  Tarification
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                    <div>
                      <div className="text-sm text-slate-600">Prix journalier</div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {item.daily_price ? `${item.daily_price} crédits` : 'Sur demande'}
                      </div>
                    </div>
                    <Clock className="w-8 h-8 text-emerald-500" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <div>
                      <div className="text-sm text-slate-600">Caution</div>
                      <div className="text-xl font-semibold text-blue-600">
                        {item.deposit} crédits
                      </div>
                    </div>
                    <Shield className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
              </Card>

              {/* Localisation */}
              <Card className="p-6 bg-white rounded-2xl shadow-sm border border-white/50">
                <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
                  Localisation
                </h3>
                <div className="space-y-4">
                  {isLoadingAddress ? (
                    <div className="flex items-center p-4 bg-slate-50 rounded-xl">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500 mr-3"></div>
                      <span className="text-slate-600">Chargement de l'adresse...</span>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="text-sm text-slate-600 mb-1">Adresse</div>
                      <div className="font-medium text-slate-800">
                        {itemAddress || 'Adresse non disponible'}
                      </div>
                    </div>
                  )}
                  
                  {distance && (
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <div className="text-sm text-slate-600 mb-1">Distance</div>
                      <div className="font-semibold text-emerald-600">
                        {formatDistance(distance)} de votre position
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Informations supplémentaires */}
            <Card className="p-6 bg-white rounded-2xl shadow-sm border border-white/50">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-emerald-600" />
                Informations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-sm text-slate-600 mb-1">Statut</div>
                  <div className="font-medium text-slate-800">
                    {item.available ? 'Disponible à la location' : 'Actuellement indisponible'}
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-sm text-slate-600 mb-1">Type</div>
                  <div className="font-medium text-slate-800">Objet louable</div>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-sm text-slate-600 mb-1">Propriétaire</div>
                  <div className="font-medium text-slate-800">
                    {isOwner ? 'Vous' : 'Utilisateur de la plateforme'}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RentableItemDetailPage;
