import { STATUS_COLORS, PRIORITY_COLORS, COMPLEXITY_COLORS, PROGRESS_COLORS } from './constants';

// Utilitaires pour le Dashboard

export const getProgressColor = (percentage: number): string => {
  if (percentage < 30) return PROGRESS_COLORS.low;
  if (percentage < 70) return PROGRESS_COLORS.medium;
  return PROGRESS_COLORS.high;
};

export const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.open;
};

export const getPriorityColor = (priority: string): string => {
  return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium;
};

export const getComplexityColor = (complexity: string): string => {
  return COMPLEXITY_COLORS[complexity as keyof typeof COMPLEXITY_COLORS] || COMPLEXITY_COLORS.simple;
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'À l\'instant';
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
  
  return formatDate(past);
};

export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const calculateCompletionRate = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const getTaskStatusIcon = (status: string): string => {
  const icons = {
    open: 'Square',
    in_progress: 'Play',
    completed: 'CheckCircle',
    cancelled: 'Minus',
    on_hold: 'Pause',
    review: 'Eye'
  };
  return icons[status as keyof typeof icons] || 'Square';
};

export const isTaskCompleted = (status: string): boolean => {
  return status === 'completed';
};

export const isTaskOverdue = (deadline: string | null, status: string): boolean => {
  if (!deadline || status === 'completed') return false;
  return new Date(deadline) < new Date();
};
