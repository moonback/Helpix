import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { useHelpOfferStore } from '@/stores/helpOfferStore';
import TaskTracker from '@/components/ui/TaskTracker';
import Button from '@/components/ui/Button';
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, MessageSquare, Send } from 'lucide-react';
import { useMessageStore } from '@/stores/messageStore';

const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tasks, fetchTasks, updateTaskProgress, updateTaskStatus, addTaskComment, addTaskAttachment, removeTaskAttachment, deleteTask } = useTaskStore();
  const { user } = useAuthStore();
  const { createConversation } = useMessageStore();
  const { createHelpOffer, isLoading: isCreatingOffer } = useHelpOfferStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHelpForm, setShowHelpForm] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');
  const [proposedDuration, setProposedDuration] = useState<number | undefined>();
  const [proposedCredits, setProposedCredits] = useState<number | undefined>();

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

  // Vérifier si l'action est "help" pour afficher le formulaire
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'help' && user && task && task.user_id !== user.id) {
      setShowHelpForm(true);
    }
  }, [searchParams, user, task]);

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

  const handleSubmitHelpOffer = async () => {
    if (!task || !user || !helpMessage.trim()) return;
    
    try {
      await createHelpOffer(
        task.id,
        helpMessage,
        proposedDuration,
        proposedCredits
      );
      
      // Réinitialiser le formulaire
      setHelpMessage('');
      setProposedDuration(undefined);
      setProposedCredits(undefined);
      setShowHelpForm(false);
      
      // Nettoyer l'URL
      navigate(`/task/${taskId}`, { replace: true });
      
      // Afficher un message de succès
      alert('Votre offre d\'aide a été envoyée avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'offre:', error);
      alert('Erreur lors de l\'envoi de l\'offre d\'aide');
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
            
            {/* Formulaire d'offre d'aide */}
            {showHelpForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Proposer votre aide</h3>
                    <p className="text-sm text-slate-600">Expliquez pourquoi vous êtes la bonne personne pour cette tâche</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Message de motivation *
                    </label>
                    <textarea
                      value={helpMessage}
                      onChange={(e) => setHelpMessage(e.target.value)}
                      placeholder="Expliquez votre expérience, votre disponibilité et pourquoi vous souhaitez aider..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Durée proposée (heures)
                      </label>
                      <input
                        type="number"
                        value={proposedDuration || ''}
                        onChange={(e) => setProposedDuration(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Ex: 2"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Crédits proposés
                      </label>
                      <input
                        type="number"
                        value={proposedCredits || ''}
                        onChange={(e) => setProposedCredits(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Ex: 50"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleSubmitHelpOffer}
                      disabled={!helpMessage.trim() || isCreatingOffer}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {isCreatingOffer ? 'Envoi...' : 'Envoyer l\'offre'}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setShowHelpForm(false);
                        navigate(`/task/${taskId}`, { replace: true });
                      }}
                      variant="outline"
                      className="border-slate-300 hover:border-slate-400"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
            
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
