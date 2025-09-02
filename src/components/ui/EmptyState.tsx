import React from 'react';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  emoji = '✨',
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
}) => {
  return (
    <div className={`text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      <div className="text-6xl mb-6">{emoji}</div>
      <h3 className="text-2xl font-bold text-slate-800 mb-3">{title}</h3>
      {description && <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto">{description}</p>}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};

export default EmptyState;


