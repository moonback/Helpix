import React from 'react';
import { Filter } from 'lucide-react';
import Button from './Button';

interface FilterButtonProps {
  onClick: () => void;
  activeFiltersCount?: number;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  onClick,
  activeFiltersCount = 0,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={`relative ${className}`}
    >
      <Filter className="w-4 h-4 mr-2" />
      Filtres
      {activeFiltersCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {activeFiltersCount}
        </span>
      )}
    </Button>
  );
};

export default FilterButton;
