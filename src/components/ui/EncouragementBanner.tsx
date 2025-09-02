import React, { useState, useEffect } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { ENCOURAGEMENT_MESSAGES } from '@/lib/branding';

interface EncouragementBannerProps {
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'compact';
}

const EncouragementBanner: React.FC<EncouragementBannerProps> = ({
  className = '',
  showIcon = true,
  variant = 'default'
}) => {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % ENCOURAGEMENT_MESSAGES.length);
    }, 8000); // Change de message toutes les 8 secondes

    return () => clearInterval(interval);
  }, []);

  const message = ENCOURAGEMENT_MESSAGES[currentMessage];

  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          {showIcon && <Heart className="h-4 w-4 text-blue-600" />}
          <p className="text-xs text-blue-800 font-medium">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-center space-x-3">
        {showIcon && (
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm text-blue-800 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default EncouragementBanner;
