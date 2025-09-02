import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon = <Plus className="w-6 h-6" />,
  label,
  position = 'bottom-right',
  size = 'md',
  className = '',
  showOnMobile = true,
  showOnDesktop = false
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const visibilityClasses = `
    ${showOnMobile ? 'block' : 'hidden'} 
    ${showOnDesktop ? 'lg:block' : 'lg:hidden'}
  `;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.5
      }}
      onClick={onClick}
      className={`
        fixed z-50
        ${positionClasses[position]}
        ${sizeClasses[size]}
        ${visibilityClasses}
        bg-gradient-to-r from-blue-600 to-indigo-600
        hover:from-blue-700 hover:to-indigo-700
        text-white
        rounded-full
        shadow-2xl
        hover:shadow-3xl
        flex items-center justify-center
        transition-all duration-300
        focus:outline-none focus:ring-4 focus:ring-blue-300
        ${className}
      `}
      aria-label={label || "Action rapide"}
    >
      <div className={iconSizeClasses[size]}>
        {icon}
      </div>
    </motion.button>
  );
};

export default FloatingActionButton;
