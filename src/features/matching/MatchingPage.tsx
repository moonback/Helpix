import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMatchingStore } from '@/stores/matchingStore';
import { useAuthStore } from '@/stores/authStore';

// Components
import MatchingDashboard from './components/MatchingDashboard';
import SmartNotifications from './components/SmartNotifications';
import ProximityAlerts from './components/ProximityAlerts';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// Icons
import { 
  Target, 
  Settings, 
  Bell, 
  MapPin, 
  Sparkles,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';

const MatchingPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    dashboard,
    isLoading,
    error,
    initializeMatching,
    generateRecommendations,
    generateProximityAlerts,
    refreshDashboard
  } = useMatchingStore();

  const [activeView, setActiveView] = useState<'dashboard' | 'notifications' | 'alerts'>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialisation
  useEffect(() => {
    if (user?.id) {
      initializeMatching(user.id);
    }
  }, [user?.id, initializeMatching]);

  // Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        generateRecommendations(),
        generateProximityAlerts(),
        refreshDashboard()
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewChange = (view: typeof activeView) => {
    setActiveView(view);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Initialisation du système de matching
          </h2>
          <p className="text-gray-600">
            Nous analysons votre profil et générons des recommandations personnalisées...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="text-red-500 mb-4">
            <Target className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => user?.id && initializeMatching(user.id)}>
            Réessayer
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white shadow-sm border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-blue-500" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Matching Intelligent
                </h1>
              </div>
              
              {dashboard && (
                <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Sparkles className="h-4 w-4" />
                    <span>{dashboard.pending_recommendations.length} recommandations</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{dashboard.proximity_alerts.length} alertes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{Math.round(dashboard.matching_stats.average_compatibility)}% compatibilité</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                ) : (
                  'Actualiser'
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Ouvrir paramètres */}}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div
        variants={itemVariants}
        className="bg-white border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'alerts', label: 'Alertes proximité', icon: MapPin }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleViewChange(id as typeof activeView)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <motion.div
        variants={itemVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {activeView === 'dashboard' && (
          <MatchingDashboard />
        )}
        
        {activeView === 'notifications' && (
          <div className="max-w-4xl mx-auto">
            <SmartNotifications maxNotifications={20} />
          </div>
        )}
        
        {activeView === 'alerts' && (
          <div className="max-w-4xl mx-auto">
            <ProximityAlerts maxAlerts={20} />
          </div>
        )}
      </motion.div>

      {/* Footer avec informations */}
      {dashboard && (
        <motion.div
          variants={itemVariants}
          className="bg-white border-t mt-12"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-600">Utilisateurs actifs</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboard.matching_stats.total_matches}
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Award className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-600">Matches réussis</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboard.matching_stats.successful_matches}
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-600">Score moyen</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(dashboard.matching_stats.average_compatibility)}%
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-600">Taux de réponse</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(dashboard.matching_stats.response_rate)}%
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MatchingPage;
