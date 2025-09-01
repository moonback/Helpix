import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CreditCard, Plus } from 'lucide-react';
import Button from './Button';

interface InsufficientBalanceAlertProps {
  isVisible: boolean;
  requiredCredits: number;
  currentBalance: number;
  onPurchaseCredits: () => void;
  onClose: () => void;
}

const InsufficientBalanceAlert: React.FC<InsufficientBalanceAlertProps> = ({
  isVisible,
  requiredCredits,
  currentBalance,
  onPurchaseCredits,
  onClose
}) => {
  if (!isVisible) return null;

  const deficit = requiredCredits - currentBalance;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 mb-6 shadow-lg"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Solde insuffisant
          </h3>
          <p className="text-yellow-700 mb-4 leading-relaxed">
            Vous avez <span className="font-semibold">{currentBalance} crédits</span> mais 
            <span className="font-semibold"> {requiredCredits} crédits</span> sont requis pour cette tâche.
          </p>
          
          <div className="bg-white/60 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-yellow-700">Déficit:</span>
              <span className="font-semibold text-yellow-800">{deficit} crédits</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onPurchaseCredits}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Acheter des crédits
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 px-6 py-3 rounded-xl transition-all duration-200"
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InsufficientBalanceAlert;
