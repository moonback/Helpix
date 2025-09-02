// Hook personnalisé pour le système de matching intelligent
import { useEffect, useState, useCallback } from 'react';
import { useMatchingStore } from '@/stores/matchingStore';
import { useAuthStore } from '@/stores/authStore';
import { 
  Recommendation, 
  ProximityAlert,
  SmartNotification,
  MatchingSettings
} from '@/types/matching';

export const useMatching = () => {
  const { user } = useAuthStore();
  const {
    userProfile,
    recommendations,
    proximityAlerts,
    smartNotifications,
    matchingSettings,
    dashboard,
    isLoading,
    error,
    initializeMatching,
    generateRecommendations,
    generateProximityAlerts,
    findBestTasksForUser,
    calculateCompatibility,
    acceptRecommendation,
    dismissRecommendation,
    markRecommendationAsViewed,
    sendSmartNotification,
    markNotificationAsRead,
    clearAllNotifications,
    updateMatchingSettings,
    toggleAutoMatching,
    refreshDashboard
  } = useMatchingStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialisation automatique
  useEffect(() => {
    if (user?.id && !isInitialized) {
      initializeMatching(user.id).then(() => {
        setIsInitialized(true);
      });
    }
  }, [user?.id, isInitialized, initializeMatching]);

  // Fonctions utilitaires
  const getUnreadCount = useCallback(() => {
    return {
      recommendations: recommendations.filter(r => !r.is_viewed).length,
      alerts: proximityAlerts.filter(a => !a.is_viewed).length,
      notifications: smartNotifications.filter(n => !n.is_read).length,
      total: recommendations.filter(r => !r.is_viewed).length + 
             proximityAlerts.filter(a => !a.is_viewed).length + 
             smartNotifications.filter(n => !n.is_read).length
    };
  }, [recommendations, proximityAlerts, smartNotifications]);

  const getHighPriorityItems = useCallback(() => {
    return {
      urgentRecommendations: recommendations.filter(r => r.priority === 'high' && !r.is_viewed),
      urgentAlerts: proximityAlerts.filter(a => !a.is_viewed),
      urgentNotifications: smartNotifications.filter(n => n.priority === 'urgent' && !n.is_read)
    };
  }, [recommendations, proximityAlerts, smartNotifications]);

  const refreshAll = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await Promise.all([
        generateRecommendations(),
        generateProximityAlerts(),
        refreshDashboard()
      ]);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    }
  }, [user?.id, generateRecommendations, generateProximityAlerts, refreshDashboard]);

  const markAllAsRead = useCallback(async () => {
    try {
      await clearAllNotifications();
      // Marquer toutes les recommandations comme vues
      for (const rec of recommendations.filter(r => !r.is_viewed)) {
        await markRecommendationAsViewed(rec.id);
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  }, [clearAllNotifications, recommendations, markRecommendationAsViewed]);

  return {
    // État
    userProfile,
    recommendations,
    proximityAlerts,
    smartNotifications,
    matchingSettings,
    dashboard,
    isLoading,
    error,
    isInitialized,

    // Actions principales
    initializeMatching,
    generateRecommendations,
    generateProximityAlerts,
    refreshAll,
    markAllAsRead,

    // Actions de matching

    findBestTasksForUser,
    calculateCompatibility,

    // Actions de recommandations
    acceptRecommendation,
    dismissRecommendation,
    markRecommendationAsViewed,

    // Actions de notifications
    sendSmartNotification,
    markNotificationAsRead,
    clearAllNotifications,

    // Actions de paramètres
    updateMatchingSettings,
    toggleAutoMatching,

    // Utilitaires
    getUnreadCount,
    getHighPriorityItems,
    refreshDashboard
  };
};

// Hook pour les recommandations spécifiques
export const useRecommendations = () => {
  const {
    recommendations,
    acceptRecommendation,
    dismissRecommendation,
    markRecommendationAsViewed,
    generateRecommendations
  } = useMatching();

  const [filteredRecommendations, setFilteredRecommendations] = useState<Recommendation[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high_priority'>('all');

  // Filtrer les recommandations
  useEffect(() => {
    let filtered = recommendations;

    switch (filter) {
      case 'unread':
        filtered = recommendations.filter(r => !r.is_viewed);
        break;
      case 'high_priority':
        filtered = recommendations.filter(r => r.priority === 'high');
        break;
      default:
        filtered = recommendations;
    }

    setFilteredRecommendations(filtered);
  }, [recommendations, filter]);

  const handleAccept = useCallback(async (recommendation: Recommendation) => {
    await acceptRecommendation(recommendation.id);
  }, [acceptRecommendation]);

  const handleDismiss = useCallback(async (recommendation: Recommendation) => {
    await dismissRecommendation(recommendation.id);
  }, [dismissRecommendation]);

  const handleView = useCallback(async (recommendation: Recommendation) => {
    await markRecommendationAsViewed(recommendation.id);
  }, [markRecommendationAsViewed]);

  const refreshRecommendations = useCallback(async () => {
    await generateRecommendations();
  }, [generateRecommendations]);

  return {
    recommendations: filteredRecommendations,
    allRecommendations: recommendations,
    filter,
    setFilter,
    acceptRecommendation: handleAccept,
    dismissRecommendation: handleDismiss,
    markAsViewed: handleView,
    refreshRecommendations,
    unreadCount: recommendations.filter(r => !r.is_viewed).length,
    highPriorityCount: recommendations.filter(r => r.priority === 'high').length
  };
};

// Hook pour les alertes de proximité
export const useProximityAlerts = () => {
  const {
    proximityAlerts,
    generateProximityAlerts
  } = useMatching();

  const [filteredAlerts, setFilteredAlerts] = useState<ProximityAlert[]>([]);
  const [distanceFilter, setDistanceFilter] = useState<number>(10); // km

  // Filtrer les alertes par distance
  useEffect(() => {
    const filtered = proximityAlerts.filter(alert => alert.distance_km <= distanceFilter);
    setFilteredAlerts(filtered);
  }, [proximityAlerts, distanceFilter]);

  const refreshAlerts = useCallback(async () => {
    await generateProximityAlerts();
  }, [generateProximityAlerts]);

  const getAlertsByDistance = useCallback((maxDistance: number) => {
    return proximityAlerts.filter(alert => alert.distance_km <= maxDistance);
  }, [proximityAlerts]);

  return {
    alerts: filteredAlerts,
    allAlerts: proximityAlerts,
    distanceFilter,
    setDistanceFilter,
    refreshAlerts,
    getAlertsByDistance,
    unreadCount: proximityAlerts.filter(a => !a.is_viewed).length,
    veryCloseAlerts: getAlertsByDistance(1),
    closeAlerts: getAlertsByDistance(3),
    nearbyAlerts: getAlertsByDistance(5)
  };
};

// Hook pour les notifications intelligentes
export const useSmartNotifications = () => {
  const {
    smartNotifications,
    sendSmartNotification,
    markNotificationAsRead,
    clearAllNotifications
  } = useMatching();

  const [filteredNotifications, setFilteredNotifications] = useState<SmartNotification[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'task_match' | 'proximity_alert' | 'skill_opportunity' | 'deadline_reminder'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');

  // Filtrer les notifications
  useEffect(() => {
    let filtered = smartNotifications;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(n => n.priority === priorityFilter);
    }

    setFilteredNotifications(filtered);
  }, [smartNotifications, typeFilter, priorityFilter]);

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
  }, [markNotificationAsRead]);

  const handleClearAll = useCallback(async () => {
    await clearAllNotifications();
  }, [clearAllNotifications]);

  const sendNotification = useCallback(async (notification: Omit<SmartNotification, 'id' | 'created_at'>) => {
    await sendSmartNotification(notification);
  }, [sendSmartNotification]);

  return {
    notifications: filteredNotifications,
    allNotifications: smartNotifications,
    typeFilter,
    setTypeFilter,
    priorityFilter,
    setPriorityFilter,
    markAsRead: handleMarkAsRead,
    clearAll: handleClearAll,
    sendNotification,
    unreadCount: smartNotifications.filter(n => !n.is_read).length,
    urgentCount: smartNotifications.filter(n => n.priority === 'urgent' && !n.is_read).length
  };
};

// Hook pour les paramètres de matching
export const useMatchingSettings = () => {
  const {
    matchingSettings,
    updateMatchingSettings,
    toggleAutoMatching
  } = useMatching();

  const [isUpdating, setIsUpdating] = useState(false);

  const updateSettings = useCallback(async (settings: Partial<MatchingSettings>) => {
    setIsUpdating(true);
    try {
      await updateMatchingSettings(settings);
    } finally {
      setIsUpdating(false);
    }
  }, [updateMatchingSettings]);

  const toggleAuto = useCallback(async (enabled: boolean) => {
    setIsUpdating(true);
    try {
      await toggleAutoMatching(enabled);
    } finally {
      setIsUpdating(false);
    }
  }, [toggleAutoMatching]);

  return {
    settings: matchingSettings,
    updateSettings,
    toggleAutoMatching: toggleAuto,
    isUpdating
  };
};

// Hook pour le dashboard de matching
export const useMatchingDashboard = () => {
  const {
    dashboard,
    refreshDashboard,
    isLoading
  } = useMatching();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshDashboard();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshDashboard]);

  return {
    dashboard,
    refresh,
    isLoading: isLoading || isRefreshing
  };
};
