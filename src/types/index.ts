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
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
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
