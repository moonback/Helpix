import React from 'react';

interface SkeletonListProps {
  count?: number;
  variant?: 'card' | 'row';
  className?: string;
}

const SkeletonList: React.FC<SkeletonListProps> = ({ count = 8, variant = 'card', className = '' }) => {
  const items = Array.from({ length: count });
  if (variant === 'row') {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-slate-200/60 animate-pulse" />)
        )}
      </div>
    );
  }
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {items.map((_, i) => (
        <div key={i} className="h-44 rounded-xl bg-slate-200/60 animate-pulse" />
      ))}
    </div>
  );
};

export default SkeletonList;


