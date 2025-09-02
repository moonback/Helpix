import React from 'react';
import { EMPTY_STATES } from '@/lib/branding';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
  variant?: 'noTasks' | 'noOffers' | 'noCredits' | 'custom';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  emoji = '✨',
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
  variant = 'custom'
}) => {
  // Utiliser les textes prédéfinis si variant spécifié
  const getContent = () => {
    if (variant === 'custom') {
      return { title, description, emoji };
    }
    
    const content = EMPTY_STATES[variant];
    return {
      title: content.title,
      description: content.description,
      emoji: emoji || '✨'
    };
  };

  const content = getContent();

  return (
    <div className={`text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      <div className="text-6xl mb-6">{content.emoji}</div>
      <h3 className="text-2xl font-bold text-slate-800 mb-3">{content.title}</h3>
      {content.description && <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto">{content.description}</p>}
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


