import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Task, TaskComment } from '@/types';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import { 
  Clock, 
  Target, 
  MessageSquare, 
  Paperclip, 
  Play, 
  Pause, 
  CheckCircle, 
  X,
  Edit,
  Trash2,
  Download,
  Calendar,
  Users,
  AlertTriangle,
  TrendingUp,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Eye
} from 'lucide-react';

interface TaskTrackerProps {
  task: Task;
  onUpdateProgress: (progress: number, step?: string) => Promise<void>;
  onUpdateStatus: (status: Task['status'], reason?: string) => Promise<void>;
  onAddComment: (comment: Omit<TaskComment, 'id' | 'created_at'>) => Promise<void>;
  onAddAttachment: (file: File, description?: string) => Promise<void>;
  onRemoveAttachment: (attachmentId: string) => Promise<void>;
  onEdit: () => void;
  onDelete: () => void;
  onViewOffers?: () => void;
  isOwner?: boolean;
  canEdit?: boolean;
}

const TaskTracker: React.FC<TaskTrackerProps> = ({
  task,
  onUpdateProgress,
  onUpdateStatus,
  onAddComment,
  onAddAttachment,
  onRemoveAttachment,
  onEdit,
  onDelete,
  onViewOffers,
  isOwner = false,
  canEdit = false
}) => {
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [newProgress, setNewProgress] = useState(task.progress_percentage);
  const [newStep, setNewStep] = useState(task.current_step || '');

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

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (fileType.startsWith('audio/')) return <Music className="w-4 h-4" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      await onAddComment({
        task_id: task.id,
        user_id: 'current_user', // À remplacer par l'ID réel
        content: newComment,
        type: 'comment',
        is_internal: false
      });
      setNewComment('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    setSubmitting(true);
    try {
      await onAddAttachment(selectedFile, fileDescription);
      setSelectedFile(null);
      setFileDescription('');
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProgressUpdate = async () => {
    setSubmitting(true);
    try {
      await onUpdateProgress(newProgress, newStep);
      setShowProgressModal(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du progrès:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <div className="w-3 h-3 bg-blue-500 rounded-full" />;
      case 'in_progress': return <Play className="w-4 h-4 text-yellow-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled': return <X className="w-4 h-4 text-red-600" />;
      case 'on_hold': return <Pause className="w-4 h-4 text-orange-600" />;
      case 'review': return <Eye className="w-4 h-4 text-purple-600" />;
      default: return <div className="w-3 h-3 bg-gray-500 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête de la tâche */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[task.status]}`}>
                {getStatusIcon(task.status)} {task.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${complexityColors[task.complexity]}`}>
                {task.complexity}
              </span>
            </div>
            
            <p className="text-gray-600 text-lg leading-relaxed mb-4">{task.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Durée estimée: {task.estimated_duration}h</span>
              </div>
              {task.actual_duration && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Durée réelle: {task.actual_duration}h</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Target className="w-4 h-4" />
                <span>Progression: {task.progress_percentage}%</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Créée le {new Date(task.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isOwner && onViewOffers && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewOffers}
                className="flex items-center space-x-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Voir les offres</span>
              </Button>
            )}
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </Button>
            )}
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </Button>
            )}
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progression globale</span>
            <span className="text-sm text-gray-600">{task.progress_percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${task.progress_percentage}%` }}
            ></div>
          </div>
          {task.current_step && (
            <p className="text-sm text-gray-600 mt-2">
              Étape actuelle: <span className="font-medium">{task.current_step}</span>
            </p>
          )}
          {task.total_steps && (
            <p className="text-sm text-gray-600">
              {task.completed_steps} / {task.total_steps} étapes terminées
            </p>
          )}
        </div>

        {/* Actions rapides */}
        <div className="flex items-center space-x-3">
          {task.status === 'open' && canEdit && (
            <Button
              onClick={() => onUpdateStatus('in_progress', 'Démarrage de la tâche')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Démarrer
            </Button>
          )}
          
          {task.status === 'in_progress' && canEdit && (
            <Button
              onClick={() => setShowProgressModal(true)}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Mettre à jour le progrès
            </Button>
          )}
          
          {task.status === 'in_progress' && canEdit && (
            <Button
              onClick={() => onUpdateStatus('completed', 'Tâche terminée avec succès')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Marquer comme terminée
            </Button>
          )}
          
          {task.status === 'in_progress' && canEdit && (
            <Button
              variant="outline"
              onClick={() => onUpdateStatus('on_hold', 'Mise en pause temporaire')}
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              <Pause className="w-4 h-4 mr-2" />
              Mettre en pause
            </Button>
          )}
        </div>
      </Card>

      {/* Détails et métriques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations détaillées */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Détails de la tâche</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Localisation</span>
              <span className="text-sm font-medium text-gray-900">{task.location}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Budget</span>
              <span className="text-sm font-medium text-gray-900">{task.budget_credits} crédits</span>
            </div>
            
            {task.deadline && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Échéance</span>
                <span className={`text-sm font-medium ${
                  new Date(task.deadline) < new Date() ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {new Date(task.deadline).toLocaleDateString()}
                  {new Date(task.deadline) < new Date() && (
                    <AlertTriangle className="w-4 h-4 inline ml-2" />
                  )}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dernière activité</span>
              <span className="text-sm text-gray-900">
                {task.last_activity ? new Date(task.last_activity).toLocaleDateString() : 'Aucune'}
              </span>
            </div>
            
            {task.assigned_to && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Assignée à</span>
                <span className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Utilisateur {task.assigned_to}</span>
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Compétences et tags */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5 text-green-600" />
            <span>Compétences et tags</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Compétences requises</h4>
              <div className="flex flex-wrap gap-2">
                {task.required_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Pièces jointes */}
      {task.attachments && task.attachments.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Paperclip className="w-5 h-5 text-purple-600" />
            <span>Pièces jointes ({task.attachments.length})</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {task.attachments.map((attachment) => (
              <div key={attachment.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  {getFileIcon(attachment.file_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{attachment.file_name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(attachment.file_size)}</p>
                  </div>
                </div>
                
                {attachment.description && (
                  <p className="text-sm text-gray-600 mb-3">{attachment.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(attachment.uploaded_at).toLocaleDateString()}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(attachment.file_url, '_blank')}
                      className="p-1 text-blue-600 hover:text-blue-700"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveAttachment(attachment.id)}
                        className="p-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Ajout de pièces jointes */}
      {canEdit && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Paperclip className="w-5 h-5 text-purple-600" />
            <span>Ajouter une pièce jointe</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fichier</label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (optionnel)</label>
              <Input
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                placeholder="Description du fichier..."
                className="w-full"
              />
            </div>
            
            <Button
              onClick={handleFileUpload}
              disabled={!selectedFile || isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              {isSubmitting ? 'Upload en cours...' : 'Ajouter la pièce jointe'}
            </Button>
          </div>
        </Card>
      )}

      {/* Commentaires */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-green-600" />
          <span>Commentaires et mises à jour ({task.comments?.length || 0})</span>
        </h3>
        
        {/* Liste des commentaires */}
        <div className="space-y-4 mb-6">
          {task.comments && task.comments.length > 0 ? (
            task.comments.map((comment) => (
              <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      Utilisateur {comment.user_id}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      comment.type === 'progress_update' ? 'bg-blue-100 text-blue-800' :
                      comment.type === 'issue_report' ? 'bg-red-100 text-red-800' :
                      comment.type === 'solution' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {comment.type}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">Aucun commentaire pour le moment</p>
          )}
        </div>
        
        {/* Ajout de commentaire */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ajouter un commentaire</label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tapez votre commentaire..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            {isSubmitting ? 'Envoi...' : 'Ajouter le commentaire'}
          </Button>
        </div>
      </Card>

      {/* Modal de mise à jour du progrès */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mettre à jour le progrès</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Progression (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newProgress}
                  onChange={(e) => setNewProgress(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>0%</span>
                  <span className="font-medium">{newProgress}%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Étape actuelle (optionnel)</label>
                <Input
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  placeholder="Ex: Révision en cours..."
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowProgressModal(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleProgressUpdate}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TaskTracker;
