import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { useWalletStore } from '@/features/wallet/stores/walletStore';

interface CreditsDisplayProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ 
  className = '', 
  showLabel = true,
  size = 'md'
}) => {
  const navigate = useNavigate();
  const { wallet } = useWalletStore();

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <button
      onClick={() => navigate('/wallet')}
      className={`
        flex items-center gap-2 
        bg-gradient-to-r from-yellow-400 to-yellow-500 
        hover:from-yellow-500 hover:to-yellow-600 
        text-white rounded-full shadow-sm 
        transition-all duration-200 hover:shadow-md
        ${sizeClasses[size]}
        ${className}
      `}
      title="Voir mon wallet"
    >
      <Coins className={iconSizes[size]} />
      {showLabel && (
        <span className="font-semibold">
          {wallet?.balance || 0} crédits
        </span>
      )}
      {!showLabel && (
        <span className="font-semibold">
          {wallet?.balance || 0}
        </span>
      )}
    </button>
  );
};

export default CreditsDisplay;
