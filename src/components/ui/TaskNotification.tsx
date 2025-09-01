import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Info, 
  X,
  Bell,
  Calendar,
  Target
} from 'lucide-react';

export interface TaskNotificationData {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'reminder';
  title: string;
  message: string;
  taskId?: number;
  taskTitle?: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  actionUrl?: string;
  isRead: boolean;
}

interface TaskNotificationProps {
  notification: TaskNotificationData;
  onDismiss: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onAction?: (notification: TaskNotificationData) => void;
}

const TaskNotification: React.FC<TaskNotificationProps> = ({
  notification,
  onDismiss,
  onMarkAsRead,
  onAction
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-800';
      case 'warning':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
      case 'reminder':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const handleAction = () => {
    if (onAction) {
      onAction(notification);
    }
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative border-l-4 ${getPriorityColor()} rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-200 ${
        notification.isRead ? 'opacity-75' : ''
      }`}
    >
      {/* En-tête de la notification */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-gray-500" />
            <span className={`text-sm font-semibold ${getTypeColor()}`}>
              {notification.title}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className={`p-1 rounded-full transition-colors ${
              notification.isRead 
                ? 'text-gray-400 hover:text-gray-600' 
                : 'text-gray-500 hover:text-blue-600'
            }`}
            title={notification.isRead ? 'Marquer comme non lue' : 'Marquer comme lue'}
          >
            <div className={`w-2 h-2 rounded-full ${
              notification.isRead ? 'bg-gray-400' : 'bg-blue-500'
            }`} />
          </button>
          
          <button
            onClick={() => onDismiss(notification.id)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contenu de la notification */}
      <div className="mb-3">
        <p className="text-sm text-gray-700 leading-relaxed">
          {notification.message}
        </p>
        
        {notification.taskTitle && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
            <Target className="w-4 h-4" />
            <span className="font-medium">Tâche:</span>
            <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
              {notification.taskTitle}
            </span>
          </div>
        )}
      </div>

      {/* Métadonnées et actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(notification.timestamp).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              notification.priority === 'high' ? 'bg-red-500' :
              notification.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
            }`} />
            <span className="capitalize">{notification.priority}</span>
          </div>
        </div>

        {onAction && (
          <button
            onClick={handleAction}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              notification.type === 'success' 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' :
              notification.type === 'warning'
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
              notification.type === 'error'
                ? 'bg-red-100 text-red-700 hover:bg-red-200' :
              notification.type === 'reminder'
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {notification.type === 'reminder' ? 'Voir' : 'Action'}
          </button>
        )}
      </div>

      {/* Indicateur de priorité */}
      {notification.priority === 'high' && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </div>
      )}
    </motion.div>
  );
};

export default TaskNotification;
