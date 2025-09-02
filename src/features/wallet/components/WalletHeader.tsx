import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Wallet } from 'lucide-react';
import Button from '@/components/ui/Button';

interface WalletHeaderProps {
  onBack: () => void;
}

const WalletHeader: React.FC<WalletHeaderProps> = ({ onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-sm border-b border-gray-200"
    >
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mon Wallet
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez vos crédits et vos gains
              </p>
            </div>
          </div>
        </div>
        
      
      </div>
    </motion.div>
  );
};

export default WalletHeader;
