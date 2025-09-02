import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  barClassName?: string;
  height?: string; // e.g., 'h-2', 'h-4'
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default';
  showPercentage?: boolean;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  barClassName = '',
  height = 'h-2',
  color = 'primary',
  showPercentage = false,
  animated = true
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const colorClasses = {
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-400',
    default: 'bg-gray-500',
  };

  const animationClass = animated ? 'transition-all duration-500 ease-out' : '';

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden", height)}>
        <div
          className={cn(
            "h-full rounded-full",
            colorClasses[color],
            animationClass,
            barClassName
          )}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progress: ${clampedProgress}%`}
        />
      </div>
      {showPercentage && (
        <div className="text-xs text-gray-600 mt-1 text-center">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;