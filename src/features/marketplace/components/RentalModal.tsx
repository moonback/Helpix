import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { Item, User } from '@/types';
import { useMarketplaceStore } from '@/stores/marketplaceStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface RentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item;
  user?: User | null;
}

const RentalModal: React.FC<RentalModalProps> = ({
  isOpen,
  onClose,
  item,
  user
}) => {
  const { requestRental } = useMarketplaceStore();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculer les dates min/max
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3); // 3 mois max
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Calculer le coût total
  const totalDays = startDate && endDate 
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const totalCost = totalDays * (item.daily_price || 0);
  const totalWithDeposit = totalCost + (item.deposit || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Vous devez être connecté pour demander une location');
      return;
    }

    if (!startDate || !endDate) {
      setError('Veuillez sélectionner les dates de location');
      return;
    }

    if (new Date(startDate) < new Date(today)) {
      setError('La date de début ne peut pas être dans le passé');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError('La date de fin doit être après la date de début');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await requestRental({
        itemId: item.id,
        startDate,
        endDate,
        dailyPrice: item.daily_price || 0,
        depositCredits: item.deposit || 0,
      });

      onClose();
      // TODO: Afficher une notification de succès
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la demande de location');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setStartDate('');
      setEndDate('');
      setError(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Demander la location</h2>
                  <p className="text-sm text-slate-600">{item.name}</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Dates */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date de début *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={today}
                    max={maxDateString}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date de fin *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || today}
                    max={maxDateString}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Résumé des coûts */}
              {totalDays > 0 && (
                <Card className="p-4 bg-slate-50">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">Résumé des coûts</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Prix par jour</span>
                      <span>{item.daily_price} crédits</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Durée</span>
                      <span>{totalDays} jour{totalDays !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Coût total</span>
                      <span>{totalCost} crédits</span>
                    </div>
                    {item.deposit && item.deposit > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Caution</span>
                        <span>{item.deposit} crédits</span>
                      </div>
                    )}
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold">
                      <span>Total à payer</span>
                      <span>{totalWithDeposit} crédits</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Informations importantes */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Informations importantes :</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Votre demande sera envoyée au propriétaire</li>
                      <li>• Le propriétaire devra accepter votre demande</li>
                      <li>• Les crédits seront débités lors de l'acceptation</li>
                      <li>• La caution sera remboursée à la fin de la location</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={!startDate || !endDate || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                >
                  {isSubmitting ? 'Envoi...' : 'Envoyer la demande'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RentalModal;
