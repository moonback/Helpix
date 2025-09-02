import React, { useState, useEffect, useMemo, useDeferredValue, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { useMessageStore } from '@/stores/messageStore';
import { useWalletStore } from '@/features/wallet/stores/walletStore';

import { useGeolocation } from '@/hooks/useGeolocation';
import { useReverseGeocoding } from '@/hooks/useReverseGeocoding';
import { useRentableItems } from '@/features/map/hooks/useRentableItems';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import LocationPermissionBanner from '@/components/ui/LocationPermissionBanner';
import DetailedAddressDisplay from '@/components/ui/DetailedAddressDisplay';
import FilterModal from '@/components/ui/FilterModal';
import FilterButton from '@/components/ui/FilterButton';
import FilterBadge from '@/components/ui/FilterBadge';
import TaskCard from './components/TaskCard';
import TaskCardSkeleton from './components/TaskCardSkeleton';
import RentableItemCard from './components/RentableItemCard';
import RentableItemCardSkeleton from './components/RentableItemCardSkeleton';


// Retiré: import CreditSystemInfo from '@/components/ui/CreditSystemInfo';
// Retiré: import { calculateDistance, formatDistance } from '@/lib/utils';
import { 
  Search, 
  Clock, 
  Heart,
  MessageCircle,
  Navigation,
  AlertCircle,
  Users,
  BarChart3,
  Eye,
  Plus,
  Filter,
  SortAsc,
  SortDesc,
  Lightbulb,
  Hand,
  Package
} from 'lucide-react';

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  action: () => void;
}

// Interface locale pour typer les tâches
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


