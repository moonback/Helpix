import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  Clock, 
  DollarSign, 
  MessageSquare, 
  User, 

  AlertCircle
} from 'lucide-react';
import Button from './Button';
import { HelpOffer } from '@/types';
import { useHelpOfferStore } from '@/stores/helpOfferStore';

interface HelpOffersListProps {
  offers: HelpOffer[];
  taskId: number;
  onOfferUpdate?: () => void;
}

const HelpOffersList: React.FC<HelpOffersListProps> = ({
  offers,
  onOfferUpdate
}) => {
  const { acceptHelpOffer, rejectHelpOffer, isLoading } = useHelpOfferStore();
  const [selectedOffer, setSelectedOffer] = useState<HelpOffer | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject'>('accept');

  const handleAcceptOffer = async (offer: HelpOffer) => {
    setSelectedOffer(offer);
    setActionType('accept');
    setResponseMessage('');
    setShowResponseModal(true);
  };

  const handleRejectOffer = async (offer: HelpOffer) => {
    setSelectedOffer(offer);
    setActionType('reject');
    setResponseMessage('');
    setShowResponseModal(true);
  };

  const confirmAction = async () => {
    if (!selectedOffer) return;

    try {
      if (actionType === 'accept') {
        await acceptHelpOffer(selectedOffer.id, responseMessage.trim() || undefined);
      } else {
        await rejectHelpOffer(selectedOffer.id, responseMessage.trim() || undefined);
      }
      
      setShowResponseModal(false);
      setSelectedOffer(null);
      setResponseMessage('');
      onOfferUpdate?.();
    } catch (error) {
      console.error('Erreur lors de l\'action sur l\'offre:', error);
    }
  };

  const getStatusColor = (status: HelpOffer['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusText = (status: HelpOffer['status']) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'accepted':
        return 'Acceptée';
      case 'rejected':
        return 'Refusée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  if (offers.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium">Aucune offre d'aide reçue</p>
        <p className="text-slate-400 text-sm">Les offres d'aide apparaîtront ici</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer, index) => (
        <motion.div
          key={offer.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300"
        >
          {/* Header avec statut */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                                 <h3 className="font-semibold text-slate-800">
                   {offer.helper?.email || 'Utilisateur anonyme'}
                 </h3>
                <p className="text-sm text-slate-500">
                  Offre reçue le {new Date(offer.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(offer.status)}`}>
              {getStatusText(offer.status)}
            </div>
          </div>

          {/* Message de l'offre */}
          {offer.message && (
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 leading-relaxed">{offer.message}</p>
              </div>
            </div>
          )}

          {/* Propositions alternatives */}
          {(offer.proposed_duration || offer.proposed_credits) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {offer.proposed_duration && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">Durée proposée</span>
                  </div>
                  <p className="text-emerald-700 font-semibold">{offer.proposed_duration}h</p>
                </div>
              )}
              
              {offer.proposed_credits && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Crédits proposés</span>
                  </div>
                  <p className="text-purple-700 font-semibold">{offer.proposed_credits} crédits</p>
                </div>
              )}
            </div>
          )}

          {/* Réponse du propriétaire */}
          {offer.response_message && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 mb-1">Votre réponse</p>
                  <p className="text-amber-700">{offer.response_message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {offer.status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                onClick={() => handleAcceptOffer(offer)}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-2 rounded-xl"
                disabled={isLoading}
              >
                <Check className="w-4 h-4 mr-2" />
                Accepter
              </Button>
              <Button
                onClick={() => handleRejectOffer(offer)}
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 py-2 rounded-xl"
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Refuser
              </Button>
            </div>
          )}
        </motion.div>
      ))}

      {/* Modal de confirmation */}
      <AnimatePresence>
        {showResponseModal && selectedOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowResponseModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6"
            >
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  actionType === 'accept' 
                    ? 'bg-emerald-100' 
                    : 'bg-red-100'
                }`}>
                  {actionType === 'accept' ? (
                    <Check className="w-8 h-8 text-emerald-600" />
                  ) : (
                    <X className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {actionType === 'accept' ? 'Accepter l\'offre' : 'Refuser l\'offre'}
                </h3>
                <p className="text-slate-600">
                  {actionType === 'accept' 
                    ? 'Êtes-vous sûr de vouloir accepter cette offre d\'aide ?'
                    : 'Êtes-vous sûr de vouloir refuser cette offre d\'aide ?'
                  }
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Message de réponse (optionnel)
                </label>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder={actionType === 'accept' 
                    ? 'Message de bienvenue et instructions...'
                    : 'Raison du refus (optionnel)...'
                  }
                  className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowResponseModal(false)}
                  className="flex-1 border-slate-300 hover:border-slate-400"
                >
                  Annuler
                </Button>
                <Button
                  onClick={confirmAction}
                  className={`flex-1 py-2 ${
                    actionType === 'accept'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                      : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
                  } text-white`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Traitement...' : (actionType === 'accept' ? 'Accepter' : 'Refuser')}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HelpOffersList;
