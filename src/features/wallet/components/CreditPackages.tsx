import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWalletStore } from '../stores/walletStore';
import CreditPurchaseModal from '@/components/ui/CreditPurchaseModal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CREDIT_PACKAGES, calculatePackageStats, formatEuros } from '@/lib/creditPricing';
import { 
  Star, 
  Gift, 
  Zap, 
  Crown,
  TrendingUp,
  Check,
  Plus
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
  savings?: string;
}

const CreditPackages: React.FC = () => {
  const { wallet } = useWalletStore();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const creditPackages: CreditPackage[] = CREDIT_PACKAGES.map(pkg => {
    const stats = calculatePackageStats(pkg);
    return {
      ...pkg,
      icon: pkg.id === 'starter' ? <Zap className="w-6 h-6" /> :
            pkg.id === 'popular' ? <Star className="w-6 h-6" /> :
            pkg.id === 'pro' ? <Crown className="w-6 h-6" /> :
            <Gift className="w-6 h-6" />,
      color: pkg.id === 'starter' ? 'from-blue-500 to-blue-600' :
             pkg.id === 'popular' ? 'from-purple-500 to-purple-600' :
             pkg.id === 'pro' ? 'from-amber-500 to-amber-600' :
             'from-emerald-500 to-emerald-600',
      popular: pkg.id === 'popular',
      savings: `${stats.savings.toFixed(0)}%`
    };
  });

  const getTotalCredits = (packageData: CreditPackage) => {
    return packageData.credits + packageData.bonus;
  };

  const getPricePerCredit = (packageData: CreditPackage) => {
    const stats = calculatePackageStats(packageData);
    return formatEuros(stats.pricePerCredit, 3);
  };

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseSuccess = () => {
    // Rafraîchir le wallet après l'achat
    useWalletStore.getState().fetchWallet();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Packages de crédits
          </h2>
          <p className="text-gray-600">
            Choisissez le package qui correspond à vos besoins
          </p>
        </div>

        {/* Solde actuel */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Solde actuel</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {wallet?.balance || 0} crédits
            </div>
            <p className="text-sm text-gray-600">
              Total gagné: {wallet?.total_earned || 0} crédits
            </p>
          </div>
        </Card>

        {/* Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {creditPackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative"
            >
              <Card className={`h-full cursor-pointer transition-all duration-200 hover:shadow-lg ${
                pkg.popular ? 'ring-2 ring-purple-500 bg-purple-50' : ''
              }`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Populaire
                    </span>
                  </div>
                )}

                <div className="text-center">
                  {/* Icône */}
                  <div className={`w-16 h-16 bg-gradient-to-r ${pkg.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white`}>
                    {pkg.icon}
                  </div>

                  {/* Nom et description */}
                  <h3 className="font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>

                  {/* Crédits */}
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
                    {pkg.savings && pkg.savings !== '0%' && (
                      <div className="text-xs text-green-600 font-medium">
                        Économie: {pkg.savings}
                      </div>
                    )}
                  </div>

                  {/* Bouton d'achat */}
                  <Button
                    onClick={() => handlePackageSelect(pkg.id)}
                    className={`w-full ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    }`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Acheter
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Informations supplémentaires */}
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
          <div className="text-center space-y-3">
            <h4 className="font-semibold text-gray-900">
              Comment utiliser vos crédits ?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs">1</span>
                </div>
                <span>Créer des tâches</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-xs">2</span>
                </div>
                <span>Aider les autres</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-xs">3</span>
                </div>
                <span>Gagner des crédits</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal d'achat */}
      <CreditPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => {
          setIsPurchaseModalOpen(false);
          setSelectedPackage(null);
        }}
        onSuccess={handlePurchaseSuccess}
      />
    </>
  );
};

export default CreditPackages;
