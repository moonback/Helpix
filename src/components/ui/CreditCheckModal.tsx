import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '@/features/wallet/stores/walletStore';
import CreditsDisplayWithPurchase from './CreditsDisplayWithPurchase';
import Button from './Button';
import Card from './Card';
import { 
  AlertTriangle, 
  CreditCard, 
  CheckCircle, 
  X,
  Info
} from 'lucide-react';

interface CreditCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCredits: number;
  taskTitle: string;
  onCreditsSufficient: () => void;
  onPurchaseSuccess?: () => void;
}

const CreditCheckModal: React.FC<CreditCheckModalProps> = ({
  isOpen,
  onClose,
  requiredCredits,
  taskTitle,
  onCreditsSufficient,
  onPurchaseSuccess
}) => {
  const { wallet } = useWalletStore();
  const currentBalance = wallet?.balance || 0;
  const hasEnoughCredits = currentBalance >= requiredCredits;
  const missingCredits = Math.max(0, requiredCredits - currentBalance);

  const handlePurchaseSuccess = () => {
    onPurchaseSuccess?.();
    // Vérifier si on a maintenant assez de crédits
    const newBalance = useWalletStore.getState().wallet?.balance || 0;
    if (newBalance >= requiredCredits) {
      onCreditsSufficient();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  hasEnoughCredits 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {hasEnoughCredits ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {hasEnoughCredits ? 'Crédits suffisants' : 'Crédits insuffisants'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Vérification pour "{taskTitle}"
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="p-6">
            {/* Statut des crédits */}
            <Card className={`mb-6 ${
              hasEnoughCredits 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${
                  hasEnoughCredits ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currentBalance} / {requiredCredits}
                </div>
                <p className={`text-sm font-medium ${
                  hasEnoughCredits ? 'text-green-700' : 'text-red-700'
                }`}>
                  {hasEnoughCredits 
                    ? 'Vous avez assez de crédits !' 
                    : `${missingCredits} crédits manquants`
                  }
                </p>
              </div>
            </Card>

            {/* Détails */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Solde actuel</span>
                <span className="font-semibold text-gray-900">{currentBalance} crédits</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Coût de la tâche</span>
                <span className="font-semibold text-gray-900">{requiredCredits} crédits</span>
              </div>
              
              {!hasEnoughCredits && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-red-600">Crédits manquants</span>
                  <span className="font-semibold text-red-600">{missingCredits} crédits</span>
                </div>
              )}
              
              {hasEnoughCredits && (
                <div className="flex items-center justify-between py-3">
                  <span className="text-green-600">Solde après création</span>
                  <span className="font-semibold text-green-600">
                    {currentBalance - requiredCredits} crédits
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {hasEnoughCredits ? (
                <Button
                  onClick={onCreditsSufficient}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Créer la tâche
                </Button>
              ) : (
                <CreditsDisplayWithPurchase
                  requiredCredits={requiredCredits}
                  onCreditsSufficient={onCreditsSufficient}
                  className="w-full"
                />
              )}
              
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Annuler
              </Button>
            </div>

            {/* Information */}
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Comment ça marche ?</p>
                  <p>
                    Les crédits sont débités automatiquement lors de la création de votre tâche. 
                    Vous pouvez gagner des crédits en aidant d'autres utilisateurs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreditCheckModal;
