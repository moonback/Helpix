import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import FilterModal from '@/components/ui/FilterModal';
import FilterButton from '@/components/ui/FilterButton';
import FilterBadge from '@/components/ui/FilterBadge';
import { calculateDistance, formatDistance } from '@/lib/utils';
import { 
  Search, 
  Clock, 
  DollarSign, 
  Target,
  AlertTriangle,
  Heart,
  MessageCircle,
  Navigation,
  AlertCircle,
  Users,
  MapPin,
  TrendingUp,

  BarChart3,
  Eye,
  Edit,
  Plus,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Award,
  Activity,
  UserCheck,
  Globe,
  Sparkles,
  Lightbulb,
  Hand,
  MapPinned,
  Compass
} from 'lucide-react';

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  action: () => void;
}

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

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
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);

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

  const getFilteredAndSortedTasks = useMemo(() => {
    let filteredTasks = tasks.filter(task => {
      if (!validateTask(task)) return false;
      
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           task.required_skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      
      return matchesSearch && matchesCategory && matchesPriority;
    });

    // Sort tasks
    if (sortByProximity && latitude && longitude) {
      filteredTasks = getTasksByProximity().filter(task => {
        if (!validateTask(task)) return false;
        
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             task.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                             task.required_skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
        const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
        
        return matchesSearch && matchesCategory && matchesPriority;
      });
    } else {
      // Sort by date if not sorting by proximity
      filteredTasks.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
    }

    return filteredTasks;
  }, [tasks, searchTerm, selectedCategory, selectedPriority, sortByProximity, sortOrder, latitude, longitude]);

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Demandes actives',
      value: tasks.length,
      icon: <Activity className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      trend: '+12%'
    },
    {
      title: 'Près de vous',
      value: latitude && longitude ? getTasksByProximity().slice(0, 10).length : 0,
      icon: <MapPinned className="w-6 h-6" />,
      color: 'from-emerald-500 to-emerald-600',
      trend: '+5%'
    },
    {
      title: 'Urgentes',
      value: tasks.filter(task => task.priority === 'urgent').length,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'Nouvelles aujourd\'hui',
      value: tasks.filter(task => {
        const today = new Date();
        const taskDate = new Date(task.created_at);
        return taskDate.toDateString() === today.toDateString();
      }).length,
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600'
    }
  ], [tasks, latitude, longitude]);

  const quickActions: QuickAction[] = [
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
    }
  ];

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
      navigate('/login');
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

      await createConversation([user.id, task.user_id]);
      navigate('/chat');
      
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
    }
  };

  const handleRequest = async (taskId: number) => {
    if (!user) {
      navigate('/login');
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

      await createConversation([user.id, task.user_id]);
      navigate('/chat');
      
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
    }
  };

  const handleEdit = (taskId: number) => {
    navigate(`/edit-task/${taskId}`);
  };

  const handleViewTask = (taskId: number) => {
    navigate(`/task/${taskId}`);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

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
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
              <Users className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-ping opacity-20"></div>
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full animate-pulse opacity-10"></div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
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
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative px-6 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-8 backdrop-blur-sm border border-white/30"
              >
                <Heart className="w-10 h-10" />
              </motion.div>
              
              <motion.h1 
                className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Entraide Universelle
              </motion.h1>
              
              <motion.p 
                className="text-xl lg:text-2xl text-blue-100 mb-10 max-w-4xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                Une communauté bienveillante où chacun peut donner et recevoir de l'aide. 
                <span className="block mt-2 text-lg">Connectez-vous localement, agissez globalement.</span>
              </motion.p>
              
              {/* Enhanced Stats Cards */}
              {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-10">
                {statsCards.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                    className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl mb-4`}>
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold mb-2">{stat.value}</div>
                    <div className="text-blue-100 text-sm font-medium">{stat.title}</div>
                    {stat.trend && (
                      <div className="text-green-300 text-xs mt-1 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {stat.trend}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div> */}

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  onClick={() => navigate('/create-task')}
                  className="bg-white text-indigo-600 hover:bg-gray-50 px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Créer ma première tâche
                </Button>
                {/* <Button
                  onClick={() => setShowQuickActions(true)}
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-2xl font-semibold text-lg backdrop-blur-sm"
                >
                  <Compass className="w-5 h-5 mr-2" />
                  Explorer les opportunités
                </Button> */}
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Enhanced Wave Separator */}
        {/* <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-20 text-slate-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.71,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
          </svg>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">


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
                    >
                      Masquer
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickActions.map((action, index) => (
                      <motion.div
                        key={action.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        onClick={action.action}
                        className="group cursor-pointer"
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
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
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

          {/* Enhanced Tasks List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {getFilteredAndSortedTasks.length === 0 ? (
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
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {getFilteredAndSortedTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    layout
                  >
                    <Card className={`group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 transform hover:scale-[1.02] ${
                      viewMode === 'grid' ? 'p-6' : 'p-8'
                    }`}>
                      {/* Priority Indicator */}
                      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
                        task.priority === 'urgent' ? 'from-red-500 to-red-600' :
                        task.priority === 'high' ? 'from-orange-500 to-orange-600' :
                        task.priority === 'medium' ? 'from-yellow-500 to-yellow-600' :
                        'from-green-500 to-green-600'
                      }`}></div>

                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start space-x-4 flex-1 min-w-0">
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                              <span className="text-2xl">{categoryIcons[task.category]}</span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm ${
                              task.priority === 'urgent' ? 'bg-red-500' :
                              task.priority === 'high' ? 'bg-orange-500' :
                              task.priority === 'medium' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}>
                              {priorityIcons[task.priority]}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 
                              className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => handleViewTask(task.id)}
                            >
                              {task.title}
                            </h3>
                            <div className="flex items-center flex-wrap gap-3">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                              <span className="text-sm text-slate-500 flex items-center">
                                {task.category === 'local' ? (
                                  <>
                                    <MapPin className="w-3 h-3 mr-1" />
                                    Sur place
                                  </>
                                ) : (
                                  <>
                                    <Globe className="w-3 h-3 mr-1" />
                                    À distance
                                  </>
                                )}
                              </span>
                              {latitude && longitude && task.latitude && task.longitude && (
                                <span className="text-sm text-emerald-600 flex items-center font-medium">
                                  <Compass className="w-3 h-3 mr-1" />
                                  {formatDistance(calculateDistance(latitude, longitude, task.latitude, task.longitude))}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTask(task.id)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {user && task.user_id === user.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(task.id)}
                              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-slate-600 mb-6 leading-relaxed line-clamp-3">
                        {task.description}
                      </p>

                      {/* Enhanced Details Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <Clock className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-700">{task.estimated_duration}h</div>
                              <div className="text-xs text-slate-500">Durée estimée</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-700">{task.budget_credits}</div>
                              <div className="text-xs text-slate-500">Crédits</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="mb-6">
                        <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span className="font-medium truncate">{task.location}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-purple-600" />
                          Compétences requises
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {task.required_skills.slice(0, viewMode === 'grid' ? 3 : 5).map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 text-sm font-medium rounded-full border border-purple-200 hover:from-purple-100 hover:to-indigo-100 transition-colors"
                            >
                              {skill}
                            </span>
                          ))}
                          {task.required_skills.length > (viewMode === 'grid' ? 3 : 5) && (
                            <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full">
                              +{task.required_skills.length - (viewMode === 'grid' ? 3 : 5)} autres
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      {task.tags.length > 0 && (
                        <div className="mb-6">
                          <div className="flex flex-wrap gap-2">
                            {task.tags.slice(0, viewMode === 'grid' ? 3 : 6).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-flex items-center px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-full cursor-pointer transition-colors"
                              >
                                #{tag}
                              </span>
                            ))}
                            {task.tags.length > (viewMode === 'grid' ? 3 : 6) && (
                              <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-full">
                                +{task.tags.length - (viewMode === 'grid' ? 3 : 6)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                        <div className="flex items-center space-x-3">
                          {user && task.user_id !== user.id ? (
                            <>
                              <Button
                                onClick={() => handleHelp(task.id)}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                              >
                                <Hand className="w-4 h-4 mr-2" />
                                Offrir de l'aide
                              </Button>
                              <Button
                                onClick={() => handleRequest(task.id)}
                                variant="outline"
                                className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 px-6 py-2 rounded-2xl transition-all duration-200"
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Contacter
                              </Button>
                            </>
                          ) : !user ? (
                            <Button
                              onClick={() => navigate('/login')}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Se connecter pour aider
                            </Button>
                          ) : (
                            <div className="text-sm text-slate-500 italic flex items-center">
                              <Award className="w-4 h-4 mr-2" />
                              Votre tâche
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right text-sm text-slate-500">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(task.created_at).toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'short',
                              year: new Date(task.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                            })}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Load More Button (if needed) */}
          {getFilteredAndSortedTasks.length > 10 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-center mt-12"
            >
              <Button
                variant="outline"
                className="px-8 py-4 rounded-2xl border-slate-300 hover:border-blue-500 hover:text-blue-600 text-lg"
              >
                <Eye className="w-5 h-5 mr-2" />
                Voir plus de tâches
              </Button>
            </motion.div>
          )}
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