const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, fetchTasks, isLoading, setUserLocation, getTasksByProximity } = useTaskStore();
  const { user, updateUserLocation } = useAuthStore();
  const { createConversation } = useMessageStore();
  const { fetchWallet } = useWalletStore();
  const { latitude, longitude, error: locationError, isLoading: locationLoading, requestLocation } = useGeolocation();
  const { address, getAddressFromCoords, retry } = useReverseGeocoding();
  const { items: rentableItems, loading: rentableItemsLoading, error: rentableItemsError } = useRentableItems();

  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'local' | 'remote'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [sortByProximity, setSortByProximity] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showRentableItems, setShowRentableItems] = useState(true);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const prefersReducedMotion = useReducedMotion();

  const validateTask = (task: Task) => {
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

  const doesTaskMatchFilters = useCallback((task: Task) => {
      if (!validateTask(task)) return false;
    if (task.assigned_to || task.status === 'completed') return false;

    const term = deferredSearchTerm.trim().toLowerCase();
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
  }, [deferredSearchTerm, selectedCategory, selectedPriority]);

  const sortTasks = useCallback((baseTasks: Task[]) => {
    if (sortByProximity && latitude && longitude) {
      const byProximity = getTasksByProximity() as Task[];
      return byProximity.filter(doesTaskMatchFilters);
    }
    return [...baseTasks].sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? db - da : da - db;
    });
  }, [sortByProximity, latitude, longitude, getTasksByProximity, doesTaskMatchFilters, sortOrder]);

  const getFilteredAndSortedTasks = useMemo(() => {
    const base = (tasks as Task[]).filter(doesTaskMatchFilters);
    return sortTasks(base);
  }, [tasks, doesTaskMatchFilters, sortTasks]);


  useEffect(() => {
    fetchTasks();
  }, []);

  // Charger les données du wallet
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
  }, [latitude, longitude, user?.id]);


  const quickActions: QuickAction[] = useMemo(() => ([
    {
      icon: <Plus className="w-6 h-6" />,
      title: 'Créer une tâche',
      description: 'Demander de l\'aide à votre communauté',
      color: 'from-blue-500 to-indigo-600',
      action: () => navigate('/create-task')
    },
    {
      icon: <Hand className="w-6 h-6" />,
      title: 'Offrir mon aide',
      description: 'Découvrir comment aider les autres',
      color: 'from-emerald-500 to-teal-600',
      action: () => {
        setSelectedPriority('urgent');
        setShowQuickActions(false);
      }
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Mes conversations',
      description: 'Gérer vos échanges en cours',
      color: 'from-purple-500 to-violet-600',
      action: () => navigate('/chat')
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Tableau de bord',
      description: 'Suivre votre activité',
      color: 'from-orange-500 to-red-600',
      action: () => navigate('/dashboard')
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: 'Objets à louer',
      description: 'Découvrez les objets disponibles à la location',
      color: 'from-emerald-500 to-green-600',
      action: () => navigate('/rentals')
    }
  ]), [navigate]);

  // Ces constantes sont maintenant dans TaskCard.tsx

  const handleHelp = useCallback(async (taskId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const task = (tasks as Task[]).find(t => t.id === taskId);
      if (!task) {
        console.error('Tâche non trouvée');
        return;
      }

      if (task.user_id === user.id) {
        console.log('Vous ne pouvez pas vous aider vous-même');
        return;
      }

      // Naviguer vers la page d'offres d'aide
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
      if (!task) {
        console.error('Tâche non trouvée');
        return;
      }

      if (task.user_id === user.id) {
        console.log('Vous ne pouvez pas vous contacter vous-même');
        return;
      }

      await createConversation([user.id, task.user_id]);
      navigate('/chat');
      
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
    }
  }, [user, navigate, tasks, createConversation]);

  const handleEdit = useCallback((taskId: number) => {
    navigate(`/edit-task/${taskId}`);
  }, [navigate]);

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
    // TODO: Implémenter la création de conversation pour les objets louables
    console.log('Contacter le propriétaire de l\'objet:', itemId);
  }, [user, navigate]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  // Handler pour la saisie manuelle d'adresse
  const handleManualLocation = useCallback(async (address: string) => {
    try {
      // TODO: Implémenter la géolocalisation manuelle avec un service de géocodage
      console.log('Géolocalisation manuelle pour:', address);
      // Pour l'instant, on ne fait rien - à implémenter avec un service de géocodage
    } catch (error) {
      console.error('Erreur lors de la géolocalisation manuelle:', error);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
        >
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
              <Users className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-ping opacity-20"></div>
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full animate-pulse opacity-10"></div>
          </div>
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.3, duration: prefersReducedMotion ? 0 : 0.6 }}
          >
            <h2 className="text-3xl font-bold text-slate-700 mb-3">Chargement en cours...</h2>
            <p className="text-slate-500 text-lg">Préparation de votre expérience d'entraide</p>
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Welcome Section at Top - Full Width */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b border-slate-200/50 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.1, duration: prefersReducedMotion ? 0 : 0.6 }}
            className="w-full"
          >
            {/* Header simplifié avec logo à gauche, texte au centre, localisation et boutons à droite */}
            <div className="flex items-center justify-between gap-4">
              {/* Logo à gauche */}
              <div className="flex-shrink-0">
                <img 
                  src="/images/logo.png" 
                  alt="Logo Entraide Universelle" 
                  className="w-25 h-12 object-contain"
                />
              </div>
              
              {/* Message de bienvenue au centre */}
              <div className="text-center flex-1">
                <h1 className="text-xl lg:text-2xl font-bold text-slate-800">
                  Bonjour Maysson !
                  </h1>
                
              </div>

              {/* Localisation et boutons à droite */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Status de localisation */}
                <div className="flex items-center">
                  {locationLoading ? (
                    <div className="flex items-center space-x-1.5 text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border text-xs">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      <span className="font-medium hidden sm:inline">Localisation...</span>
                    </div>
                  ) : latitude && longitude ? (
                    <div className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-xs">
                      <div className="relative">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-40"></div>
                      </div>
                      <DetailedAddressDisplay
                        address={address}
                        isLoading={!address}
                        error={null}
                        showIcon={false}
                        className="text-emerald-700 font-medium truncate max-w-[120px] lg:max-w-[180px]"
                        onRetry={retry}
                      />
                    </div>
                  ) : locationError ? (
                    <div className="flex items-center space-x-1.5 text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      <span className="font-medium hidden sm:inline">Erreur</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border text-xs">
                      <Navigation className="w-3 h-3" />
                      <span className="font-medium hidden sm:inline">Non localisé</span>
                    </div>
                  )}
                </div>

                {/* Boutons d'action */}
                <div className="flex items-center gap-1.5">
                  <Button
                    onClick={() => navigate('/create-task')}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                    aria-label="Créer une tâche"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden lg:inline">Créer</span>
                    <span className="lg:hidden">+</span>
                  </Button>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    size="sm"
                    className="border-slate-300 hover:border-blue-500 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm"
                    aria-label="Ouvrir le tableau de bord"
                  >
                    <BarChart3 className="w-4 h-4 lg:mr-1" />
                    <span className="hidden lg:inline">Stats</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Respecte prefers-reduced-motion: pas d'éléments animés si activé */}
          {!prefersReducedMotion && (
            <>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </>
          )}
        </div>
        
        <div className="relative px-6 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 1, ease: "easeOut" }}
              className="text-center"
            >
              <motion.div
                initial={prefersReducedMotion ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.2, duration: prefersReducedMotion ? 0 : 0.8, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-8 backdrop-blur-sm border border-white/30"
              >
                <Heart className="w-10 h-10" />
              </motion.div>
              
              <motion.h1 
                className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.4, duration: prefersReducedMotion ? 0 : 0.8 }}
              >
                  Entraide Universelle
              </motion.h1>
              
              <motion.p 
                className="text-xl lg:text-2xl text-blue-100 mb-10 max-w-4xl mx-auto leading-relaxed"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.6, duration: prefersReducedMotion ? 0 : 0.8 }}
              >
                Une communauté bienveillante où chacun peut donner et recevoir de l'aide. 
                <span className="block mt-2 text-lg">Connectez-vous localement, agissez globalement.</span>
              </motion.p>
              
              

              {/* CTA Buttons */}
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 1.2, duration: prefersReducedMotion ? 0 : 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  onClick={() => navigate('/create-task')}
                  className="text-indigo-600 hover:bg-gray-50 px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  aria-label="Créer ma première tâche"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Créer ma première tâche
                </Button>
                
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-8">
        <div className="max-w-12xl mx-auto">



          {/* Quick Actions Section */}
          <AnimatePresence>
            {showQuickActions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                      <Lightbulb className="w-6 h-6 text-yellow-500" />
                      Actions rapides
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQuickActions(false)}
                      className="text-slate-500 hover:text-slate-700"
                      aria-label="Masquer les actions rapides"
                    >
                      Masquer
                    </Button>
                  </div>
                  <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-2 -mx-2 px-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:snap-none">
                    {quickActions.map((action, index) => (
                      <motion.div
                        key={action.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        onClick={action.action}
                        className="group cursor-pointer min-w-[240px] snap-start lg:min-w-0"
                      >
                        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl border border-slate-200 hover:border-transparent hover:scale-105 transition-all duration-300">
                          <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform duration-300`}>
                            {action.icon}
                          </div>
                          <h4 className="font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                            {action.title}
                          </h4>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            {action.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
                  <Input
                    placeholder="Rechercher par titre, description, compétences, tags, ou localisation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-14 py-4 text-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-2xl shadow-sm"
                    aria-label="Champ de recherche des tâches"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label="Effacer la recherche"
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <FilterButton
                  onClick={() => setIsFilterModalOpen(true)}
                  activeFiltersCount={
                    (selectedCategory !== 'all' ? 1 : 0) + 
                    (selectedPriority !== 'all' ? 1 : 0)
                  }
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                />
                
                <Button
                  variant="outline"
                  onClick={toggleSortOrder}
                  className="px-4 py-3 rounded-2xl border-slate-200 hover:border-blue-500 hover:text-blue-600"
                >
                  {sortOrder === 'desc' ? <SortDesc className="w-5 h-5" /> : <SortAsc className="w-5 h-5" />}
                </Button>
                
                <div className="flex bg-slate-100 rounded-2xl p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-xl transition-all ${
                      viewMode === 'list' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Liste
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-xl transition-all ${
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
            <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-4 mb-6 border border-slate-200">
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
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 mb-6"
                >
                  <div className="flex items-center justify-between mb-4">
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
                  <div className="flex flex-wrap gap-3">
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
                className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                    <Navigation className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-emerald-800">Trier par proximité</span>
                    <p className="text-sm text-emerald-600">Prioriser les tâches près de votre position</p>
                  </div>
                </div>
                <button
                  onClick={() => setSortByProximity(!sortByProximity)}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 ${
                    sortByProximity ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg' : 'bg-slate-300'
                  }`}
                  aria-label="Basculer le tri par proximité"
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                      sortByProximity ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Message informatif sur les tâches disponibles */}
          

          {/* Enhanced Tasks List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
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
              <Card className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-9xl mb-8">🤝</div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-4">
                    Aucune tâche trouvée
                  </h3>
                  <p className="text-slate-600 text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                    {searchTerm || selectedCategory !== 'all' || selectedPriority !== 'all'
                      ? 'Aucune tâche ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                      : 'Soyez le premier à créer une tâche et inspirez votre communauté à s\'entraider !'
                    }
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => navigate('/create-task')}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
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
                        className="px-8 py-4 rounded-2xl border-slate-300 hover:border-blue-500 hover:text-blue-600"
                      >
                        <Filter className="w-5 h-5 mr-2" />
                        Effacer les filtres
                      </Button>
                    )}
                  </div>
                </motion.div>
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
                    onEdit={handleEdit}
                    onHelp={handleHelp}
                    onRequest={handleRequest}
                    onNavigate={navigate}
                    prefersReducedMotion={prefersReducedMotion || false}
                    index={index}
                  />
                ))}
                            </div>
            )}
          </motion.div>

          {/* Load More Button (if needed) */}
          {getFilteredAndSortedTasks.length > 10 && (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: prefersReducedMotion ? 0 : 1, duration: prefersReducedMotion ? 0 : 0.5 }}
              className="text-center mt-12"
            >
                            <Button
                variant="outline"
                className="px-8 py-4 rounded-2xl border-slate-300 hover:border-blue-500 hover:text-blue-600 text-lg"
                aria-label="Voir plus de tâches"
              >
                <Eye className="w-5 h-5 mr-2" />
                Voir plus de tâches
                            </Button>
            </motion.div>
                          )}
                        </div>
                      </div>

      {/* Rentable Items Section */}
      <div className="relative z-10 px-6 py-8">
        <div className="max-w-12xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                  Objets à louer
                </h2>
                <p className="text-slate-600 text-lg">
                  Découvrez les objets disponibles à la location près de chez vous
                </p>
                            </div>
              <Button
                variant="outline"
                onClick={() => setShowRentableItems(!showRentableItems)}
                className="px-6 py-3 rounded-2xl border-slate-300 hover:border-emerald-500 hover:text-emerald-600"
                aria-label={showRentableItems ? "Masquer les objets louables" : "Afficher les objets louables"}
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
                    <Card className="text-center py-12 bg-red-50 border border-red-200 rounded-3xl">
                      <div className="text-red-600 mb-4">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Erreur de chargement</h3>
                        <p className="text-red-500">{rentableItemsError}</p>
                        </div>
                    </Card>
                  ) : rentableItems.length === 0 ? (
                    <Card className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
                      <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
                      >
                        <div className="text-9xl mb-8">📦</div>
                        <h3 className="text-3xl font-bold text-slate-800 mb-4">
                          Aucun objet à louer
                        </h3>
                        <p className="text-slate-600 text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                          Aucun objet n'est actuellement disponible à la location. Soyez le premier à proposer un objet !
                        </p>
                        
                              <Button
                          onClick={() => navigate('/rentals/create')}
                          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                              >
                          <Plus className="w-5 h-5 mr-2" />
                          Proposer un objet
                              </Button>
                  </motion.div>
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
                          prefersReducedMotion={prefersReducedMotion || false}
                          index={index}
                        />
                ))}
              </div>
            )}

                  {rentableItems.length > 8 && (
            <motion.div
                      initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
                      transition={{ delay: prefersReducedMotion ? 0 : 1, duration: prefersReducedMotion ? 0 : 0.5 }}
              className="text-center mt-12"
            >
              <Button
                variant="outline"
                        onClick={() => navigate('/rentals')}
                        className="px-8 py-4 rounded-2xl border-slate-300 hover:border-emerald-500 hover:text-emerald-600 text-lg"
                        aria-label="Voir tous les objets louables"
              >
                <Eye className="w-5 h-5 mr-2" />
                        Voir tous les objets ({rentableItems.length})
              </Button>
            </motion.div>
          )}
                </motion.div>
              )}
            </AnimatePresence>
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

      {/* Enhanced Location Permission Banner */}
      <div className="px-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <LocationPermissionBanner
            hasPermission={!!(latitude && longitude)}
            isLoading={locationLoading}
            error={locationError}
            onRequestLocation={requestLocation}
            onSetManualLocation={handleManualLocation}
          />
        </motion.div>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5, type: "spring", stiffness: 200 }}
        >
          <Button
            onClick={() => navigate('/create-task')}
            className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </motion.div>
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