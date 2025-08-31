import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { useMessageStore } from '@/stores/messageStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useReverseGeocoding } from '@/hooks/useReverseGeocoding';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import LocationPermissionBanner from '@/components/ui/LocationPermissionBanner';
import DetailedAddressDisplay from '@/components/ui/DetailedAddressDisplay';
import LocationDisplay from '@/components/ui/LocationDisplay';
import FilterModal from '@/components/ui/FilterModal';
import FilterButton from '@/components/ui/FilterButton';
import FilterBadge from '@/components/ui/FilterBadge';
import { calculateDistance, formatDistance } from '@/lib/utils';
import { 
  Search, 
  Clock, 
  DollarSign, 
  Target,
  Tag,
  AlertTriangle,
  Heart,
  MessageCircle,
  Share2,
  Navigation,
  AlertCircle
} from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, fetchTasks, isLoading, setUserLocation, getTasksByProximity } = useTaskStore();
  const { user, updateUserLocation } = useAuthStore();
  const { createConversation } = useMessageStore();
  const { latitude, longitude, error: locationError, isLoading: locationLoading, requestLocation } = useGeolocation();
  const { address, getAddressFromCoords } = useReverseGeocoding();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'local' | 'remote'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [sortByProximity, setSortByProximity] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Mettre à jour la localisation de l'utilisateur quand elle change
  useEffect(() => {
    if (latitude && longitude) {
      setUserLocation(latitude, longitude);
      // Mettre à jour aussi dans la base de données si l'utilisateur est connecté
      if (user) {
        updateUserLocation(latitude, longitude);
      }
      // Récupérer l'adresse correspondante
      getAddressFromCoords(latitude, longitude);
    }
  }, [latitude, longitude, setUserLocation, user, updateUserLocation, getAddressFromCoords]);

  // Validation des tâches pour s'assurer qu'elles ont toutes les propriétés nécessaires
  const validateTask = (task: any) => {
    return task && 
           task.id && 
           task.title && 
           task.description && 
           task.category && 
           task.priority && 
           task.location &&
           task.required_skills &&
           task.tags &&
           task.estimated_duration !== undefined &&
           task.budget_credits !== undefined;
  };

  // Obtenir les tâches filtrées et triées par proximité si activé
  const getFilteredAndSortedTasks = () => {
    let filteredTasks = tasks.filter(task => {
      // Valider d'abord la tâche
      if (!validateTask(task)) return false;
      
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      
      return matchesSearch && matchesCategory && matchesPriority;
    });

    // Trier par proximité si activé et si on a la localisation
    if (sortByProximity && latitude && longitude) {
      filteredTasks = getTasksByProximity().filter(task => {
        // Valider d'abord la tâche
        if (!validateTask(task)) return false;
        
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             task.location.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
        const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
        
        return matchesSearch && matchesCategory && matchesPriority;
      });
    }

    return filteredTasks;
  };

  const filteredTasks = getFilteredAndSortedTasks();

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  const priorityIcons = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    urgent: '🔴'
  };

  const categoryIcons = {
    local: '📍',
    remote: '💻'
  };

  const handleHelp = async (taskId: number) => {
    if (!user) {
      console.log('Utilisateur non connecté');
      return;
    }

    try {
      // Trouver la tâche pour récupérer le propriétaire
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error('Tâche non trouvée');
        return;
      }

      // Vérifier que l'utilisateur n'est pas le propriétaire de la tâche
      if (task.user_id === user.id) {
        console.log('Vous ne pouvez pas vous aider vous-même');
        return;
      }

      console.log('Offrir de l\'aide pour la tâche:', taskId);
      
      // Créer une conversation pour discuter de l'aide
      await createConversation([user.id, task.user_id]);
      
      // Rediriger vers la page de chat
      navigate('/chat');
      
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
    }
  };

  const handleRequest = async (taskId: number) => {
    if (!user) {
      console.log('Utilisateur non connecté');
      return;
    }

    try {
      // Trouver la tâche pour récupérer le propriétaire
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error('Tâche non trouvée');
        return;
      }

      // Vérifier que l'utilisateur n'est pas le propriétaire de la tâche
      if (task.user_id === user.id) {
        console.log('Vous ne pouvez pas vous contacter vous-même');
        return;
      }

      console.log('Création d\'une conversation avec le propriétaire de la tâche:', taskId);
      
      // Créer une nouvelle conversation avec le propriétaire
      await createConversation([user.id, task.user_id]);
      
      // Rediriger vers la page de chat
      navigate('/chat');
      
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
    }
  };

  const handleEdit = (taskId: number) => {
    console.log('Modifier la tâche:', taskId);
    // TODO: Naviguer vers la page de modification
    navigate(`/edit-task/${taskId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 pb-20">
            {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bonjour {user?.name || 'Utilisateur'} ! 👋
          </h1>
          <p className="text-gray-600">
            Découvrez les demandes d'aide autour de vous
          </p>
          

          
          {/* Localisation Status */}
          <div className="mt-3 flex items-center gap-2">
            {locationLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span>Localisation en cours...</span>
              </div>
            ) : latitude && longitude ? (
              <div className="flex items-center gap-2 text-sm bg-green-50 px-3 py-1 rounded-full">
                <Navigation className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Localisé •</span>
                <DetailedAddressDisplay
                  address={address}
                  isLoading={!address}
                  error={null}
                  showIcon={false}
                  className="text-green-600"
                />
              </div>
            ) : locationError ? (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                <AlertCircle className="w-4 h-4" />
                <span>Erreur de localisation</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={requestLocation}
                  className="text-red-600 hover:text-red-700 p-1 h-auto"
                >
                  Réessayer
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Navigation className="w-4 h-4" />
                <span>Localisation non disponible</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Permission Banner */}
      <div className="px-4">
        <LocationPermissionBanner
          hasPermission={!!(latitude && longitude)}
          isLoading={locationLoading}
          error={locationError}
          onRequestLocation={requestLocation}
        />
      </div>

      {/* Search and Filters */}
      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={Search}
            />
          </div>
                      <FilterButton
              onClick={() => setIsFilterModalOpen(true)}
              activeFiltersCount={
                (selectedCategory !== 'all' ? 1 : 0) + 
                (selectedPriority !== 'all' ? 1 : 0)
              }
              className="bg-white hover:bg-gray-50 border-gray-200 hover:border-primary-300 transition-all duration-200"
            />
        </div>

        {/* Active Filters Display */}
        {(selectedCategory !== 'all' || selectedPriority !== 'all') && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Filtres actifs :</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedPriority('all');
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Effacer tout
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCategory !== 'all' && (
                <FilterBadge
                  icon={selectedCategory === 'local' ? '📍' : '💻'}
                  label={selectedCategory === 'local' ? 'Sur place' : 'À distance'}
                  onRemove={() => setSelectedCategory('all')}
                  variant="primary"
                />
              )}
              {selectedPriority !== 'all' && (
                <FilterBadge
                  icon={priorityIcons[selectedPriority]}
                  label={
                    selectedPriority === 'urgent' ? 'Urgentes' : 
                    selectedPriority === 'high' ? 'Élevées' : 
                    selectedPriority === 'medium' ? 'Moyennes' : 'Faibles'
                  }
                  onRemove={() => setSelectedPriority('all')}
                  variant={
                    selectedPriority === 'urgent' ? 'danger' :
                    selectedPriority === 'high' ? 'warning' :
                    selectedPriority === 'medium' ? 'secondary' : 'success'
                  }
                />
              )}
            </div>
          </div>
        )}

        {/* Proximity Toggle */}
        {latitude && longitude && (
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Trier par proximité</span>
            </div>
            <button
              onClick={() => setSortByProximity(!sortByProximity)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                sortByProximity ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  sortByProximity ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="px-4 space-y-4">
        {filteredTasks.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune tâche trouvée
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all' || selectedPriority !== 'all'
                ? 'Essayez de modifier vos filtres'
                : 'Soyez le premier à créer une tâche !'
              }
            </p>
          </Card>
        ) : (
          filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {task.user_id ? task.user_id.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{categoryIcons[task.category]} {task.category === 'local' ? 'Sur place' : 'À distance'}</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                          {priorityIcons[task.priority]} {task.priority}
                        </span>
                        {latitude && longitude && task.latitude && task.longitude && sortByProximity && (
                          <>
                            <span>•</span>
                            <span className="text-primary-600 font-medium">
                              {formatDistance(calculateDistance(latitude, longitude, task.latitude, task.longitude))}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="p-2">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 leading-relaxed">{task.description}</p>

                {/* Task Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{task.estimated_duration}h</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>{task.budget_credits} crédits</span>
                  </div>
                  
                  <LocationDisplay
                    location={task.location}
                    latitude={task.latitude}
                    longitude={task.longitude}
                    userLat={latitude || undefined}
                    userLon={longitude || undefined}
                    showDistance={sortByProximity}
                    className="text-gray-600"
                  />
                  
                  {task.deadline && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Limite: {new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Skills and Tags */}
                {task.required_skills && task.required_skills.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {task.required_skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {task.tags && task.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  {/* Bouton de modification pour le propriétaire de la tâche */}
                  {user && task.user_id === user.id && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(task.id)}
                      className="flex-1"
                    >
                      ✏️ Modifier
                    </Button>
                  )}
                  
                  {/* Boutons d'aide et de demande pour tous les utilisateurs */}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleHelp(task.id)}
                    className="flex-1"
                  >
                    🤝 Aider
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRequest(task.id)}
                    className="flex-1"
                  >
                    💬 Contacter
                  </Button>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span>Créé le {new Date(task.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-3 h-3" />
                    <span>0 commentaires</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedCategory={selectedCategory}
        selectedPriority={selectedPriority}
        onCategoryChange={setSelectedCategory}
        onPriorityChange={setSelectedPriority}
      />
    </div>
  );
};

export default HomePage;
