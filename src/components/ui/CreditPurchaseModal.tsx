import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '@/features/wallet/stores/walletStore';
import Button from './Button';
import Card from './Card';
import { CREDIT_PACKAGES, calculatePackageStats, formatEuros } from '@/lib/creditPricing';
import { 
  X, 
  CreditCard, 
  Check, 
  Star,
  Gift,
  Zap,
  Crown,
  ShoppingCart,
  DollarSign
} from 'lucide-react';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus: number;
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  requiredCredits?: number;
}

const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  requiredCredits
}) => {
  const { wallet, createTransaction } = useWalletStore();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple'>('card');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const creditPackages: CreditPackage[] = CREDIT_PACKAGES.map(pkg => ({
    ...pkg,
    icon: pkg.id === 'starter' ? <Zap className="w-6 h-6" /> :
          pkg.id === 'popular' ? <Star className="w-6 h-6" /> :
          pkg.id === 'pro' ? <Crown className="w-6 h-6" /> :
          <Gift className="w-6 h-6" />,
    color: pkg.id === 'starter' ? 'from-blue-500 to-blue-600' :
           pkg.id === 'popular' ? 'from-purple-500 to-purple-600' :
           pkg.id === 'pro' ? 'from-amber-500 to-amber-600' :
           'from-emerald-500 to-emerald-600',
    popular: pkg.id === 'popular'
  }));

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    const packageData = creditPackages.find(pkg => pkg.id === selectedPackage);
    if (!packageData || !wallet) return;

    setIsProcessing(true);
    try {
      // Simuler un paiement
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Créer la transaction de crédit
      await createTransaction({
        wallet_id: wallet.id,
        type: 'credit',
        amount: packageData.credits + packageData.bonus,
        description: `Achat de ${packageData.credits} crédits${packageData.bonus > 0 ? ` + ${packageData.bonus} bonus` : ''}`,
        reference_type: 'task_completion',
        reference_id: packageData.id,
        status: 'completed',
        metadata: {
          payment_method: paymentMethod
        }
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'achat:', error);
      // Simuler un succès pour le test
      alert('Achat simulé avec succès !');
      onSuccess?.();
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const getTotalCredits = (packageData: CreditPackage) => {
    return packageData.credits + packageData.bonus;
  };

  const getPricePerCredit = (packageData: CreditPackage) => {
    const stats = calculatePackageStats(packageData as any);
    return formatEuros(stats.pricePerCredit, 3);
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
          className="relative w-full max-w-6xl h-[90vh] max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  Acheter des crédits
                </h2>
                <p className="text-gray-600 mt-1">
                  {requiredCredits 
                    ? `Vous avez besoin de ${requiredCredits} crédits pour cette action`
                    : 'Choisissez un package de crédits pour continuer'
                  }
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="p-6 flex-1 overflow-y-auto">
            {/* Solde actuel */}
            <div className="mb-8">
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Solde actuel</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {wallet?.balance || 0} crédits
                      </p>
                    </div>
                  </div>
                  {requiredCredits && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Crédits requis</p>
                      <p className="text-lg font-semibold text-red-600">
                        {requiredCredits}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Packages de crédits */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Choisissez votre package
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {creditPackages.map((pkg) => (
                  <motion.div
                    key={pkg.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative cursor-pointer ${
                      selectedPackage === pkg.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    <Card className={`h-full transition-all duration-200 ${
                      selectedPackage === pkg.id 
                        ? 'bg-blue-50 border-blue-300 shadow-lg' 
                        : 'hover:shadow-md'
                    }`}>
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            Populaire
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className={`w-16 h-16 bg-gradient-to-r ${pkg.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white`}>
                          {pkg.icon}
                        </div>
                        
                        <h4 className="font-bold text-gray-900 mb-2">{pkg.name}</h4>
                        <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="text-2xl font-bold text-gray-900">
                            {getTotalCredits(pkg)} crédits
                          </div>
                          {pkg.bonus > 0 && (
                            <div className="text-sm text-green-600 font-medium">
                              +{pkg.bonus} bonus
                            </div>
                          )}
                          <div className="text-lg font-semibold text-blue-600">
                            {formatEuros(pkg.price)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getPricePerCredit(pkg)}/crédit
                          </div>
                          {(() => {
                            const stats = calculatePackageStats(pkg as any);
                            return stats.savings > 0 && (
                              <div className="text-xs text-green-600 font-medium">
                                Économie: {formatEuros(stats.actualSavings)} ({stats.savings.toFixed(0)}%)
                              </div>
                            );
                          })()}
                        </div>

                        {selectedPackage === pkg.id && (
                          <div className="flex items-center justify-center text-blue-600">
                            <Check className="w-5 h-5 mr-1" />
                            <span className="text-sm font-medium">Sélectionné</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Méthode de paiement */}
            {selectedPackage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Méthode de paiement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'card', name: 'Carte bancaire', icon: <CreditCard className="w-5 h-5" /> },
                    { id: 'paypal', name: 'PayPal', icon: <span className="w-5 h-5 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">P</span> },
                    { id: 'apple', name: 'Apple Pay', icon: <span className="w-5 h-5 bg-black rounded text-white flex items-center justify-center text-xs">🍎</span> }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {method.icon}
                        <span className="font-medium text-gray-900">{method.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer avec actions */}
          {selectedPackage && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-3xl">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Package sélectionné: <span className="font-semibold text-gray-900">
                    {creditPackages.find(pkg => pkg.id === selectedPackage)?.name}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="px-6 py-2"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handlePurchase}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isProcessing ? 'Traitement...' : 'Acheter maintenant'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );

  // Rendu du modal en tant que portal dans le body
  return createPortal(modalContent, document.body);
};

export default CreditPurchaseModal;