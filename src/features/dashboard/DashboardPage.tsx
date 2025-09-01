import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  MessageSquare,
  FileText,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Play,
  Pause,
  Square
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    fetchTasks, 
    isLoading, 
    getDashboardData, 
    filterTasks, 
    sortTasks,
    searchTasks,
    taskFilters,
    setTaskFilters,
    taskSort,
    setTaskSort,
    updateTaskStatus,

  } = useTaskStore();

  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState<'overview' | 'tasks' | 'analytics'>('overview');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const dashboard = getDashboardData();
  const filteredTasks = filterTasks(taskFilters);
  const sortedTasks = sortTasks(filteredTasks, taskSort);
  const searchResults = searchTerm ? searchTasks(searchTerm) : sortedTasks;

  const statusColors = {
    open: 'bg-blue-100 text-blue-800 border-blue-200',
    in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    on_hold: 'bg-orange-100 text-orange-800 border-orange-200',
    review: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const priorityColors = {
    low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
  };

  const complexityColors = {
    simple: 'bg-green-100 text-green-800 border-green-200',
    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    complex: 'bg-red-100 text-red-800 border-red-200'
  };

  const handleStatusChange = async (taskId: number, newStatus: any) => {
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Square className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <Minus className="w-4 h-4" />;
      case 'on_hold': return <Pause className="w-4 h-4" />;
      case 'review': return <Eye className="w-4 h-4" />;
      default: return <Square className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="animate-pulse">
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Chargement du tableau de bord...</h2>
            <p className="text-slate-500">Préparation de vos métriques</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <BarChart3 className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Tableau de Bord
            </h1>
          </div>
          <Button
            onClick={() => navigate('/create-task')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Tâche
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Navigation des vues */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button
                  variant={selectedView === 'overview' ? 'primary' : 'ghost'}
                  onClick={() => setSelectedView('overview')}
                  className="flex items-center space-x-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Vue d'ensemble</span>
                </Button>
                <Button
                  variant={selectedView === 'tasks' ? 'primary' : 'ghost'}
                  onClick={() => setSelectedView('tasks')}
                  className="flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Toutes les tâches</span>
                </Button>
                <Button
                  variant={selectedView === 'analytics' ? 'primary' : 'ghost'}
                  onClick={() => setSelectedView('analytics')}
                  className="flex items-center space-x-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Analytics</span>
                </Button>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher des tâches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtres</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres avancés</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    multiple
                    value={taskFilters.status || [] as string[]}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setTaskFilters({ ...taskFilters, status: selected as any });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="open">Ouvertes</option>
                    <option value="in_progress">En cours</option>
                    <option value="completed">Terminées</option>
                    <option value="cancelled">Annulées</option>
                    <option value="on_hold">En attente</option>
                    <option value="review">En révision</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                  <select
                    multiple
                    value={taskFilters.priority || [] as string[]}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setTaskFilters({ ...taskFilters, priority: selected as any });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Élevée</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Complexité</label>
                  <select
                    multiple
                    value={taskFilters.complexity || [] as string[]}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setTaskFilters({ ...taskFilters, complexity: selected as any });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="simple">Simple</option>
                    <option value="moderate">Modérée</option>
                    <option value="complex">Complexe</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Vue d'ensemble */}
          {selectedView === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Métriques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total des tâches</p>
                      <p className="text-3xl font-bold">{dashboard.total_tasks}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Terminées</p>
                      <p className="text-3xl font-bold">{dashboard.completed_tasks}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">En cours</p>
                      <p className="text-3xl font-bold">{dashboard.in_progress_tasks}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-red-500 to-red-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">En retard</p>
                      <p className="text-3xl font-bold">{dashboard.overdue_tasks}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Graphiques et métriques détaillées */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par statut</h3>
                  <div className="space-y-3">
                    {Object.entries({
                      'Ouvertes': dashboard.total_tasks - dashboard.completed_tasks - dashboard.in_progress_tasks,
                      'En cours': dashboard.in_progress_tasks,
                      'Terminées': dashboard.completed_tasks,
                      'En attente': dashboard.total_tasks - dashboard.completed_tasks - dashboard.in_progress_tasks - (dashboard.total_tasks - dashboard.completed_tasks - dashboard.in_progress_tasks)
                    }).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{status}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(count / dashboard.total_tasks) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taux de completion</span>
                      <span className="text-lg font-bold text-green-600">
                        {dashboard.performance_metrics.completion_rate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tâches en retard</span>
                      <span className="text-lg font-bold text-red-600">
                        {dashboard.overdue_tasks}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Deadlines à venir</span>
                      <span className="text-lg font-bold text-yellow-600">
                        {dashboard.upcoming_deadlines.length}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Deadlines à venir */}
              {dashboard.upcoming_deadlines.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-red-500" />
                    <span>Deadlines à venir (3 prochains jours)</span>
                  </h3>
                  <div className="space-y-3">
                    {dashboard.upcoming_deadlines.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-gray-900">{task.title}</p>
                            <p className="text-sm text-gray-600">
                              Échéance: {new Date(task.deadline!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          )}

          {/* Vue des tâches */}
          {selectedView === 'tasks' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Contrôles de tri */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">Trier par:</span>
                    <select
                      value={taskSort.field}
                      onChange={(e) => setTaskSort({ ...taskSort, field: e.target.value as any })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="created_at">Date de création</option>
                      <option value="updated_at">Dernière modification</option>
                      <option value="deadline">Échéance</option>
                      <option value="priority">Priorité</option>
                      <option value="progress">Progression</option>
                      <option value="budget_credits">Budget</option>
                      <option value="estimated_duration">Durée estimée</option>
                    </select>
                    <Button
                      variant="ghost"
                      onClick={() => setTaskSort({ ...taskSort, direction: taskSort.direction === 'asc' ? 'desc' : 'asc' })}
                      className="p-2"
                    >
                      {taskSort.direction === 'asc' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </Button>
                  </div>
                  <span className="text-sm text-gray-600">
                    {searchResults.length} tâche(s) trouvée(s)
                  </span>
                </div>
              </Card>

              {/* Liste des tâches */}
              <div className="space-y-4">
                {searchResults.map((task) => (
                  <Card 
                    key={task.id} 
                    className={`p-6 hover:shadow-lg transition-shadow ${
                      task.status === 'completed' 
                        ? 'bg-gray-50 border-gray-200 opacity-75' 
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {task.status === 'completed' && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">Terminée</span>
                            </div>
                          )}
                          <h3 className={`text-lg font-semibold ${
                            task.status === 'completed' ? 'text-gray-500' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[task.status]}`}>
                            {getStatusIcon(task.status)} {task.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${complexityColors[task.complexity]}`}>
                            {task.complexity}
                          </span>
                        </div>
                        
                        <p className={`mb-4 ${
                          task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {task.description}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className={`flex items-center space-x-2 text-sm ${
                            task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <Clock className="w-4 h-4" />
                            <span>{task.estimated_duration}h</span>
                          </div>
                          <div className={`flex items-center space-x-2 text-sm ${
                            task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <Target className="w-4 h-4" />
                            <span>{task.progress_percentage}%</span>
                          </div>
                          <div className={`flex items-center space-x-2 text-sm ${
                            task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <Calendar className="w-4 h-4" />
                            <span>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Aucune'}</span>
                          </div>
                          <div className={`flex items-center space-x-2 text-sm ${
                            task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <Users className="w-4 h-4" />
                            <span>{task.assigned_to ? 'Assignée' : 'Non assignée'}</span>
                          </div>
                        </div>

                        {/* Barre de progression */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-medium ${
                              task.status === 'completed' ? 'text-gray-400' : 'text-gray-700'
                            }`}>
                              Progression
                            </span>
                            <span className={`text-sm ${
                              task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {task.progress_percentage}%
                            </span>
                          </div>
                          <div className={`w-full rounded-full h-2 ${
                            task.status === 'completed' ? 'bg-gray-300' : 'bg-gray-200'
                          }`}>
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                task.status === 'completed' ? 'bg-gray-400' : 'bg-blue-600'
                              }`}
                              style={{ width: `${task.progress_percentage}%` }}
                            ></div>
                          </div>
                          {task.current_step && (
                            <p className={`text-sm mt-1 ${
                              task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Étape actuelle: {task.current_step}
                            </p>
                          )}
                        </div>

                        {/* Actions rapides */}
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/edit-task/${task.id}`)}
                            className={`flex items-center space-x-2 ${
                              task.status === 'completed' 
                                ? 'opacity-50 cursor-not-allowed' 
                                : ''
                            }`}
                            disabled={task.status === 'completed'}
                          >
                            <Edit className="w-4 h-4" />
                            <span>Modifier</span>
                          </Button>
                          
                          {task.status === 'open' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(task.id, 'in_progress')}
                              className="flex items-center space-x-2"
                            >
                              <Play className="w-4 h-4" />
                              <span>Démarrer</span>
                            </Button>
                          )}
                          
                          {task.status === 'in_progress' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(task.id, 'completed')}
                              className="flex items-center space-x-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Terminer</span>
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/chat')}
                            className={`flex items-center space-x-2 ${
                              task.status === 'completed' 
                                ? 'opacity-50' 
                                : ''
                            }`}
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Discuter</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Vue Analytics */}
          {selectedView === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics avancées</h3>
                <p className="text-gray-600">
                  Cette section sera développée avec des graphiques interactifs et des analyses détaillées.
                </p>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
