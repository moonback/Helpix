import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '@/features/wallet/stores/walletStore';
import CreditsDisplayWithPurchase from './CreditsDisplayWithPurchase';
import Button from './Button';
import Card from './Card';
import { 
  Info, 
  CreditCard, 
  Gift, 
  TrendingUp,
  X,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface CreditSystemInfoProps {
  className?: string;
}

const CreditSystemInfo: React.FC<CreditSystemInfoProps> = ({ className = '' }) => {
  const { wallet } = useWalletStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const currentBalance = wallet?.balance || 0;
  const isLowBalance = currentBalance < 50; // Seuil bas

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${className}`}
      >
        <Card className={`relative overflow-hidden ${
          isLowBalance 
            ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
        }`}>
          {/* Bouton de fermeture */}
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="pr-8">
            <div className="flex items-start gap-4">
              {/* Icône */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                isLowBalance 
                  ? 'bg-amber-100 text-amber-600' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {isLowBalance ? (
                  <CreditCard className="w-6 h-6" />
                ) : (
                  <Info className="w-6 h-6" />
                )}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold mb-2 ${
                  isLowBalance ? 'text-amber-800' : 'text-blue-800'
                }`}>
                  {isLowBalance ? 'Crédits insuffisants' : 'Système de crédits'}
                </h3>
                
                <div className={`text-sm mb-3 ${
                  isLowBalance ? 'text-amber-700' : 'text-blue-700'
                }`}>
                  {isLowBalance 
                    ? 'Votre solde est faible. Rechargez pour continuer à créer des tâches.'
                    : 'Les tâches sont maintenant payantes en crédits. Gagnez des crédits en aidant les autres !'
                  }
                </div>

                {/* Solde actuel */}
                <div className="flex items-center gap-3 mb-3">
                  <CreditsDisplayWithPurchase 
                    requiredCredits={isLowBalance ? 50 : undefined}
                    className="flex-shrink-0"
                  />
                </div>

                {/* Bouton d'expansion */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`text-xs ${
                    isLowBalance 
                      ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-100' 
                      : 'text-blue-600 hover:text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  {isExpanded ? 'Masquer les détails' : 'Comment ça marche ?'}
                  <ArrowRight className={`w-3 h-3 ml-1 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`} />
                </Button>
              </div>
            </div>

            {/* Contenu étendu */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Créer des tâches */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 font-bold text-sm">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          Créer des tâches
                        </h4>
                        <p className="text-xs text-gray-600">
                          Coût: 10+ crédits selon la complexité
                        </p>
                      </div>
                    </div>

                    {/* Aider les autres */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-bold text-sm">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          Aider les autres
                        </h4>
                        <p className="text-xs text-gray-600">
                          Gagnez les crédits de la tâche
                        </p>
                      </div>
                    </div>

                    {/* Recharger */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-sm">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          Recharger
                        </h4>
                        <p className="text-xs text-gray-600">
                          Achetez des packages de crédits
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Avantages */}
                  <div className="mt-4 p-3 bg-white/50 rounded-lg">
                    <h5 className="font-medium text-gray-900 text-sm mb-2 flex items-center gap-2">
                      <Gift className="w-4 h-4 text-green-600" />
                      Avantages du système
                    </h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Tâches de meilleure qualité
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Engagement plus fort
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Économie circulaire
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreditSystemInfo;
