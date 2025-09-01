import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Wallet } from '../types/wallet';

interface BalanceCardProps {
  wallet: Wallet | null;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ wallet }) => {
  if (!wallet) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-12 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="group"
    >
      <Card className="p-8 bg-gradient-to-br from-green-500 to-emerald-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">
                Solde disponible
              </p>
              <p className="text-4xl font-bold">
                {wallet.balance.toLocaleString()} crédits
              </p>
            </div>
            
            <motion.div 
              className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"
              whileHover={{ rotate: 5 }}
            >
              <DollarSign className="w-8 h-8" />
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-green-100 text-sm">Total gagné</p>
                <p className="text-lg font-semibold">
                  {wallet.total_earned.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-green-100 text-sm">Total dépensé</p>
                <p className="text-lg font-semibold">
                  {wallet.total_spent.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm text-green-100">
                  Dernière mise à jour: {new Date(wallet.updated_at).toLocaleDateString()}
                </span>
              </div>
              <div className="text-sm text-green-100">
                ID: {wallet.id.slice(0, 8)}...
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default BalanceCard;
