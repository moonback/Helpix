import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const widthToClass: Record<NonNullable<PageContainerProps['width']>, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[90rem]',
  '2xl': 'max-w-[110rem]',
  full: 'max-w-none',
};

const paddingToClass: Record<NonNullable<PageContainerProps['padding']>, string> = {
  none: 'px-0',
  sm: 'px-4 sm:px-6',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-6 sm:px-8 lg:px-10',
};

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  width = 'lg',
  padding = 'md',
}) => {
  return (
    <div className={`w-full ${paddingToClass[padding]}`}>
      <div className={`${widthToClass[width]} mx-auto ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;


