// Types utilisateur
export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
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

// Types de tâches
export interface Task {
  id: number;
  user_id: string;
  title: string;
  description: string;
  category: 'local' | 'remote';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_duration: number; // en heures
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
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
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
  type: 'new_message' | 'task_update' | 'proximity_alert' | 'reminder' | 'rating_received' | 'system_alert';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
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
  createConversation: (participantIds: string[]) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
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
export type TabType = 'home' | 'map' | 'add' | 'wallet' | 'profile';

// Types d'onboarding
export interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: string;
}
