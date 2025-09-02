import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/features/wallet/stores/walletStore';
import { useMarketplaceStore } from '@/stores/marketplaceStore';

// Composants refactorisés
import DashboardHeader from './components/DashboardHeader';
import ViewTabs from './components/ViewTabs';
import MetricsCards from './components/MetricsCards';
import AdvancedFilters from './components/AdvancedFilters';
import SearchAndControls from './components/SearchAndControls';
import TaskList from './components/TaskList';
import AnalyticsSection from './components/AnalyticsSection';
import SkeletonLoader from './components/SkeletonLoader';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    fetchAllTasks, 
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

  const { user } = useAuthStore();
  const { wallet, stats, fetchWallet, fetchWalletStats } = useWalletStore();
  const { items, rentals, fetchItems, fetchRentals } = useMarketplaceStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState<'overview' | 'tasks' | 'analytics' | 'marketplace' | 'wallet'>('overview');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAllTasks();
    fetchWallet();
    fetchWalletStats();
    fetchItems();
    fetchRentals();
  }, []);

  const dashboard = getDashboardData();
  const filteredTasks = filterTasks(taskFilters);
  const sortedTasks = sortTasks(filteredTasks, taskSort);
  const searchResults = searchTerm ? searchTasks(searchTerm) : sortedTasks;

  const handleStatusChange = async (taskId: number, newStatus: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold' | 'review') => {
    try {
      await updateTaskStatus(taskId, newStatus);
      // Rafraîchir les tâches après la mise à jour
      await fetchAllTasks();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const handleCreateTask = () => {
    navigate('/create-task');
  };

  const handleEditTask = (taskId: number) => {
    navigate(`/edit-task/${taskId}`);
  };

  const handleViewTask = (taskId: number) => {
    navigate(`/task/${taskId}`);
  };

  const handleChat = () => {
    navigate('/chat');
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pb-24">
      <DashboardHeader onCreateTask={handleCreateTask} />

      <div className="p-6">
        <div className="max-w-12xl mx-auto space-y-6">
          {/* Navigation et contrôles */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <ViewTabs 
              selectedView={selectedView} 
              onViewChange={setSelectedView} 
            />
            
            <div className="flex items-center space-x-4">
              <AdvancedFilters
                isOpen={showFilters}
                onToggle={() => setShowFilters(!showFilters)}
                filters={{
                  status: taskFilters.status,
                  priority: taskFilters.priority,
                  complexity: taskFilters.complexity
                }}
                onFiltersChange={(filters) => {
                  setTaskFilters({
                    ...taskFilters,
                    status: filters.status as any,
                    priority: filters.priority as any,
                    complexity: filters.complexity as any
                  });
                }}
              />
            </div>
          </div>

          {/* Vue d'ensemble */}
          {selectedView === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <MetricsCards dashboard={dashboard} />
              
              {/* Métriques étendues */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Mes objets</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {items.filter(item => item.user_id === user?.id).length}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Solde wallet</p>
                        <p className="text-2xl font-bold text-green-600">
                          {wallet?.balance || 0} crédits
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Locations actives</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {rentals.filter(rental => rental.status === 'active').length}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Revenus ce mois</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {rentals
                            .filter(rental => rental.status === 'completed' && 
                              new Date(rental.created_at).getMonth() === new Date().getMonth())
                            .reduce((sum, rental) => sum + (rental.total_credits || 0), 0)} crédits
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
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
                              <motion.div 
                                className="bg-blue-600 h-2 rounded-full" 
                                initial={{ width: 0 }}
                                animate={{ width: `${(count / dashboard.total_tasks) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
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
                  </div>
                </motion.div>
              </div>

              {/* Activité récente */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Tâches récentes</h4>
                      <div className="space-y-2">
                        {searchResults.slice(0, 3).map((task, index) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + index * 0.1 }}
                            className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">{task.title}</p>
                              <p className="text-xs text-gray-600">{task.status}</p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(task.created_at).toLocaleDateString()}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Locations récentes</h4>
                      <div className="space-y-3">
                        {rentals.slice(0, 3).map((rental, index) => {
                          const item = items.find(item => item.id === rental.item_id);
                          const isOwner = rental.owner_id === user?.id;
                          
                          return (
                            <motion.div
                              key={rental.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.9 + index * 0.1 }}
                              className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {item?.name || 'Objet'}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {isOwner ? 'Vous louez à' : 'Vous louez de'} {isOwner ? 'un utilisateur' : 'un propriétaire'}
                                  </p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  rental.status === 'active' 
                                    ? 'bg-green-100 text-green-800'
                                    : rental.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : rental.status === 'requested'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : rental.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {rental.status === 'requested' ? 'Demandée' :
                                   rental.status === 'accepted' ? 'Acceptée' :
                                   rental.status === 'active' ? 'Active' :
                                   rental.status === 'completed' ? 'Terminée' :
                                   rental.status === 'cancelled' ? 'Annulée' : rental.status}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <div>
                                  <span className="font-medium">Début:</span>
                                  <br />
                                  {new Date(rental.start_date).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-medium">Fin:</span>
                                  <br />
                                  {new Date(rental.end_date).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-medium">Prix/jour:</span>
                                  <br />
                                  {rental.daily_price} crédits
                                </div>
                                <div>
                                  <span className="font-medium">Total:</span>
                                  <br />
                                  {rental.total_credits} crédits
                                </div>
                              </div>
                              
                              <div className="mt-2 pt-2 border-t border-slate-200">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>Créée le {new Date(rental.created_at).toLocaleDateString()}</span>
                                  <span>Caution: {rental.deposit_credits} crédits</span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Vue des tâches */}
          {selectedView === 'tasks' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <SearchAndControls
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                taskSort={taskSort}
                onSortChange={(sort) => setTaskSort(sort as any)}
                resultsCount={searchResults.length}
              />

              <TaskList
                tasks={searchResults}
                onEdit={handleEditTask}
                onStatusChange={handleStatusChange}
                onChat={handleChat}
                onView={handleViewTask}
              />
            </motion.div>
          )}

          {/* Vue Analytics */}
          {selectedView === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <AnalyticsSection dashboard={dashboard} />
            </motion.div>
          )}

          {/* Vue Marketplace */}
          {selectedView === 'marketplace' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Mes objets</p>
                        <p className="text-3xl font-bold text-blue-600">
                          {items.filter(item => item.user_id === user?.id).length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Locations actives</p>
                        <p className="text-3xl font-bold text-green-600">
                          {rentals.filter(rental => rental.status === 'active').length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Revenus ce mois</p>
                        <p className="text-3xl font-bold text-emerald-600">
                          {rentals
                            .filter(rental => rental.status === 'completed' && 
                              new Date(rental.created_at).getMonth() === new Date().getMonth())
                            .reduce((sum, rental) => sum + (rental.total_credits || 0), 0)} crédits
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Mes objets récents</h3>
                    <div className="space-y-3">
                      {items
                        .filter(item => item.user_id === user?.id)
                        .slice(0, 5)
                        .map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">{item.category}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.available 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.available ? 'Disponible' : 'Indisponible'}
                            </span>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Locations récentes</h3>
                    <div className="space-y-4">
                      {rentals.slice(0, 5).map((rental, index) => {
                        const item = items.find(item => item.id === rental.item_id);
                        const isOwner = rental.owner_id === user?.id;
                        const duration = Math.ceil((new Date(rental.end_date).getTime() - new Date(rental.start_date).getTime()) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <motion.div
                            key={rental.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-medium text-gray-900">
                                    {item?.name || 'Objet'}
                                  </h4>
                                  <span className="text-xs text-gray-500">
                                    ({item?.category || 'N/A'})
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {isOwner ? 'Vous louez à un utilisateur' : 'Vous louez de quelqu\'un'}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                rental.status === 'active' 
                                  ? 'bg-green-100 text-green-800'
                                  : rental.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : rental.status === 'requested'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : rental.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {rental.status === 'requested' ? 'Demandée' :
                                 rental.status === 'accepted' ? 'Acceptée' :
                                 rental.status === 'active' ? 'Active' :
                                 rental.status === 'completed' ? 'Terminée' :
                                 rental.status === 'cancelled' ? 'Annulée' : rental.status}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div className="bg-white p-2 rounded border">
                                <div className="text-xs text-gray-500 mb-1">Période</div>
                                <div className="font-medium text-gray-900">
                                  {new Date(rental.start_date).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-600">
                                  au {new Date(rental.end_date).toLocaleDateString()}
                                </div>
                              </div>
                              
                              <div className="bg-white p-2 rounded border">
                                <div className="text-xs text-gray-500 mb-1">Durée</div>
                                <div className="font-medium text-gray-900">
                                  {duration} jour{duration > 1 ? 's' : ''}
                                </div>
                              </div>
                              
                              <div className="bg-white p-2 rounded border">
                                <div className="text-xs text-gray-500 mb-1">Prix/jour</div>
                                <div className="font-medium text-emerald-600">
                                  {rental.daily_price} crédits
                                </div>
                              </div>
                              
                              <div className="bg-white p-2 rounded border">
                                <div className="text-xs text-gray-500 mb-1">Total</div>
                                <div className="font-medium text-blue-600">
                                  {rental.total_credits} crédits
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center space-x-4">
                                  <span>Caution: {rental.deposit_credits} crédits</span>
                                  <span>•</span>
                                  <span>Créée le {new Date(rental.created_at).toLocaleDateString()}</span>
                                </div>
                                
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Vue Wallet */}
          {selectedView === 'wallet' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium mb-1">Solde disponible</p>
                        <p className="text-3xl font-bold">
                          {wallet?.balance || 0} crédits
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm font-medium mb-1">Crédits réservés</p>
                        <p className="text-3xl font-bold">
                          {stats?.reserved_credits || 0} crédits
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium mb-1">Total</p>
                        <p className="text-3xl font-bold">
                          {(wallet?.balance || 0) + (stats?.reserved_credits || 0)} crédits
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => navigate('/wallet')}
                      className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Acheter des crédits</p>
                          <p className="text-sm text-gray-600">Recharger votre wallet</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate('/marketplace')}
                      className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Marketplace</p>
                          <p className="text-sm text-gray-600">Louer des objets</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate('/marketplace/create')}
                      className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Ajouter un objet</p>
                          <p className="text-sm text-gray-600">Mettre en location</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
