import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Target, 
  Calendar, 
  Users, 
  Edit, 
  MessageSquare, 
  Play, 
  CheckCircle,

  Eye
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Task } from '@/types';
import { 
  getStatusColor, 
  getPriorityColor, 
  getComplexityColor, 
  getProgressColor,
  formatDate,
  truncateText,
  isTaskCompleted,

} from '../utils';
import { STATUS_LABELS, PRIORITY_LABELS, COMPLEXITY_LABELS } from '../constants';

interface TaskCardProps {
  task: Task;
  onEdit: (taskId: number) => void;
  onStatusChange: (taskId: number, newStatus: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold' | 'review') => void;
  onChat: () => void;
  onView: (taskId: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onStatusChange,
  onChat,
  onView
}) => {
  const isCompleted = isTaskCompleted(task.status);
  const progressColor = getProgressColor(task.progress_percentage);


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card 
        className={`
          p-6 transition-all duration-300 hover:shadow-xl border-l-4
          ${isCompleted 
            ? 'bg-gray-50 border-gray-200 opacity-75 border-l-gray-400' 
            : 'bg-white border-l-blue-500 hover:border-l-blue-600'
          }
        `}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header avec statut et indicateur */}
            <div className="flex items-center space-x-3 mb-4">
              {isCompleted && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Terminée</span>
                </div>
              )}
              
              <h3 className={`text-xl font-bold ${
                isCompleted ? 'text-gray-500' : 'text-gray-900'
              }`}>
                {task.title}
              </h3>
            </div>

            {/* Badges */}
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                {STATUS_LABELS[task.status as keyof typeof STATUS_LABELS] || task.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                {PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS] || task.priority}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getComplexityColor(task.complexity)}`}>
                {COMPLEXITY_LABELS[task.complexity as keyof typeof COMPLEXITY_LABELS] || task.complexity}
              </span>
            </div>
            
            {/* Description */}
            <p className={`mb-4 line-clamp-2 ${
              isCompleted ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {truncateText(task.description, 120)}
            </p>
            
            {/* Métadonnées */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className={`flex items-center space-x-2 text-sm ${
                isCompleted ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{task.estimated_duration}h</span>
              </div>
              <div className={`flex items-center space-x-2 text-sm ${
                isCompleted ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <Target className="w-4 h-4" />
                <span>{task.progress_percentage}%</span>
              </div>
              <div className={`flex items-center space-x-2 text-sm ${
                isCompleted ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <Calendar className="w-4 h-4" />
                <span>{task.deadline ? formatDate(task.deadline) : 'Aucune'}</span>
              </div>
              <div className={`flex items-center space-x-2 text-sm ${
                isCompleted ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <Users className="w-4 h-4" />
                <span>{task.assigned_to ? 'Assignée' : 'Non assignée'}</span>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  isCompleted ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  Progression
                </span>
                <span className={`text-sm font-bold ${
                  isCompleted ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {task.progress_percentage}%
                </span>
              </div>
              <div className={`w-full rounded-full h-3 ${
                isCompleted ? 'bg-gray-300' : 'bg-gray-200'
              }`}>
                <motion.div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-gray-400' : progressColor
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress_percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              {task.current_step && (
                <p className={`text-sm mt-2 ${
                  isCompleted ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Étape actuelle: {task.current_step}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-end space-y-2 ml-4">
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => onView(task.id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </motion.button>
              
              <motion.button
                onClick={() => onEdit(task.id)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isCompleted 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-100'
                }`}
                disabled={isCompleted}
                whileHover={{ scale: isCompleted ? 1 : 1.05 }}
                whileTap={{ scale: isCompleted ? 1 : 0.95 }}
              >
                <Edit className="w-4 h-4 text-gray-600" />
              </motion.button>
            </div>

            {/* Actions de statut */}
            {!isCompleted && (
              <div className="flex flex-col space-y-1">
                {task.status === 'open' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(task.id, 'in_progress')}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <Play className="w-3 h-3" />
                    <span>Démarrer</span>
                  </Button>
                )}
                
                {task.status === 'in_progress' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(task.id, 'completed')}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>Terminer</span>
                  </Button>
                )}
              </div>
            )}

            <motion.button
              onClick={onChat}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isCompleted ? 'opacity-50' : 'hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageSquare className="w-4 h-4 text-gray-600" />
            </motion.button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default TaskCard;
