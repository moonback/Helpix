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
  AlertCircle,
  Users,
  MapPin,
  Star,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, fetchTasks, isLoading, setUserLocation, getTasksByProximity } = useTaskStore();
  const { user, updateUserLocation } = useAuthStore();
  const { createConversation } = useMessageStore();
  const { latitude, longitude, error: locationError, isLoading: locationLoading, requestLocation } = useGeolocation();
  const { address, getAddressFromCoords, retry } = useReverseGeocoding();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'local' | 'remote'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [sortByProximity, setSortByProximity] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      setUserLocation(latitude, longitude);
      if (user) {
        updateUserLocation(latitude, longitude);
      }
      getAddressFromCoords(latitude, longitude);
    }
  }, [latitude, longitude, user?.id]);

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

  const getFilteredAndSortedTasks = () => {
    let filteredTasks = tasks.filter(task => {
      if (!validateTask(task)) return false;
      
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      
      return matchesSearch && matchesCategory && matchesPriority;
    });

    if (sortByProximity && latitude && longitude) {
      filteredTasks = getTasksByProximity().filter(task => {
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
    low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
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
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error('Tâche non trouvée');
        return;
      }

      if (task.user_id === user.id) {
        console.log('Vous ne pouvez pas vous aider vous-même');
        return;
      }

      console.log('Offrir de l\'aide pour la tâche:', taskId);
      await createConversation([user.id, task.user_id]);
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
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error('Tâche non trouvée');
        return;
      }

      if (task.user_id === user.id) {
        console.log('Vous ne pouvez pas vous contacter vous-même');
        return;
      }

      console.log('Création d\'une conversation avec le propriétaire de la tâche:', taskId);
      await createConversation([user.id, task.user_id]);
      navigate('/chat');
      
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
    }
  };

  const handleEdit = (taskId: number) => {
    console.log('Modifier la tâche:', taskId);
    navigate(`/edit-task/${taskId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="animate-pulse">
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Chargement en cours...</h2>
            <p className="text-slate-500">Préparation de votre expérience d'entraide</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-6 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                <Heart className="w-8 h-8" />
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Entraide Universelle
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                Connectez-vous avec votre communauté locale. Donnez et recevez de l'aide en toute simplicité.
              </p>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-3xl font-bold mb-2">{tasks.length}</div>
                  <div className="text-blue-100">Demandes actives</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-3xl font-bold mb-2">24/7</div>
                  <div className="text-blue-100">Disponible</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-3xl font-bold mb-2">100%</div>
                  <div className="text-blue-100">Gratuit</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.71,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                  Bonjour {user?.name || 'Utilisateur'} ! 👋
                </h2>
                <p className="text-slate-600 text-lg">
                  Découvrez les opportunités d'entraide autour de vous
                </p>
              </div>
              <div className="hidden lg:flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-500">En ligne</span>
              </div>
            </div>

            {/* Location Status */}
            <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center space-x-3">
                {locationLoading ? (
                  <div className="flex items-center space-x-2 text-slate-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span>Localisation en cours...</span>
                  </div>
                ) : latitude && longitude ? (
                  <div className="flex items-center space-x-2 text-green-700">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <Navigation className="w-5 h-5" />
                    <span className="font-medium">Localisé</span>
                    <span className="text-slate-500">•</span>
                    <DetailedAddressDisplay
                      address={address}
                      isLoading={!address}
                      error={null}
                      showIcon={false}
                      className="text-slate-600"
                      onRetry={retry}
                    />
                  </div>
                ) : locationError ? (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
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
                  <div className="flex items-center space-x-2 text-slate-500">
                    <Navigation className="w-5 h-5" />
                    <span>Localisation non disponible</span>
                  </div>
                )}
              </div>
              
              {latitude && longitude && (
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Shield className="w-4 h-4" />
                  <span>Données sécurisées</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Rechercher une tâche, une compétence ou une localisation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 py-3 text-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-2xl"
                  />
                </div>
              </div>
              <FilterButton
                onClick={() => setIsFilterModalOpen(true)}
                activeFiltersCount={
                  (selectedCategory !== 'all' ? 1 : 0) + 
                  (selectedPriority !== 'all' ? 1 : 0)
                }
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              />
            </div>

            {/* Active Filters */}
            {(selectedCategory !== 'all' || selectedPriority !== 'all') && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-blue-800">Filtres actifs :</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedPriority('all');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100"
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
              <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center space-x-3">
                  <Navigation className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="text-sm font-semibold text-slate-700">Trier par proximité</span>
                    <p className="text-xs text-slate-500">Prioriser les tâches près de chez vous</p>
                  </div>
                </div>
                <button
                  onClick={() => setSortByProximity(!sortByProximity)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${
                    sortByProximity ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                      sortByProximity ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )}
          </motion.div>

          {/* Tasks List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="space-y-6"
          >
            {filteredTasks.length === 0 ? (
              <Card className="text-center py-16 bg-white rounded-3xl shadow-xl border border-slate-200">
                <div className="text-8xl mb-6">🤝</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  Aucune tâche trouvée
                </h3>
                <p className="text-slate-600 text-lg mb-6">
                  {searchTerm || selectedCategory !== 'all' || selectedPriority !== 'all'
                    ? 'Essayez de modifier vos filtres de recherche'
                    : 'Soyez le premier à créer une tâche et inspirez votre communauté !'
                  }
                </p>
                <Button
                  onClick={() => navigate('/create-task')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Créer ma première tâche
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 + index * 0.1, duration: 0.6 }}
                  >
                    <Card className="p-6 bg-white rounded-3xl shadow-xl border border-slate-200 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:scale-[1.02]">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                            <span className="text-2xl">{categoryIcons[task.category]}</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-1 line-clamp-2">
                              {task.title}
                            </h3>
                            <div className="flex items-center space-x-3">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                                {priorityIcons[task.priority]} {task.priority}
                              </span>
                              <span className="text-sm text-slate-500">
                                {task.category === 'local' ? '📍 Sur place' : '💻 À distance'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(task.id)}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-slate-600 mb-6 line-clamp-3 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>{task.estimated_duration}h</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span>{task.budget_credits} crédits</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-red-600" />
                          <span className="truncate">{task.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Tag className="w-4 h-4 text-purple-600" />
                          <span>{task.tags.length} tags</span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Compétences requises :</h4>
                        <div className="flex flex-wrap gap-2">
                          {task.required_skills.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200"
                            >
                              <Target className="w-3 h-3 mr-1" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {task.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <div className="flex items-center space-x-3">
                          <Button
                            onClick={() => handleHelp(task.id)}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            Offrir de l'aide
                          </Button>
                          <Button
                            onClick={() => handleRequest(task.id)}
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-2xl"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contacter
                          </Button>
                        </div>
                        
                        <div className="text-right text-sm text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>Créée le {new Date(task.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
      />

      {/* Location Permission Banner */}
      <div className="px-6 pb-6">
        <LocationPermissionBanner
          hasPermission={!!(latitude && longitude)}
          isLoading={locationLoading}
          error={locationError}
          onRequestLocation={requestLocation}
        />
      </div>
    </div>
  );
};

export default HomePage;
