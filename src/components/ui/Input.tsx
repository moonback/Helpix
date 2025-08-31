import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon,
  multiline = false,
  rows = 3,
  className,
  ...props
}) => {
  const inputClasses = cn(
    'w-full px-3 py-2 border rounded-lg transition-all duration-200',
    'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    'placeholder:text-gray-400',
    {
      'border-red-300 focus:ring-red-500': error,
      'border-gray-300': !error,
      'pl-10': LeftIcon,
      'pr-10': rightIcon,
    },
    className
  );

  const renderInput = () => {
    if (multiline) {
      return (
        <textarea
          rows={rows}
          className={cn(inputClasses, 'resize-none')}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      );
    }

    return (
      <input
        className={inputClasses}
        {...props}
      />
    );
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}
        
        {renderInput()}
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
