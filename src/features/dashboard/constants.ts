// Constantes pour le Dashboard
export const STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  on_hold: 'bg-orange-100 text-orange-800 border-orange-200',
  review: 'bg-purple-100 text-purple-800 border-purple-200'
} as const;

export const PRIORITY_COLORS = {
  low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
} as const;

export const COMPLEXITY_COLORS = {
  simple: 'bg-green-100 text-green-800 border-green-200',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  complex: 'bg-red-100 text-red-800 border-red-200'
} as const;

export const PROGRESS_COLORS = {
  low: 'bg-red-500',      // < 30%
  medium: 'bg-yellow-500', // 30-70%
  high: 'bg-green-500'     // > 70%
} as const;

export const STATUS_LABELS = {
  open: 'Ouvertes',
  in_progress: 'En cours',
  completed: 'Terminées',
  cancelled: 'Annulées',
  on_hold: 'En attente',
  review: 'En révision'
} as const;

export const PRIORITY_LABELS = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée',
  urgent: 'Urgente'
} as const;

export const COMPLEXITY_LABELS = {
  simple: 'Simple',
  moderate: 'Modérée',
  complex: 'Complexe'
} as const;

export const FILTER_OPTIONS = {
  status: Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
  priority: Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label })),
  complexity: Object.entries(COMPLEXITY_LABELS).map(([value, label]) => ({ value, label }))
} as const;

export const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date de création' },
  { value: 'updated_at', label: 'Dernière modification' },
  { value: 'deadline', label: 'Échéance' },
  { value: 'priority', label: 'Priorité' },
  { value: 'progress_percentage', label: 'Progression' },
  { value: 'budget_credits', label: 'Budget' },
  { value: 'estimated_duration', label: 'Durée estimée' }
] as const;

export const VIEW_TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: 'BarChart3' },
  { id: 'tasks', label: 'Toutes les tâches', icon: 'FileText' },
  { id: 'analytics', label: 'Analytics', icon: 'TrendingUp' }
] as const;
