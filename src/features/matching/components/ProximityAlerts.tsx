import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatchingStore } from '@/stores/matchingStore';

import { useNavigate } from 'react-router-dom';

// Components
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// Icons
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Eye, 
  EyeOff,
  AlertCircle,
  Target,
  CheckCircle,
  X
} from 'lucide-react';

interface ProximityAlertsProps {
  className?: string;
  maxAlerts?: number;
  showUnreadOnly?: boolean;
}

const ProximityAlerts: React.FC<ProximityAlertsProps> = ({ 
  className = '',
  maxAlerts = 10,
  showUnreadOnly = false
}) => {
  const navigate = useNavigate();
  const { proximityAlerts } = useMatchingStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Filtrer les alertes
  const filteredAlerts = proximityAlerts
    .filter(alert => !dismissedAlerts.has(alert.id))
    .filter(alert => showUnreadOnly ? !alert.is_viewed : true)
    .slice(0, isExpanded ? maxAlerts : 3);

  const unreadCount = proximityAlerts.filter(a => !a.is_viewed).length;

  // Handlers
  const handleViewTask = (taskId: number) => {
    navigate(`/task/${taskId}`);
  };

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const handleMarkAsViewed = (alertId: string) => {
    // En production, appeler l'API pour marquer comme vue
    console.log('Marquer alerte comme vue:', alertId);
  };



  const getDistanceBadgeVariant = (distance: number) => {
    if (distance <= 1) return 'success' as const;
    if (distance <= 3) return 'warning' as const;
    if (distance <= 5) return 'secondary' as const;
    return 'error' as const;
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

  const getUrgencyLevel = (distance: number) => {
    if (distance <= 1) return { level: 'Très proche', icon: Target, color: 'text-green-600' };
    if (distance <= 3) return { level: 'Proche', icon: MapPin, color: 'text-yellow-600' };
    if (distance <= 5) return { level: 'À proximité', icon: Navigation, color: 'text-orange-600' };
    return { level: 'Dans la zone', icon: AlertCircle, color: 'text-red-600' };
  };

  if (filteredAlerts.length === 0) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          {showUnreadOnly ? 'Aucune alerte non vue' : 'Aucune alerte de proximité'}
        </h3>
        <p className="text-gray-500">
          {showUnreadOnly 
            ? 'Vous avez vu toutes vos alertes de proximité !' 
            : 'Nous vous notifierons quand des tâches apparaîtront près de vous.'
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
          <MapPin className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Alertes de proximité</h3>
          {unreadCount > 0 && (
            <Badge variant="error" size="sm">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {proximityAlerts.length > 3 && (
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

      {/* Liste des alertes */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredAlerts.map((alert, index) => {
            const urgency = getUrgencyLevel(alert.distance_km);
            const UrgencyIcon = urgency.icon;
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-4 transition-all duration-200 group ${
                  !alert.is_viewed 
                    ? 'border-l-4 border-l-green-500 bg-green-50' 
                    : 'hover:bg-gray-50'
                }`}>
                  <div className="flex items-start space-x-3">
                    {/* Icône de proximité */}
                    <div className={`flex-shrink-0 ${urgency.color}`}>
                      <UrgencyIcon className="h-5 w-5" />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">
                              Tâche à proximité
                            </h4>
                            <Badge variant={getDistanceBadgeVariant(alert.distance_km)} size="sm">
                              {alert.distance_km}km
                            </Badge>
                            <Badge variant="secondary" size="sm">
                              {urgency.level}
                            </Badge>
                            {!alert.is_viewed && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            Une nouvelle tâche correspondant à vos compétences est disponible à proximité.
                          </p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimeAgo(alert.created_at)}
                            </span>
                            <span className="flex items-center">
                              <Target className="h-3 w-3 mr-1" />
                              Tâche #{alert.task_id}
                            </span>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleViewTask(alert.task_id)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Voir la tâche
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsViewed(alert.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Marquer comme vue
                            </Button>
                          </div>
                        </div>

                        {/* Actions secondaires */}
                        <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDismiss(alert.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer avec statistiques */}
      {proximityAlerts.length > 0 && (
        <div className="text-center text-sm text-gray-500 pt-2 border-t">
          {proximityAlerts.length} alerte{proximityAlerts.length > 1 ? 's' : ''} au total
          {unreadCount > 0 && ` • ${unreadCount} non vue${unreadCount > 1 ? 's' : ''}`}
        </div>
      )}
    </div>
  );
};

export default ProximityAlerts;
