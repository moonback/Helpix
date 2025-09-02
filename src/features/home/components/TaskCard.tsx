import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  DollarSign, 
  Target,
  MapPin,
  Globe,
  Compass,
  Eye,
  Edit,
  Hand,
  MessageCircle,
  UserCheck,
  Award,
  Calendar
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SafeImage from '@/components/ui/SafeImage';
import { calculateDistance, formatDistance } from '@/lib/utils';

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
  images?: string[];
}

interface TaskCardProps {
  task: Task;
  user: any;
  viewMode: 'grid' | 'list';
  latitude?: number;
  longitude?: number;
  onViewTask: (taskId: number) => void;
  onEdit: (taskId: number) => void;
  onHelp: (taskId: number) => void;
  onRequest: (taskId: number) => void;
  onNavigate: (path: string) => void;
  prefersReducedMotion: boolean;
  index: number;
}

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

const TaskCard: React.FC<TaskCardProps> = React.memo(({
  task,
  user,
  viewMode,
  latitude,
  longitude,
  onViewTask,
  onEdit,
  onHelp,
  onRequest,
  onNavigate,
  prefersReducedMotion,
  index
}) => {
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: prefersReducedMotion ? 0 : index * 0.05, duration: prefersReducedMotion ? 0 : 0.4 }}
      layout
    >
      <Card className={`group relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all duration-300 ${
        viewMode === 'grid' ? 'p-4' : 'p-6'
      }`}>
        {/* Priority Indicator */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
          task.priority === 'urgent' ? 'from-red-500 to-red-600' :
          task.priority === 'high' ? 'from-orange-500 to-orange-600' :
          task.priority === 'medium' ? 'from-yellow-500 to-yellow-600' :
          'from-green-500 to-green-600'
        }`}></div>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1 min-w-0">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-xl">{categoryIcons[task.category]}</span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-sm ${
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
                className="text-base font-bold text-slate-800 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => onViewTask(task.id)}
              >
                {task.title}
              </h3>
              <div className="flex items-center flex-wrap gap-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${priorityColors[task.priority]}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
                <span className="text-xs text-slate-500 flex items-center">
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
                {task.category === 'local' && latitude && longitude && task.latitude && task.longitude && (
                  <span className="text-xs text-emerald-600 flex items-center font-medium">
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
              onClick={() => onViewTask(task.id)}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
              aria-label="Voir les détails de la tâche"
            >
              <Eye className="w-4 h-4" />
            </Button>
            {user && task.user_id === user.id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task.id)}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                aria-label="Éditer la tâche"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-sm mb-6 leading-relaxed line-clamp-3">
          {task.description}
        </p>

        {/* Images */}
        {task.images && task.images.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {task.images.slice(0, 3).map((image, index) => (
                <div key={index} className="flex-shrink-0">
                  <SafeImage
                    src={image}
                    alt={`Image ${index + 1} de la tâche`}
                    className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                    fallbackIcon={<div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center">
                      <span className="text-slate-400 text-xs">📷</span>
                    </div>}
                  />
                </div>
              ))}
              {task.images.length > 3 && (
                <div className="flex-shrink-0 w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                  <span className="text-slate-500 text-xs font-medium">
                    +{task.images.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-700">{task.estimated_duration}h</div>
                <div className="text-[10px] text-slate-500">Durée estimée</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-700">{task.budget_credits}</div>
                <div className="text-[10px] text-slate-500">Crédits</div>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 rounded-xl p-3">
            <MapPin className="w-3 h-3 text-red-500" />
            <span className="font-medium truncate">{task.location}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <h4 className="text-[10px] font-semibold text-slate-700 mb-2 flex items-center">
            <Target className="w-3 h-3 mr-1 text-purple-600" />
            Compétences
          </h4>
          <div className="flex flex-wrap gap-1">
            {task.required_skills.slice(0, viewMode === 'grid' ? 2 : 3).map((skill, skillIndex) => (
              <span
                key={skillIndex}
                className="inline-flex items-center px-1.5 py-0.5 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 text-[10px] font-medium rounded-full border border-purple-200"
              >
                {skill}
              </span>
            ))}
            {task.required_skills.length > (viewMode === 'grid' ? 2 : 3) && (
              <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-full">
                +{task.required_skills.length - (viewMode === 'grid' ? 2 : 3)}
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, viewMode === 'grid' ? 2 : 4).map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="inline-flex items-center px-1 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] rounded-full cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
              {task.tags.length > (viewMode === 'grid' ? 2 : 4) && (
                <span className="inline-flex items-center px-1 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-full">
                  +{task.tags.length - (viewMode === 'grid' ? 2 : 4)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions - Améliorées pour le responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {user && task.user_id !== user.id ? (
              <>
                <Button
                  onClick={() => onHelp(task.id)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 sm:px-6 py-2 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 touch-target"
                  aria-label="Offrir de l'aide"
                >
                  <Hand className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Offrir de l'aide</span>
                  <span className="sm:hidden">Aider</span>
                </Button>
                <Button
                  onClick={() => onRequest(task.id)}
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 px-4 sm:px-6 py-2 rounded-2xl transition-all duration-200 touch-target"
                  aria-label="Contacter le demandeur"
                >
                  <MessageCircle className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Contacter</span>
                  <span className="sm:hidden">💬</span>
                </Button>
              </>
            ) : !user ? (
              <Button
                onClick={() => onNavigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 py-2 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 touch-target"
                aria-label="Se connecter pour aider"
              >
                <UserCheck className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Se connecter pour aider</span>
                <span className="sm:hidden">Se connecter</span>
              </Button>
            ) : (
              <div className="text-xs text-slate-500 italic flex items-center">
                <Award className="w-3 h-3 mr-2" />
                Votre tâche
              </div>
            )}
          </div>
          
          <div className="text-left sm:text-right text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <Calendar className="w-3 h-3" />
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
  );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;
