import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatching } from '@/hooks/useMatching';
import { useNavigate } from 'react-router-dom';

// Components
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

// Icons
import { 
  Target, 
  Bell, 
  MapPin, 
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';

interface MatchingNotificationBadgeProps {
  className?: string;
  showDetails?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const MatchingNotificationBadge: React.FC<MatchingNotificationBadgeProps> = ({
  className = '',
  showDetails = false,
  position = 'top-right'
}) => {
  const navigate = useNavigate();
  const { getUnreadCount, getHighPriorityItems, isInitialized } = useMatching();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const unreadCount = getUnreadCount();
  const highPriorityItems = getHighPriorityItems();

  // Afficher le badge seulement s'il y a des éléments non lus
  useEffect(() => {
    setIsVisible(unreadCount.total > 0);
  }, [unreadCount.total]);

  // Position du badge
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  const handleViewMatching = () => {
    navigate('/matching');
    setIsExpanded(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isInitialized || !isVisible) {
    return null;
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50 ${className}`}>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative"
          >
            {/* Badge principal */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative shadow-lg"
              >
                <Target className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Matching</span>
                
                {/* Badge de notification */}
                {unreadCount.total > 0 && (
                  <Badge
                    variant="error"
                    size="sm"
                    className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center text-xs"
                  >
                    {unreadCount.total > 99 ? '99+' : unreadCount.total}
                  </Badge>
                )}
              </Button>
            </motion.div>

            {/* Panneau détaillé */}
            <AnimatePresence>
              {isExpanded && showDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <h3 className="font-semibold">Matching Intelligent</h3>
                      </div>
                      <button
                        onClick={handleDismiss}
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-4 space-y-3">
                    {/* Recommandations */}
                    {unreadCount.recommendations > 0 && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Sparkles className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Recommandations</p>
                            <p className="text-sm text-gray-600">
                              {unreadCount.recommendations} nouvelle{unreadCount.recommendations > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Badge variant="primary" size="sm">
                          {unreadCount.recommendations}
                        </Badge>
                      </div>
                    )}

                    {/* Alertes de proximité */}
                    {unreadCount.alerts > 0 && (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <MapPin className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Alertes proximité</p>
                            <p className="text-sm text-gray-600">
                              {unreadCount.alerts} tâche{unreadCount.alerts > 1 ? 's' : ''} à proximité
                            </p>
                          </div>
                        </div>
                        <Badge variant="success" size="sm">
                          {unreadCount.alerts}
                        </Badge>
                      </div>
                    )}

                    {/* Notifications */}
                    {unreadCount.notifications > 0 && (
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-100 rounded-full">
                            <Bell className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Notifications</p>
                            <p className="text-sm text-gray-600">
                              {unreadCount.notifications} notification{unreadCount.notifications > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Badge variant="warning" size="sm">
                          {unreadCount.notifications}
                        </Badge>
                      </div>
                    )}

                    {/* Éléments prioritaires */}
                    {highPriorityItems.urgentRecommendations.length > 0 && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <p className="font-medium text-red-800">Recommandations urgentes</p>
                        </div>
                        <p className="text-sm text-red-600">
                          {highPriorityItems.urgentRecommendations.length} recommandation{highPriorityItems.urgentRecommendations.length > 1 ? 's' : ''} haute priorité
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-3 border-t border-gray-200">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleViewMatching}
                        className="w-full"
                      >
                        Voir le tableau de bord
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MatchingNotificationBadge;
