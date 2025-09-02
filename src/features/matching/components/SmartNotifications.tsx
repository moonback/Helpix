import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatchingStore } from '@/stores/matchingStore';
import { SmartNotification } from '@/types/matching';

// Components
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Icons
import { 
  Bell, 
  MapPin, 
  Target, 
  Clock, 
  Star, 

  CheckCircle,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

interface SmartNotificationsProps {
  className?: string;
  maxNotifications?: number;
  showUnreadOnly?: boolean;
}

const SmartNotifications: React.FC<SmartNotificationsProps> = ({ 
  className = '',
  maxNotifications = 10,
  showUnreadOnly = false
}) => {
  const {
    smartNotifications,
    markNotificationAsRead,
    clearAllNotifications
  } = useMatchingStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  // Filtrer les notifications
  const filteredNotifications = smartNotifications
    .filter(notification => !dismissedNotifications.has(notification.id))
    .filter(notification => showUnreadOnly ? !notification.is_read : true)
    .slice(0, isExpanded ? maxNotifications : 3);

  const unreadCount = smartNotifications.filter(n => !n.is_read).length;

  // Handlers
  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
  };

  const handleDismiss = (notificationId: string) => {
    setDismissedNotifications(prev => new Set([...prev, notificationId]));
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    setDismissedNotifications(new Set());
  };

  const getNotificationIcon = (type: SmartNotification['type']) => {
    switch (type) {
      case 'task_match':
        return <Target className="h-5 w-5" />;
      case 'proximity_alert':
        return <MapPin className="h-5 w-5" />;
      case 'skill_opportunity':
        return <Star className="h-5 w-5" />;
      case 'deadline_reminder':
        return <Clock className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: SmartNotification['type'], priority: SmartNotification['priority']) => {
    if (priority === 'urgent') return 'text-red-500';
    if (priority === 'high') return 'text-orange-500';
    
    switch (type) {
      case 'task_match':
        return 'text-blue-500';
      case 'proximity_alert':
        return 'text-green-500';
      case 'skill_opportunity':
        return 'text-purple-500';
      case 'deadline_reminder':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPriorityBadgeVariant = (priority: SmartNotification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'error' as const;
      case 'high':
        return 'warning' as const;
      case 'medium':
        return 'secondary' as const;
      default:
        return 'default' as const;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
  };

  if (filteredNotifications.length === 0) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          {showUnreadOnly ? 'Aucune notification non lue' : 'Aucune notification'}
        </h3>
        <p className="text-gray-500">
          {showUnreadOnly 
            ? 'Vous êtes à jour avec toutes vos notifications !' 
            : 'Nous vous notifierons des nouvelles opportunités.'
          }
        </p>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Notifications intelligentes</h3>
          {unreadCount > 0 && (
            <Badge variant="error" size="sm">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearAll}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
          
          {smartNotifications.length > 3 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Réduire
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Voir tout
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`p-4 transition-all duration-200 ${
                !notification.is_read 
                  ? 'border-l-4 border-l-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}>
                <div className="flex items-start space-x-3">
                  {/* Icône */}
                  <div className={`flex-shrink-0 ${getNotificationColor(notification.type, notification.priority)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                          <Badge variant={getPriorityBadgeVariant(notification.priority)} size="sm">
                            {notification.priority}
                          </Badge>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        
                        {/* Données supplémentaires */}
                        {notification.data && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {notification.data.task_id && (
                              <Badge variant="secondary" size="sm">
                                Tâche #{notification.data.task_id}
                              </Badge>
                            )}
                            {notification.data.distance_km && (
                              <Badge variant="secondary" size="sm">
                                {notification.data.distance_km}km
                              </Badge>
                            )}
                            {notification.data.match_score && (
                              <Badge variant="secondary" size="sm">
                                {Math.round(notification.data.match_score * 100)}% match
                              </Badge>
                            )}
                            {notification.data.skill_name && (
                              <Badge variant="secondary" size="sm">
                                {notification.data.skill_name}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          
                          {notification.expires_at && (
                            <span className="text-xs text-gray-400">
                              Expire {formatTimeAgo(notification.expires_at)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.is_read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDismiss(notification.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer avec statistiques */}
      {smartNotifications.length > 0 && (
        <div className="text-center text-sm text-gray-500 pt-2 border-t">
          {smartNotifications.length} notification{smartNotifications.length > 1 ? 's' : ''} au total
          {unreadCount > 0 && ` • ${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`}
        </div>
      )}
    </div>
  );
};

export default SmartNotifications;
