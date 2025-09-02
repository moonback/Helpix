import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import { SUCCESS_MESSAGES } from '@/lib/branding';

interface SuccessMessageProps {
  type?: keyof typeof SUCCESS_MESSAGES;
  message?: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
  className?: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  type,
  message,
  onClose,
  autoClose = true,
  duration = 5000,
  className = ''
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const displayMessage = message || (type ? SUCCESS_MESSAGES[type] : '');

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-green-800">
              {displayMessage}
            </p>
          </div>
          {onClose && (
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => {
                  setIsVisible(false);
                  onClose();
                }}
                className="inline-flex text-green-400 hover:text-green-600 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;
