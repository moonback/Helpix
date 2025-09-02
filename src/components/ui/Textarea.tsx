import React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50',
          {
            'border-red-500 focus:ring-red-500 focus:border-red-500': variant === 'error',
            'h-8 px-2 py-1 text-xs': size === 'sm',
            'h-10 px-3 py-2 text-sm': size === 'md',
            'h-12 px-4 py-3 text-base': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
