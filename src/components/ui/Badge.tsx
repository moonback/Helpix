import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 focus:ring-gray-500',
    primary: 'bg-blue-100 text-blue-800 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-800 focus:ring-gray-500',
    success: 'bg-green-100 text-green-800 focus:ring-green-500',
    warning: 'bg-yellow-100 text-yellow-800 focus:ring-yellow-500',
    error: 'bg-red-100 text-red-800 focus:ring-red-500',
    info: 'bg-blue-100 text-blue-800 focus:ring-blue-500',
    outline: 'border border-gray-300 text-gray-700 bg-transparent focus:ring-gray-500'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  return (
    <span
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
