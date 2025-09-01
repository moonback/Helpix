import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';

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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState<'overview' | 'tasks' | 'analytics'>('overview');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAllTasks();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pb-20">
      <DashboardHeader onCreateTask={handleCreateTask} />

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
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
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
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
                                transition={{ duration: 0.8, delay: 0.3 }}
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
                  transition={{ delay: 0.3 }}
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
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
