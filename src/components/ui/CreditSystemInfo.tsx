import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '@/features/wallet/stores/walletStore';
import CreditsDisplayWithPurchase from './CreditsDisplayWithPurchase';
import Button from './Button';
import Card from './Card';
import { 
  CreditCard, 
  Gift, 
  TrendingUp,
  X,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Crown,
  Sparkles,
  Target,
  Users,
  DollarSign,
  Clock,
  Shield
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
  const isVeryLowBalance = currentBalance < 20; // Seuil très bas

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
          isVeryLowBalance
            ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-lg' 
            : isLowBalance 
            ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-md' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md'
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
                isVeryLowBalance
                  ? 'bg-red-100 text-red-600 animate-pulse' 
                  : isLowBalance 
                  ? 'bg-amber-100 text-amber-600' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {isVeryLowBalance ? (
                  <Zap className="w-6 h-6" />
                ) : isLowBalance ? (
                  <CreditCard className="w-6 h-6" />
                ) : (
                  <Sparkles className="w-6 h-6" />
                )}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-lg mb-2 ${
                  isVeryLowBalance 
                    ? 'text-red-800' 
                    : isLowBalance 
                    ? 'text-amber-800' 
                    : 'text-blue-800'
                }`}>
                  {isVeryLowBalance 
                    ? '🚨 Crédits critiques !' 
                    : isLowBalance 
                    ? '⚠️ Crédits insuffisants' 
                    : '✨ Système de crédits actif'}
                </h3>
                
                <div className={`text-sm mb-3 ${
                  isVeryLowBalance 
                    ? 'text-red-700' 
                    : isLowBalance 
                    ? 'text-amber-700' 
                    : 'text-blue-700'
                }`}>
                  {isVeryLowBalance 
                    ? 'Votre solde est critique ! Rechargez immédiatement pour continuer à utiliser la plateforme.'
                    : isLowBalance 
                    ? 'Votre solde est faible. Rechargez maintenant pour éviter les interruptions.'
                    : '🎉 Excellent ! Vous avez assez de crédits. Gagnez plus en aidant les autres !'
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
                    isVeryLowBalance
                      ? 'text-red-600 hover:text-red-700 hover:bg-red-100' 
                      : isLowBalance 
                      ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-100' 
                      : 'text-blue-600 hover:text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  {isExpanded ? 'Masquer les détails' : '💡 Comment ça marche ?'}
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
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-purple-200"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          🎯 Créer des tâches
                        </h4>
                        <p className="text-xs text-gray-600 mb-1">
                          Coût: 10+ crédits selon la complexité
                        </p>
                        <div className="flex items-center gap-1 text-xs text-purple-600">
                          <Star className="w-3 h-3" />
                          <span>Qualité garantie</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Aider les autres */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-green-200"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          🤝 Aider les autres
                        </h4>
                        <p className="text-xs text-gray-600 mb-1">
                          Gagnez les crédits de la tâche
                        </p>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <DollarSign className="w-3 h-3" />
                          <span>Gains instantanés</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Recharger */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-blue-200"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          💎 Recharger
                        </h4>
                        <p className="text-xs text-gray-600 mb-1">
                          Packages avec bonus exclusifs
                        </p>
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <Gift className="w-3 h-3" />
                          <span>Jusqu'à 25% bonus</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Avantages */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                  >
                    <h5 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-green-600" />
                      🚀 Avantages exclusifs
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-xs text-gray-700 font-medium">Tâches de qualité premium</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <Shield className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="text-xs text-gray-700 font-medium">Sécurité garantie</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-3 h-3 text-purple-600" />
                        </div>
                        <span className="text-xs text-gray-700 font-medium">Engagement maximal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                          <Clock className="w-3 h-3 text-orange-600" />
                        </div>
                        <span className="text-xs text-gray-700 font-medium">Réponses rapides</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Call to action */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 text-center"
                  >
                    <h6 className="font-semibold text-gray-900 text-sm mb-2">
                      🎁 Offre spéciale pour les nouveaux utilisateurs !
                    </h6>
                    <p className="text-xs text-gray-600 mb-3">
                      Obtenez 25% de crédits bonus sur votre premier achat
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-blue-600 font-medium">
                      <Star className="w-3 h-3" />
                      <span>Packages Enterprise recommandés</span>
                    </div>
                  </motion.div>
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
