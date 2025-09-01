// Types utilisateur
export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  credits: number;
  created_at: string;
}

// Types de compétences
export interface Skill {
  id: number;
  user_id: string;
  skill_name: string;
}

// Types d'objets
export interface Item {
  id: number;
  user_id: string;
  item_name: string;
  description?: string;
  available: boolean;
}

// Types de tâches étendus pour le suivi complet
export interface Task {
  id: number;
  user_id: string;
  title: string;
  description: string;
  category: 'local' | 'remote';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold' | 'review';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_duration: number; // en heures
  actual_duration?: number; // en heures
  location: string;
  latitude?: number;
  longitude?: number;
  required_skills: string[];
  budget_credits: number;
  deadline?: string;
  tags: string[];
  created_at: string;
  updated_at?: string;
  assigned_to?: string;
  completion_date?: string;
  rating?: number;
  feedback?: string;
  
  // Nouvelles propriétés pour le suivi
  progress_percentage: number; // 0-100
  current_step?: string;
  total_steps?: number;
  completed_steps?: number;
  time_spent?: number; // en minutes

  is_overdue: boolean;
  complexity: 'simple' | 'moderate' | 'complex';
  dependencies?: number[]; // IDs des tâches dépendantes
  parent_task_id?: number; // Pour les sous-tâches
  subtasks?: Task[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  history?: TaskHistoryEntry[];
  metrics?: TaskMetrics;
}

// Nouveaux types pour le suivi avancé
export interface TaskAttachment {
  id: string;
  task_id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
  description?: string;
}

export interface TaskComment {
  id: string;
  task_id: number;
  user_id: string;
  content: string;
  type: 'comment' | 'progress_update' | 'issue_report' | 'solution';
  created_at: string;
  updated_at?: string;
  is_internal: boolean; // Pour les commentaires privés
  attachments?: string[]; // IDs des pièces jointes
}

export interface TaskHistoryEntry {
  id: string;
  task_id: number;
  user_id: string;
  action: 'created' | 'updated' | 'status_changed' | 'assigned' | 'commented' | 'time_logged' | 'completed';
  details: string;
  timestamp: string;
  old_value?: any;
  new_value?: any;
}

export interface TaskMetrics {
  id: string;
  task_id: number;
  total_time_spent: number; // en minutes
  time_estimate_accuracy: number; // pourcentage
  completion_rate: number; // pourcentage
  quality_score?: number; // 1-10
  efficiency_score?: number; // 1-10
  collaboration_score?: number; // 1-10
  last_calculated: string;
}

// Types pour le tableau de bord et le suivi
export interface TaskDashboard {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  upcoming_deadlines: Task[];
  recent_activity: TaskHistoryEntry[];
  performance_metrics: {
    completion_rate: number;
    average_completion_time: number;
    on_time_completion_rate: number;
    quality_average: number;
  };
}

export interface TaskFilter {
  status?: Task['status'][];
  priority?: Task['priority'][];
  category?: Task['category'][];
  assigned_to?: string;
  created_by?: string;
  date_range?: {
    start: string;
    end: string;
  };
  skills?: string[];
  tags?: string[];
  location_radius?: number; // en km
  budget_range?: {
    min: number;
    max: number;
  };
  complexity?: Task['complexity'][];
}

export interface TaskSort {
  field: 'created_at' | 'updated_at' | 'deadline' | 'priority' | 'progress' | 'budget_credits' | 'estimated_duration';
  direction: 'asc' | 'desc';
}

// Types de transactions
export interface Transaction {
  id: number;
  sender_id: string;
  receiver_id: string;
  credits: number;
  task_id?: number;
  created_at: string;
}

// Types de messages
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: string;
  isRead: boolean;
  attachments?: Attachment[];
  edited?: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
}

export interface Attachment {
  id: string;
  messageId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar_url?: string;
  online: boolean;
  lastSeen?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'new_message' | 'task_update' | 'proximity_alert' | 'reminder' | 'rating_received' | 'system_alert' | 'deadline_approaching' | 'task_assigned' | 'progress_update';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  priority: 'low' | 'medium' | 'high';
  action_url?: string;
}

export interface MessageStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  
  // Actions
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, receiverId: string, type?: 'text' | 'image' | 'file', attachments?: File[]) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  createConversation: (participantIds: string[]) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  toggleConversationFavorite: (conversationId: string) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  updateUnreadCount: () => void;
}

// Types d'authentification
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Types de navigation
export type TabType = 'home' | 'map' | 'add' | 'wallet' | 'profile' | 'dashboard';

// Types d'onboarding
export interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: string;
}

// Types pour le système d'offres d'aide
export interface HelpOffer {
  id: string;
  task_id: number;
  helper_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message?: string;
  proposed_duration?: number;
  proposed_credits?: number;
  created_at: string;
  updated_at: string;
  responded_at?: string;
  response_message?: string;
  
  // Relations
  helper?: User;
  task?: Task;
}

export interface HelpOfferNotification {
  id: string;
  help_offer_id: string;
  user_id: string;
  type: 'new_offer' | 'offer_accepted' | 'offer_rejected' | 'offer_cancelled';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  
  // Relations
  help_offer?: HelpOffer;
}