import React from 'react';
import { X } from 'lucide-react';

interface FilterBadgeProps {
  label: string;
  icon: string;
  onRemove: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const FilterBadge: React.FC<FilterBadgeProps> = ({
  label,
  icon,
  onRemove,
  variant = 'primary',
  className = ''
}) => {
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-700 border-primary-200',
    secondary: 'bg-gray-100 text-gray-700 border-gray-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    danger: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${variantClasses[variant]} ${className}`}>
      <span className="text-base">{icon}</span>
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="ml-1 p-0.5 hover:bg-current hover:bg-opacity-20 rounded-full transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
};

export default FilterBadge;
