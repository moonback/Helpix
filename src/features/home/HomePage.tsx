import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useReverseGeocoding } from '@/hooks/useReverseGeocoding';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import ProximityIndicator from '@/components/ui/ProximityIndicator';
import LocationPermissionBanner from '@/components/ui/LocationPermissionBanner';
import AddressDisplay from '@/components/ui/AddressDisplay';
import DetailedAddressDisplay from '@/components/ui/DetailedAddressDisplay';
import LocationDisplay from '@/components/ui/LocationDisplay';
import { calculateDistance, formatDistance } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  MapPin, 
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
  const { tasks, fetchTasks, isLoading, setUserLocation, getTasksByProximity } = useTaskStore();
  const { user, updateUserLocation } = useAuthStore();
  const { latitude, longitude, error: locationError, isLoading: locationLoading, requestLocation } = useGeolocation();
  const { address, getAddressFromCoords, clearAddress } = useReverseGeocoding();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'local' | 'remote'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [sortByProximity, setSortByProximity] = useState(true);

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

  // Obtenir les tâches filtrées et triées par proximité si activé
  const getFilteredAndSortedTasks = () => {
    let filteredTasks = tasks.filter(task => {
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

  const handleHelp = (taskId: number) => {
    console.log('Offrir de l\'aide pour la tâche:', taskId);
    // TODO: Implémenter la logique d'aide
  };

  const handleRequest = (taskId: number) => {
    console.log('Demander de l\'aide pour la tâche:', taskId);
    // TODO: Implémenter la logique de demande
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
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={Search}
            />
          </div>
          <Button variant="outline" size="sm" className="px-3">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'Toutes', icon: '🔍' },
            { key: 'local', label: 'Sur place', icon: '📍' },
            { key: 'remote', label: 'À distance', icon: '💻' }
          ].map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key as 'all' | 'local' | 'remote')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.key
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <span>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'Toutes', icon: '🔍' },
            { key: 'urgent', label: 'Urgentes', icon: '🔴' },
            { key: 'high', label: 'Élevées', icon: '🟠' },
            { key: 'medium', label: 'Moyennes', icon: '🟡' },
            { key: 'low', label: 'Faibles', icon: '🟢' }
          ].map((priority) => (
            <button
              key={priority.key}
              onClick={() => setSelectedPriority(priority.key as 'all' | 'low' | 'medium' | 'high' | 'urgent')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedPriority === priority.key
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <span>{priority.icon}</span>
              {priority.label}
            </button>
          ))}
        </div>

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
                      {task.user_id.charAt(0).toUpperCase()}
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
                {task.required_skills.length > 0 && (
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

                {task.tags.length > 0 && (
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
                    💬 Demander
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
    </div>
  );
};

export default HomePage;
