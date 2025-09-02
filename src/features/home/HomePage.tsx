import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { useMessageStore } from '@/stores/messageStore';
import { useWalletStore } from '@/features/wallet/stores/walletStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useReverseGeocoding } from '@/hooks/useReverseGeocoding';
import { useRentableItems } from '@/features/map/hooks/useRentableItems';

// Components
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import HomeHeader from '@/components/layout/HomeHeader';
import TaskCard from './components/TaskCard';
import TaskCardSkeleton from './components/TaskCardSkeleton';
import RentableItemCard from './components/RentableItemCard';
import RentableItemCardSkeleton from './components/RentableItemCardSkeleton';
import LocationPermissionBanner from '@/components/ui/LocationPermissionBanner';
import FilterModal from '@/components/ui/FilterModal';
import FilterButton from '@/components/ui/FilterButton';
import FilterBadge from '@/components/ui/FilterBadge';


// Icons
import { 
  Search, 
  Plus, 
  Users, 
  Clock,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  AlertCircle,
  Navigation,
  BarChart3,
  MessageCircle,
  Hand,
  Lightbulb,
  Heart,
  MapPin
} from 'lucide-react';

// Types
interface Task {
  id: number;
  title: string;
  description: string;
  category: 'local' | 'remote';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location: string;
  required_skills: string[];
  tags: string[];
  estimated_duration: number;
  budget_credits: number;
  created_at: string;
  user_id: string;
  assigned_to?: string | null;
  status?: string;
  latitude?: number;
  longitude?: number;
}

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  action: () => void;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Stores
  const { tasks, fetchTasks, isLoading, setUserLocation, getTasksByProximity } = useTaskStore();
  const { user, updateUserLocation } = useAuthStore();
  const { createConversation } = useMessageStore();
  const { wallet, fetchWallet } = useWalletStore();
  
  // Hooks
  const { latitude, longitude, requestLocation } = useGeolocation();
  const { getAddressFromCoords } = useReverseGeocoding();
  const { items: rentableItems, loading: rentableItemsLoading, error: rentableItemsError } = useRentableItems();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'local' | 'remote'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [sortByProximity, setSortByProximity] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showRentableItems, setShowRentableItems] = useState(true);

  // Quick Actions
  const quickActions: QuickAction[] = useMemo(() => [
    {
      icon: <Plus className="w-5 h-5" />,
      title: 'Créer une tâche',
      description: 'Demander de l\'aide à votre communauté',
      color: 'from-blue-500 to-indigo-600',
      action: () => navigate('/create-task')
    },
    {
      icon: <Hand className="w-5 h-5" />,
      title: 'Offrir mon aide',
      description: 'Découvrir comment aider les autres',
      color: 'from-emerald-500 to-teal-600',
      action: () => {
        setSelectedPriority('urgent');
        setShowQuickActions(false);
      }
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: 'Mes conversations',
      description: 'Gérer vos échanges en cours',
      color: 'from-purple-500 to-violet-600',
      action: () => navigate('/chat')
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Tableau de bord',
      description: 'Suivre votre activité',
      color: 'from-orange-500 to-red-600',
      action: () => navigate('/dashboard')
    }
  ], [navigate]);

  // Task filtering and sorting
  const validateTask = useCallback((task: Task) => {
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
  }, []);

  const doesTaskMatchFilters = useCallback((task: Task) => {
    if (!validateTask(task)) return false;
    if (task.assigned_to || task.status === 'completed') return false;

    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || (
      task.title.toLowerCase().includes(term) ||
      task.description.toLowerCase().includes(term) ||
      task.location.toLowerCase().includes(term) ||
      task.tags.some(t => t.toLowerCase().includes(term)) ||
      task.required_skills.some(s => s.toLowerCase().includes(term))
    );
      
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      
    return matchesSearch && matchesCategory && matchesPriority;
  }, [searchTerm, selectedCategory, selectedPriority, validateTask]);

  const getFilteredAndSortedTasks = useMemo(() => {
    const base = (tasks as Task[]).filter(doesTaskMatchFilters);
    
    if (sortByProximity && latitude && longitude) {
      const byProximity = getTasksByProximity() as Task[];
      return byProximity.filter(doesTaskMatchFilters);
    }
    
    return [...base].sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? db - da : da - db;
    });
  }, [tasks, doesTaskMatchFilters, sortByProximity, latitude, longitude, getTasksByProximity, sortOrder]);

  // Tâches actives de l'utilisateur connecté
  const currentTasks = useMemo(() => {
    if (!user) return [];
    return (tasks as Task[]).filter(task => 
      task.user_id === user.id && 
      (task.status === 'open' || task.status === 'in_progress')
    );
  }, [tasks, user]);

  // Handlers
  const handleHelp = useCallback(async (taskId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const task = (tasks as Task[]).find(t => t.id === taskId);
      if (!task || task.user_id === user.id) return;

      navigate(`/task/${taskId}/offers`);
    } catch (error) {
      console.error('Erreur lors de la navigation vers les offres:', error);
    }
  }, [user, navigate, tasks]);

  const handleRequest = useCallback(async (taskId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const task = (tasks as Task[]).find(t => t.id === taskId);
      if (!task || task.user_id === user.id) return;

      await createConversation([user.id, task.user_id]);
      navigate('/chat');
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
    }
  }, [user, navigate, tasks, createConversation]);

  const handleViewTask = useCallback((taskId: number) => {
    navigate(`/task/${taskId}`);
  }, [navigate]);

  const handleViewItem = useCallback((itemId: number) => {
    navigate(`/rentals/${itemId}`);
  }, [navigate]);

  const handleRentItem = useCallback((itemId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/rentals/${itemId}/rent`);
  }, [user, navigate]);

  const handleContactItem = useCallback((itemId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    console.log('Contacter le propriétaire de l\'objet:', itemId);
  }, [user, navigate]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  const handleManualLocation = useCallback(async (address: string) => {
    try {
      console.log('Géolocalisation manuelle pour:', address);
    } catch (error) {
      console.error('Erreur lors de la géolocalisation manuelle:', error);
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (user) {
      fetchWallet();
    }
  }, [user, fetchWallet]);

  useEffect(() => {
    if (latitude && longitude) {
      setUserLocation(latitude, longitude);
      if (user) {
        updateUserLocation(latitude, longitude);
      }
      getAddressFromCoords(latitude, longitude);
    }
  }, [latitude, longitude, user?.id, setUserLocation, updateUserLocation, getAddressFromCoords]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto  rounded-full flex items-center justify-center shadow-2xl p-2">
              <img 
                src="/assets/logo.png" 
                alt="Helpix Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-ping opacity-20"></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-700 mb-3">Chargement en cours...</h2>
          <p className="text-slate-500">Préparation de votre expérience d'entraide</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <HomeHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center"
          >
            

            {/* Titre principal avec effet de dégradé et animation */}
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {user ? (
                <>
                  <span className="block bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                    Bonjour {user?.display_name || user?.email?.split('@')[0]}
                  </span>
                  <span className="block bg-gradient-to-r from-blue-100 via-white to-purple-100 bg-clip-text text-transparent">
                    Prêt à aider aujourd'hui ?
                  </span>
                </>
              ) : (
                <>
                  <span className="block bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                    L'entraide
                  </span>
                  <span className="block bg-gradient-to-r from-blue-100 via-white to-purple-100 bg-clip-text text-transparent">
                    près de chez vous
                  </span>
                </>
              )}
            </motion.h1>

            {/* Sous-titre avec icônes animées */}
            <motion.div
              className="flex items-center justify-center gap-3 mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.div
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Users className="w-4 h-4 text-white" />
              </motion.div>
              <span className="text-xl lg:text-2xl font-medium text-blue-100">
                {user ? "Votre communauté vous attend" : "Rejoignez une communauté bienveillante"}
              </span>
              <motion.div
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              >
                <Heart className="w-4 h-4 text-white" />
              </motion.div>
            </motion.div>
            
            <motion.p 
              className="text-lg lg:text-xl text-blue-100/90 mb-10 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {user ? (
                <>
                  Découvrez les demandes d'aide autour de vous ou proposez vos services à la communauté. 
                  Ensemble, créons des liens authentiques et solidaires dans votre quartier.
                  <span className="block mt-3 text-blue-200/80 text-base">
                    🎯 Votre impact : {wallet?.total_earned || 0} crédits gagnés • 🏆 Membre actif • ⚡ Réponses instantanées
                  </span>
                </>
              ) : (
                <>
                  Donnez et recevez de l'aide dans votre quartier. Une plateforme qui connecte 
                  les voisins pour créer des liens authentiques et solidaires.
                  <span className="block mt-3 text-blue-200/80 text-base">
                    🌟 Plus de 500 membres actifs • 📍 Géolocalisation précise • ⚡ Réponses rapides
                  </span>
                </>
              )}
            </motion.p>
            
            {/* Boutons d'action améliorés */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                onClick={() => navigate('/create-task')}
                className="group  text-indigo-600 hover:bg-blue-50 px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 min-w-[240px] relative overflow-hidden"
              >
                <div className="absolute inset-0  opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center">
                  <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  {user ? "Créer une nouvelle tâche" : "Créer ma première tâche"}
                </span>
              </Button>
              
              <Button
                onClick={() => navigate('/map')}
                variant="secondary"
                className="group bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 hover:border-white/50 px-8 py-4 rounded-2xl font-semibold text-lg backdrop-blur-sm transform hover:scale-105 transition-all duration-300 min-w-[240px]"
              >
                <span className="flex items-center justify-center">
                  <MapPin className="w-5 h-5 mr-2 group-hover:bounce" />
                  {user ? "Voir les demandes près de moi" : "Explorer les demandes"}
                </span>
              </Button>
            </motion.div>

            {/* Statistiques visuelles */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-12 pt-8 border-t border-white/20"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
                {user ? (
                  <>
                    <div className="text-center">
                      <div className="text-3xl lg:text-4xl font-bold text-white mb-2">{wallet?.total_earned || 0}</div>
                      <div className="text-blue-200 text-sm font-medium">Crédits gagnés</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl lg:text-4xl font-bold text-white mb-2">⭐</div>
                      <div className="text-blue-200 text-sm font-medium">Membre de confiance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl lg:text-4xl font-bold text-white mb-2">{currentTasks?.length || 0}</div>
                      <div className="text-blue-200 text-sm font-medium">Tâches actives</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="text-3xl lg:text-4xl font-bold text-white mb-2">500+</div>
                      <div className="text-blue-200 text-sm font-medium">Tâches accomplies</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl lg:text-4xl font-bold text-white mb-2">4.9★</div>
                      <div className="text-blue-200 text-sm font-medium">Note moyenne</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl lg:text-4xl font-bold text-white mb-2">24h</div>
                      <div className="text-blue-200 text-sm font-medium">Temps de réponse</div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <AnimatePresence>
          {showQuickActions && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Actions rapides
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuickActions(false)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    Masquer
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      onClick={action.action}
                      className="group cursor-pointer"
                    >
                      <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-slate-200 hover:border-transparent hover:scale-105 transition-all duration-300">
                        <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-3 text-white group-hover:scale-110 transition-transform duration-300`}>
                          {action.icon}
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Search and Filters */}
        <section className="mb-8">
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Rechercher par titre, description, compétences, tags, ou localisation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <FilterButton
                  onClick={() => setIsFilterModalOpen(true)}
                  activeFiltersCount={
                    (selectedCategory !== 'all' ? 1 : 0) + 
                    (selectedPriority !== 'all' ? 1 : 0)
                  }
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0"
                />
                
                <Button
                  variant="outline"
                  onClick={toggleSortOrder}
                  className="border-slate-200 hover:border-blue-500 hover:text-blue-600"
                >
                  {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                </Button>
                
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded-md transition-all text-sm ${
                      viewMode === 'list' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Liste
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 rounded-md transition-all text-sm ${
                      viewMode === 'grid' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Grille
                  </button>
                </div>
              </div>
            </div>

            {/* Search Results Info */}
            <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-4 mb-4 border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">{getFilteredAndSortedTasks.length}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">
                    {getFilteredAndSortedTasks.length} tâche{getFilteredAndSortedTasks.length !== 1 ? 's' : ''} trouvée{getFilteredAndSortedTasks.length !== 1 ? 's' : ''}
                  </span>
                  {searchTerm && (
                    <span className="text-slate-500 text-sm ml-2">
                      pour "{searchTerm}"
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center text-sm text-slate-500">
                <Clock className="w-4 h-4 mr-1" />
                Mis à jour il y a quelques instants
              </div>
            </div>

            {/* Active Filters */}
            <AnimatePresence>
              {(selectedCategory !== 'all' || selectedPriority !== 'all') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 mb-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filtres actifs
                    </h4>
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
                        icon={selectedPriority === 'urgent' ? '🔴' : selectedPriority === 'high' ? '🟠' : selectedPriority === 'medium' ? '🟡' : '🟢'}
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Proximity Toggle */}
            {latitude && longitude && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-800">Trier par proximité</span>
                    <p className="text-sm text-emerald-600">Prioriser les tâches près de votre position</p>
                  </div>
                </div>
                <button
                  onClick={() => setSortByProximity(!sortByProximity)}
                  className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 ${
                    sortByProximity ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                      sortByProximity ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </motion.div>
            )}
          </Card>
        </section>

        {/* Tasks List */}
        <section className="mb-8">
          {isLoading ? (
            <div className={`grid gap-4 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <TaskCardSkeleton key={i} viewMode={viewMode} />
              ))}
            </div>
          ) : getFilteredAndSortedTasks.length === 0 ? (
            <Card className="text-center py-16">
              <div className="text-6xl mb-6">🤝</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Aucune tâche trouvée
              </h3>
              <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto">
                {searchTerm || selectedCategory !== 'all' || selectedPriority !== 'all'
                  ? 'Aucune tâche ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                  : 'Soyez le premier à créer une tâche et inspirez votre communauté à s\'entraider !'
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/create-task')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Créer ma première tâche
                </Button>
                
                {(searchTerm || selectedCategory !== 'all' || selectedPriority !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedPriority('all');
                    }}
                    variant="outline"
                    className="border-slate-300 hover:border-blue-500 hover:text-blue-600"
                  >
                    <Filter className="w-5 h-5 mr-2" />
                    Effacer les filtres
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className={`grid gap-4 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {getFilteredAndSortedTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  user={user}
                  viewMode={viewMode}
                  latitude={latitude || undefined}
                  longitude={longitude || undefined}
                  onViewTask={handleViewTask}
                  onEdit={() => navigate(`/edit-task/${task.id}`)}
                  onHelp={handleHelp}
                  onRequest={handleRequest}
                  onNavigate={navigate}
                  prefersReducedMotion={false}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {getFilteredAndSortedTasks.length > 10 && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                className="border-slate-300 hover:border-blue-500 hover:text-blue-600"
              >
                <Eye className="w-5 h-5 mr-2" />
                Voir plus de tâches
              </Button>
            </div>
          )}
        </section>

        {/* Rentable Items Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Objets à louer
              </h2>
              <p className="text-slate-600">
                Découvrez les objets disponibles à la location près de chez vous
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowRentableItems(!showRentableItems)}
              className="border-slate-300 hover:border-emerald-500 hover:text-emerald-600"
            >
              {showRentableItems ? 'Masquer' : 'Afficher'}
            </Button>
          </div>

          <AnimatePresence>
            {showRentableItems && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
              >
                {rentableItemsLoading ? (
                  <div className={`grid gap-4 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                      : 'grid-cols-1'
                  }`}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <RentableItemCardSkeleton key={i} viewMode={viewMode} />
                    ))}
                  </div>
                ) : rentableItemsError ? (
                  <Card className="text-center py-12 bg-red-50 border border-red-200">
                    <div className="text-red-600 mb-4">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Erreur de chargement</h3>
                      <p className="text-red-500">{rentableItemsError}</p>
                    </div>
                  </Card>
                ) : rentableItems.length === 0 ? (
                  <Card className="text-center py-16">
                    <div className="text-6xl mb-6">📦</div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">
                      Aucun objet à louer
                    </h3>
                    <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto">
                      Aucun objet n'est actuellement disponible à la location. Soyez le premier à proposer un objet !
                    </p>
                    
                    <Button
                      onClick={() => navigate('/rentals/create')}
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Proposer un objet
                    </Button>
                  </Card>
                ) : (
                  <div className={`grid gap-4 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                      : 'grid-cols-1'
                  }`}>
                    {rentableItems.slice(0, 8).map((item, index) => (
                      <RentableItemCard
                        key={item.id}
                        item={item}
                        user={user}
                        viewMode={viewMode}
                        latitude={latitude || undefined}
                        longitude={longitude || undefined}
                        onViewItem={handleViewItem}
                        onRent={handleRentItem}
                        onContact={handleContactItem}
                        onNavigate={navigate}
                        prefersReducedMotion={false}
                        index={index}
                      />
                    ))}
                  </div>
                )}

                {rentableItems.length > 8 && (
                  <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/rentals')}
                      className="border-slate-300 hover:border-emerald-500 hover:text-emerald-600"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Voir tous les objets ({rentableItems.length})
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

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
      <div className="px-4 sm:px-6 lg:px-8 pb-6">
        <LocationPermissionBanner
          hasPermission={!!(latitude && longitude)}
          isLoading={false}
          error={null}
          onRequestLocation={requestLocation}
          onSetManualLocation={handleManualLocation}
        />
      </div>

      

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>
    </div>
  );
};

export default HomePage;