import React from 'react';
import { motion } from 'framer-motion';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  animation?: boolean;
  animationDelay?: number;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  itemClassName = '',
  columns = { mobile: 1, tablet: 2, desktop: 3, wide: 4 },
  gap = 'md',
  animation = true,
  animationDelay = 0.05
}) => {
  const childrenArray = React.Children.toArray(children);
  
  const gapClasses = {
    sm: 'gap-2 sm:gap-3 lg:gap-4',
    md: 'gap-4 sm:gap-6 lg:gap-8',
    lg: 'gap-6 sm:gap-8 lg:gap-12'
  };

  const gridClasses = `
    grid
    ${columns.mobile ? `grid-cols-${columns.mobile}` : 'grid-cols-1'}
    ${columns.tablet ? `sm:grid-cols-${columns.tablet}` : 'sm:grid-cols-2'}
    ${columns.desktop ? `lg:grid-cols-${columns.desktop}` : 'lg:grid-cols-3'}
    ${columns.wide ? `xl:grid-cols-${columns.wide}` : 'xl:grid-cols-4'}
    ${gapClasses[gap]}
    ${className}
  `.trim();

  if (!animation) {
    return (
      <div className={gridClasses}>
        {childrenArray.map((child, index) => (
          <div key={index} className={itemClassName}>
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={gridClasses}>
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: index * animationDelay,
            duration: 0.4,
            ease: "easeOut"
          }}
          className={itemClassName}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

export default ResponsiveGrid;
