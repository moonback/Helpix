import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hover = false,
  padding = 'md',
}) => {
  const baseClasses = 'bg-white rounded-xl shadow-sm border border-gray-200';
  
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const classes = clsx(
    baseClasses,
    paddingClasses[padding],
    hover && 'hover:shadow-md hover:border-primary-200 transition-all duration-200 cursor-pointer',
    className
  );

  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick ? {
    whileHover: { y: -2 },
    whileTap: { scale: 0.98 },
    onClick,
  } : {};

  return (
    <Component className={classes} {...motionProps}>
      {children}
    </Component>
  );
};

export default Card;
