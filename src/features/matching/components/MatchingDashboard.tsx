import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatchingStore } from '@/stores/matchingStore';
import { useAuthStore } from '@/stores/authStore';
import { MatchingDashboard as MatchingDashboardType, Recommendation } from '@/types/matching';

// Components
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';

// Icons
import { 
  Target, 
  MapPin, 
 
  Clock, 
  TrendingUp, 
  Bell, 

  Sparkles,
  Users,
  Award,
  Zap,

  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface MatchingDashboardProps {
  className?: string;
}

const MatchingDashboard: React.FC<MatchingDashboardProps> = ({ className = '' }) => {
  const { user } = useAuthStore();
  const {
    dashboard,
    recommendations,
    proximityAlerts,
    smartNotifications,
    isLoading,
    error,
    initializeMatching,
    acceptRecommendation,
    dismissRecommendation,
    markRecommendationAsViewed,
    markNotificationAsRead,
    refreshDashboard
  } = useMatchingStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'alerts' | 'notifications'>('overview');
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);

  // Initialisation
  useEffect(() => {
    if (user?.id) {
      initializeMatching(user.id);
    }
  }, [user?.id, initializeMatching]);

  // Statistiques calculées
  const stats = useMemo(() => {
    if (!dashboard) return null;

    const totalRecommendations = recommendations.length;
    const unreadRecommendations = recommendations.filter(r => !r.is_viewed).length;
    const unreadAlerts = proximityAlerts.filter(a => !a.is_viewed).length;
    const unreadNotifications = smartNotifications.filter(n => !n.is_read).length;

    return {
      totalRecommendations,
      unreadRecommendations,
      unreadAlerts,
      unreadNotifications,
      compatibilityScore: dashboard.matching_stats.average_compatibility,
      responseRate: dashboard.matching_stats.response_rate
    };
  }, [dashboard, recommendations, proximityAlerts, smartNotifications]);

  // Handlers
  const handleAcceptRecommendation = async (recommendation: Recommendation) => {
    await acceptRecommendation(recommendation.id);
    setSelectedRecommendation(null);
    await refreshDashboard();
  };

  const handleDismissRecommendation = async (recommendation: Recommendation) => {
    await dismissRecommendation(recommendation.id);
    setSelectedRecommendation(null);
  };

  const handleViewRecommendation = async (recommendation: Recommendation) => {
    await markRecommendationAsViewed(recommendation.id);
    setSelectedRecommendation(recommendation);
  };

  const handleReadNotification = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initialisation du système de matching...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-red-600">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  if (!dashboard) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-gray-600">
          <Target className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune donnée disponible</h3>
          <p>Le système de matching n'a pas pu charger vos données.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header avec statistiques */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recommandations</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.totalRecommendations || 0}</p>
                {stats?.unreadRecommendations && stats.unreadRecommendations > 0 && (
                  <Badge variant="warning" size="sm" className="mt-1">
                    {stats.unreadRecommendations} nouvelles
                  </Badge>
                )}
              </div>
              <Sparkles className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alertes proximité</p>
                <p className="text-2xl font-bold text-green-600">{proximityAlerts.length}</p>
                {stats?.unreadAlerts && stats.unreadAlerts > 0 && (
                  <Badge variant="success" size="sm" className="mt-1">
                    {stats.unreadAlerts} nouvelles
                  </Badge>
                )}
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Score compatibilité</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(stats?.compatibilityScore || 0)}%
                </p>
                <ProgressBar 
                  progress={stats?.compatibilityScore || 0} 
                  height="h-2"
                  className="mt-2"
                />
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Notifications</p>
                <p className="text-2xl font-bold text-orange-600">{smartNotifications.length}</p>
                {stats?.unreadNotifications && stats.unreadNotifications > 0 && (
                  <Badge variant="error" size="sm" className="mt-1">
                    {stats.unreadNotifications} non lues
                  </Badge>
                )}
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Navigation par onglets */}
      <motion.div variants={itemVariants}>
        <Card className="p-1">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
              { id: 'recommendations', label: 'Recommandations', icon: Sparkles },
              { id: 'alerts', label: 'Alertes', icon: MapPin },
              { id: 'notifications', label: 'Notifications', icon: Bell }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
                {id === 'recommendations' && stats?.unreadRecommendations && stats.unreadRecommendations > 0 && (
                  <Badge variant="warning" size="sm">{stats.unreadRecommendations}</Badge>
                )}
                {id === 'alerts' && stats?.unreadAlerts && stats.unreadAlerts > 0 && (
                  <Badge variant="success" size="sm">{stats.unreadAlerts}</Badge>
                )}
                {id === 'notifications' && stats?.unreadNotifications && stats.unreadNotifications > 0 && (
                  <Badge variant="error" size="sm">{stats.unreadNotifications}</Badge>
                )}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Contenu des onglets */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <OverviewTab dashboard={dashboard} stats={stats} />
          )}
          {activeTab === 'recommendations' && (
            <RecommendationsTab
              recommendations={recommendations}
              onView={handleViewRecommendation}
              onAccept={handleAcceptRecommendation}
              onDismiss={handleDismissRecommendation}
            />
          )}
          {activeTab === 'alerts' && (
            <AlertsTab alerts={proximityAlerts} />
          )}
          {activeTab === 'notifications' && (
            <NotificationsTab
              notifications={smartNotifications}
              onRead={handleReadNotification}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modale de recommandation */}
      <AnimatePresence>
        {selectedRecommendation && (
          <RecommendationModal
            recommendation={selectedRecommendation}
            onAccept={() => handleAcceptRecommendation(selectedRecommendation)}
            onDismiss={() => handleDismissRecommendation(selectedRecommendation)}
            onClose={() => setSelectedRecommendation(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Composant Vue d'ensemble
const OverviewTab: React.FC<{ dashboard: MatchingDashboardType; stats: any }> = ({ dashboard, stats }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Profil utilisateur */}
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Users className="h-5 w-5 mr-2" />
        Votre profil
      </h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <img
            src={dashboard.user_profile.avatar_url || '/default-avatar.png'}
            alt={dashboard.user_profile.display_name}
            className="h-12 w-12 rounded-full"
          />
          <div>
            <h4 className="font-medium">{dashboard.user_profile.display_name}</h4>
            <p className="text-sm text-gray-600">{dashboard.user_profile.location}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Niveau de confiance</p>
            <Badge variant="success">{dashboard.user_profile.trust_level}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">Score réputation</p>
            <p className="font-semibold">{dashboard.user_profile.reputation_score}/100</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Compétences principales</p>
          <div className="flex flex-wrap gap-2">
            {dashboard.user_profile.skills.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="secondary" size="sm">
                {skill.skill_name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>

    {/* Statistiques de matching */}
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Award className="h-5 w-5 mr-2" />
        Statistiques
      </h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Taux de réponse</span>
            <span>{stats?.responseRate || 0}%</span>
          </div>
          <ProgressBar progress={stats?.responseRate || 0} height="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Taux de completion</span>
            <span>{dashboard.matching_stats.completion_rate}%</span>
          </div>
          <ProgressBar progress={dashboard.matching_stats.completion_rate} height="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{dashboard.matching_stats.total_matches}</p>
            <p className="text-sm text-gray-600">Matches totaux</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{dashboard.matching_stats.successful_matches}</p>
            <p className="text-sm text-gray-600">Matches réussis</p>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

// Composant Recommandations
const RecommendationsTab: React.FC<{
  recommendations: Recommendation[];
  onView: (rec: Recommendation) => void;
  onAccept: (rec: Recommendation) => void;
  onDismiss: (rec: Recommendation) => void;
}> = ({ recommendations, onView, onAccept, onDismiss }) => (
  <div className="space-y-4">
    {recommendations.length === 0 ? (
      <Card className="p-8 text-center">
        <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune recommandation</h3>
        <p className="text-gray-500">Nous générons de nouvelles recommandations pour vous...</p>
      </Card>
    ) : (
      recommendations.map((recommendation, index) => (
        <motion.div
          key={recommendation.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`p-4 ${!recommendation.is_viewed ? 'border-l-4 border-l-blue-500' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant={recommendation.priority === 'high' ? 'error' : recommendation.priority === 'medium' ? 'warning' : 'secondary'}>
                    {recommendation.type}
                  </Badge>
                  <Badge variant="secondary">
                    {Math.round(recommendation.score * 100)}% compatibilité
                  </Badge>
                  {!recommendation.is_viewed && (
                    <Badge variant="primary" size="sm">Nouveau</Badge>
                  )}
                </div>
                
                <h4 className="font-semibold mb-1">Tâche #{recommendation.task_id}</h4>
                <p className="text-gray-600 text-sm mb-3">{recommendation.reason}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(recommendation.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    Expire {new Date(recommendation.expires_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onView(recommendation)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => onAccept(recommendation)}
                  disabled={recommendation.is_accepted}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="error"
                  onClick={() => onDismiss(recommendation)}
                  disabled={recommendation.is_dismissed}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))
    )}
  </div>
);

// Composant Alertes
const AlertsTab: React.FC<{ alerts: any[] }> = ({ alerts }) => (
  <div className="space-y-4">
    {alerts.length === 0 ? (
      <Card className="p-8 text-center">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune alerte de proximité</h3>
        <p className="text-gray-500">Nous vous notifierons quand des tâches apparaîtront près de vous.</p>
      </Card>
    ) : (
      alerts.map((alert, index) => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`p-4 ${!alert.is_viewed ? 'border-l-4 border-l-green-500' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-semibold">Tâche à proximité</h4>
                  <p className="text-sm text-gray-600">
                    Tâche #{alert.task_id} à {alert.distance_km}km de vous
                  </p>
                </div>
              </div>
              <Badge variant="success" size="sm">
                {alert.distance_km}km
              </Badge>
            </div>
          </Card>
        </motion.div>
      ))
    )}
  </div>
);

// Composant Notifications
const NotificationsTab: React.FC<{
  notifications: any[];
  onRead: (id: string) => void;
}> = ({ notifications, onRead }) => (
  <div className="space-y-4">
    {notifications.length === 0 ? (
      <Card className="p-8 text-center">
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune notification</h3>
        <p className="text-gray-500">Vous êtes à jour !</p>
      </Card>
    ) : (
      notifications.map((notification, index) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`p-4 ${!notification.is_read ? 'border-l-4 border-l-orange-500' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Bell className={`h-5 w-5 mt-0.5 ${!notification.is_read ? 'text-orange-500' : 'text-gray-400'}`} />
                <div>
                  <h4 className="font-semibold">{notification.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={notification.priority === 'high' ? 'error' : notification.priority === 'medium' ? 'warning' : 'secondary'}>
                  {notification.priority}
                </Badge>
                {!notification.is_read && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRead(notification.id)}
                  >
                    Marquer comme lu
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))
    )}
  </div>
);

// Modale de recommandation
const RecommendationModal: React.FC<{
  recommendation: Recommendation;
  onAccept: () => void;
  onDismiss: () => void;
  onClose: () => void;
}> = ({ recommendation, onAccept, onDismiss, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-lg p-6 max-w-md w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recommandation</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <XCircle className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Badge variant={recommendation.priority === 'high' ? 'error' : recommendation.priority === 'medium' ? 'warning' : 'secondary'}>
            {recommendation.type}
          </Badge>
          <Badge variant="secondary">
            {Math.round(recommendation.score * 100)}% compatibilité
          </Badge>
        </div>
        
        <p className="text-gray-600">{recommendation.reason}</p>
        
        <div className="flex space-x-3 pt-4">
          <Button
            variant="success"
            onClick={onAccept}
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Accepter
          </Button>
          <Button
            variant="error"
            onClick={onDismiss}
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rejeter
          </Button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

export default MatchingDashboard;
