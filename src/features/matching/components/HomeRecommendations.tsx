import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecommendations } from '@/hooks/useMatching';
import { useNavigate } from 'react-router-dom';
import { Recommendation } from '@/types/matching';

// Components
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';

// Icons
import { 
  Sparkles, 
  MapPin, 
  Clock, 
 
  Target,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  Zap,
  TrendingUp
} from 'lucide-react';

interface HomeRecommendationsProps {
  className?: string;
  maxRecommendations?: number;
  showHeader?: boolean;
}

const HomeRecommendations: React.FC<HomeRecommendationsProps> = ({
  className = '',
  maxRecommendations = 3,
  showHeader = true
}) => {
  const navigate = useNavigate();
  const {
    recommendations,
    unreadCount,
    highPriorityCount,
    acceptRecommendation,
    dismissRecommendation,

  } = useRecommendations();

  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Afficher les recommandations les plus pertinentes
  const topRecommendations = recommendations
    .filter(rec => !rec.is_dismissed)
    .sort((a, b) => b.score - a.score)
    .slice(0, isExpanded ? maxRecommendations * 2 : maxRecommendations);

  const handleViewTask = (taskId: number) => {
    navigate(`/task/${taskId}`);
  };

  const handleAcceptRecommendation = async (recommendation: Recommendation) => {
    await acceptRecommendation(recommendation);
    setSelectedRecommendation(null);
  };

  const handleDismissRecommendation = async (recommendation: Recommendation) => {
    await dismissRecommendation(recommendation);
    setSelectedRecommendation(null);
  };



  const getRecommendationIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'proximity':
        return <MapPin className="h-4 w-4" />;
      case 'skill_match':
        return <Target className="h-4 w-4" />;
      case 'urgency':
        return <Zap className="h-4 w-4" />;
      case 'history':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (type: Recommendation['type']) => {
    switch (type) {
      case 'proximity':
        return 'text-green-600 bg-green-100';
      case 'skill_match':
        return 'text-blue-600 bg-blue-100';
      case 'urgency':
        return 'text-red-600 bg-red-100';
      case 'history':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (topRecommendations.length === 0) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Aucune recommandation
        </h3>
        <p className="text-gray-500">
          Nous analysons votre profil pour vous proposer des tâches adaptées...
        </p>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Recommandations pour vous
            </h2>
            {unreadCount > 0 && (
              <Badge variant="primary" size="sm">
                {unreadCount} nouvelles
              </Badge>
            )}
            {highPriorityCount > 0 && (
              <Badge variant="error" size="sm">
                {highPriorityCount} urgentes
              </Badge>
            )}
          </div>
          
          {recommendations.length > maxRecommendations && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Réduire' : 'Voir tout'}
            </Button>
          )}
        </div>
      )}

      {/* Liste des recommandations */}
      <div className="space-y-3">
        <AnimatePresence>
          {topRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-4 transition-all duration-200 hover:shadow-md ${
                !recommendation.is_viewed ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
              }`}>
                <div className="flex items-start space-x-3">
                  {/* Icône */}
                  <div className={`flex-shrink-0 p-2 rounded-full ${getRecommendationColor(recommendation.type)}`}>
                    {getRecommendationIcon(recommendation.type)}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            Tâche #{recommendation.task_id}
                          </h4>
                          <Badge variant={getPriorityColor(recommendation.priority)} size="sm">
                            {recommendation.priority}
                          </Badge>
                          <Badge variant="secondary" size="sm">
                            {Math.round(recommendation.score)}% match
                          </Badge>
                          {!recommendation.is_viewed && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{recommendation.reason}</p>
                        
                        {/* Barre de compatibilité */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Compatibilité</span>
                            <span>{Math.round(recommendation.score)}%</span>
                          </div>
                          <ProgressBar 
                            value={recommendation.score} 
                            max={100} 
                            className="h-2"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(recommendation.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Zap className="h-3 w-3 mr-1" />
                            Expire {new Date(recommendation.expires_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleViewTask(recommendation.task_id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                        
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleAcceptRecommendation(recommendation)}
                            disabled={recommendation.is_accepted}
                            className="flex-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="error"
                            onClick={() => handleDismissRecommendation(recommendation)}
                            disabled={recommendation.is_dismissed}
                            className="flex-1"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer avec lien vers le tableau de bord */}
      {recommendations.length > 0 && (
        <div className="text-center pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => navigate('/matching')}
            className="text-blue-600 hover:text-blue-700"
          >
            Voir toutes les recommandations
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Modale de recommandation */}
      <AnimatePresence>
        {selectedRecommendation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedRecommendation(null)}
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
                <button 
                  onClick={() => setSelectedRecommendation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant={getPriorityColor(selectedRecommendation.priority)} size="sm">
                    {selectedRecommendation.priority}
                  </Badge>
                  <Badge variant="secondary" size="sm">
                    {Math.round(selectedRecommendation.score)}% compatibilité
                  </Badge>
                </div>
                
                <p className="text-gray-600">{selectedRecommendation.reason}</p>
                
                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="success"
                    onClick={() => handleAcceptRecommendation(selectedRecommendation)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accepter
                  </Button>
                  <Button
                    variant="error"
                    onClick={() => handleDismissRecommendation(selectedRecommendation)}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeRecommendations;
