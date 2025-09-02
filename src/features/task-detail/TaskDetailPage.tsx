import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import TaskTracker from '@/components/ui/TaskTracker';
import Button from '@/components/ui/Button';
import { ArrowLeft, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useMessageStore } from '@/stores/messageStore';

const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { tasks, fetchTasks, updateTaskProgress, updateTaskStatus, addTaskComment, addTaskAttachment, removeTaskAttachment, deleteTask } = useTaskStore();
  const { user } = useAuthStore();
  const { createConversation } = useMessageStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const task = tasks.find(t => t.id === parseInt(taskId || '0'));

  useEffect(() => {
    const loadTask = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (tasks.length === 0) {
          await fetchTasks();
        }
        
        if (!task && tasks.length > 0) {
          setError('Tâche non trouvée');
        }
      } catch (err) {
        setError('Erreur lors du chargement de la tâche');
        console.error('Erreur:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTask();
  }, [taskId, tasks.length, fetchTasks, task]);

  const handleUpdateProgress = async (progress: number, step?: string) => {
    if (!task) return;
    
    try {
      await updateTaskProgress(task.id, progress, step);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du progrès:', error);
      throw error;
    }
  };

  const handleUpdateStatus = async (status: any, reason?: string) => {
    if (!task) return;
    
    try {
      await updateTaskStatus(task.id, status, reason);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  };

  const handleAddComment = async (comment: any) => {
    if (!task) return;
    
    try {
      await addTaskComment(task.id, comment);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      throw error;
    }
  };

  const handleAddAttachment = async (file: File, description?: string) => {
    if (!task) return;
    
    try {
      await addTaskAttachment(task.id, file, description);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la pièce jointe:', error);
      throw error;
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!task) return;
    
    try {
      await removeTaskAttachment(task.id, attachmentId);
    } catch (error) {
      console.error('Erreur lors de la suppression de la pièce jointe:', error);
      throw error;
    }
  };

  const handleEdit = () => {
    navigate(`/edit-task/${taskId}`);
  };

  const handleDelete = async () => {
    if (!task || !window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    
    try {
      await deleteTask(task.id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleViewOffers = () => {
    navigate(`/task/${taskId}/offers`);
  };

  const handleCreateGroupConversation = async () => {
    if (!task || !user) return;
    try {
      const participants: string[] = [];
      participants.push(task.user_id);
      if (task.assigned_to && task.assigned_to !== task.user_id) participants.push(task.assigned_to);
      if (!participants.includes(user.id)) participants.push(user.id);
      await createConversation(participants);
      navigate('/chat');
    } catch (e) {
      console.error('Erreur création conversation de groupe:', e);
    }
  };

  const isOwner = user?.id === task?.user_id;
  const canEdit = isOwner || user?.id === task?.assigned_to;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="animate-pulse">
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Chargement de la tâche...</h2>
            <p className="text-slate-500">Récupération des détails</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Erreur</h2>
          <p className="text-slate-500 mb-6">{error || 'Tâche non trouvée'}</p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            Retour au tableau de bord
          </Button>
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
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Détail de la tâche
              </h1>
              <p className="text-sm text-gray-500">
                ID: {task.id} • Créée le {new Date(task.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {task.status === 'completed' && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Terminée</span>
              </div>
            )}
            
            {task.is_overdue && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-800 rounded-full">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">En retard</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <TaskTracker
              task={task}
              onUpdateProgress={handleUpdateProgress}
              onUpdateStatus={handleUpdateStatus}
              onAddComment={handleAddComment}
              onAddAttachment={handleAddAttachment}
              onRemoveAttachment={handleRemoveAttachment}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewOffers={handleViewOffers}
              isOwner={isOwner}
              canEdit={canEdit}
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={handleCreateGroupConversation} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Créer conversation de groupe
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
