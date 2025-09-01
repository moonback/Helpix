import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWalletStore } from '@/features/wallet/stores/walletStore';
import CreditPurchaseModal from './CreditPurchaseModal';
import { creditsToEuros, formatEuros } from '@/lib/creditPricing';
import { Plus, AlertTriangle, Coins } from 'lucide-react';

interface CreditsDisplayWithPurchaseProps {
  requiredCredits?: number;
  onCreditsSufficient?: () => void;
  showPurchaseButton?: boolean;
  className?: string;
  variant?: 'default' | 'floating';
}

const CreditsDisplayWithPurchase: React.FC<CreditsDisplayWithPurchaseProps> = ({
  requiredCredits,
  onCreditsSufficient,
  showPurchaseButton = true,
  className = '',
  variant = 'default'
}) => {
  const { wallet } = useWalletStore();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const currentBalance = wallet?.balance || 0;
  const hasEnoughCredits = !requiredCredits || currentBalance >= requiredCredits;

  const handlePurchaseSuccess = () => {
    // Rafraîchir le wallet après l'achat
    useWalletStore.getState().fetchWallet();
    
    // Si on a maintenant assez de crédits, déclencher l'action
    if (onCreditsSufficient && hasEnoughCredits) {
      onCreditsSufficient();
    }
  };

  const handlePurchaseClick = () => {
    setIsPurchaseModalOpen(true);
  };

  if (variant === 'floating') {
    return (
      <>
        <div className={`flex flex-col items-center gap-2 ${className}`}>
          {/* Affichage du solde compact */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full px-3 py-2 text-sm shadow-lg">
            <Coins className="w-4 h-4" />
            <div className="flex flex-col items-center">
              <span className="font-semibold leading-tight text-xs">
                {wallet?.balance || 0}
              </span>
              <span className="text-xs opacity-90 leading-tight">
                {formatEuros(creditsToEuros(wallet?.balance || 0))}
              </span>
            </div>
          </div>
          
          {/* Bouton d'achat flottant */}
          {showPurchaseButton && (
            <button
              onClick={handlePurchaseClick}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                !hasEnoughCredits
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              title={!hasEnoughCredits ? 'Recharger' : 'Acheter des crédits'}
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal d'achat */}
        <CreditPurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          onSuccess={handlePurchaseSuccess}
          requiredCredits={requiredCredits}
        />
      </>
    );
  }

  return (
    <>
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Affichage du solde */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full px-3 py-1.5 text-sm shadow-sm">
            <Coins className="w-4 h-4" />
            <div className="flex flex-col">
              <span className="font-semibold leading-tight">
                {wallet?.balance || 0} crédits
              </span>
              <span className="text-xs opacity-90 leading-tight">
                ≈ {formatEuros(creditsToEuros(wallet?.balance || 0))}
              </span>
            </div>
          </div>
          
          {/* Indicateur de crédits insuffisants */}
          {requiredCredits && !hasEnoughCredits && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-200"
            >
              <AlertTriangle className="w-3 h-3" />
              <span className="text-xs font-medium">
                -{requiredCredits - currentBalance}
              </span>
            </motion.div>
          )}
        </div>

        {/* Bouton d'achat */}
        {showPurchaseButton && (
          <button
            onClick={handlePurchaseClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-200 ${
              !hasEnoughCredits
                ? 'border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400'
                : 'border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span className="hidden sm:inline">
              {!hasEnoughCredits ? 'Recharger' : 'Acheter'}
            </span>
          </button>
        )}
      </div>

      {/* Modal d'achat */}
      <CreditPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSuccess={handlePurchaseSuccess}
        requiredCredits={requiredCredits}
      />
    </>
  );
};

export default CreditsDisplayWithPurchase;
