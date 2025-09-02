// Store Zustand temporaire pour le système de matching intelligent
// Version qui évite les erreurs 406 en attendant la migration
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { 
  UserProfile, 
  TaskMatchingProfile, 
  MatchResult, 
  Recommendation, 
  ProximityAlert,
  MatchingDashboard,
  MatchingSettings,
  SmartNotification,
  UserPreferences,
  UserAvailability
} from '@/types/matching';


interface MatchingStore {
  // État
  userProfile: UserProfile | null;
  recommendations: Recommendation[];
  proximityAlerts: ProximityAlert[];
  recentMatches: MatchResult[];
  matchingSettings: MatchingSettings | null;
  smartNotifications: SmartNotification[];
  dashboard: MatchingDashboard | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions principales
  initializeMatching: (userId: string) => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  generateRecommendations: () => Promise<void>;
  generateProximityAlerts: () => Promise<void>;
  
  // Actions de matching
  findBestTasksForUser: (userId: string) => Promise<MatchResult[]>;
  calculateCompatibility: (userId: string, taskId: number) => Promise<MatchResult>;
  
  // Actions de recommandations
  acceptRecommendation: (recommendationId: string) => Promise<void>;
  dismissRecommendation: (recommendationId: string) => Promise<void>;
  markRecommendationAsViewed: (recommendationId: string) => Promise<void>;
  
  // Actions de notifications
  sendSmartNotification: (notification: Omit<SmartNotification, 'id' | 'created_at'>) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  
  // Actions de paramètres
  updateMatchingSettings: (settings: Partial<MatchingSettings>) => Promise<void>;
  toggleAutoMatching: (enabled: boolean) => Promise<void>;
  
  // Actions utilitaires
  refreshDashboard: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  
  // Méthodes de chargement de données
  loadUserProfile: (userId: string) => Promise<UserProfile>;
  loadMatchingSettings: (userId: string) => Promise<MatchingSettings>;
  loadRecommendations: (userId: string) => Promise<Recommendation[]>;
  loadProximityAlerts: (userId: string) => Promise<ProximityAlert[]>;
  loadRecentMatches: (userId: string) => Promise<MatchResult[]>;
  loadSmartNotifications: (userId: string) => Promise<SmartNotification[]>;
  loadAvailableTasks: () => Promise<any[]>;
  loadAvailableUsers: () => Promise<any[]>;
  loadTaskById: (taskId: number) => Promise<any>;
  
  // Méthodes utilitaires
  convertTaskToMatchingProfile: (task: any) => TaskMatchingProfile;
  generateDashboard: (userProfile: UserProfile) => Promise<MatchingDashboard>;
  calculateUserStats: (userId: string) => Promise<any>;
  getDefaultPreferences: () => UserPreferences;
  getDefaultAvailability: () => UserAvailability;
  getDefaultMatchingSettings: (userId: string) => MatchingSettings;
  startBackgroundServices: () => void;
  stopBackgroundServices: () => void;
}

export const useMatchingStore = create<MatchingStore>((set, get) => ({
  // État initial
  userProfile: null,
  recommendations: [],
  proximityAlerts: [],
  recentMatches: [],
  matchingSettings: null,
  smartNotifications: [],
  dashboard: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  // Initialisation du système de matching
  initializeMatching: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      // Charger le profil utilisateur (version simplifiée)
      const userProfile = await get().loadUserProfile(userId);
      
      // Charger les paramètres de matching (version simplifiée)
      const matchingSettings = await get().loadMatchingSettings(userId);

      // Charger les données de matching
      const [recommendations, proximityAlerts, recentMatches, smartNotifications] = await Promise.all([
        get().loadRecommendations(userId),
        get().loadProximityAlerts(userId),
        get().loadRecentMatches(userId),
        get().loadSmartNotifications(userId)
      ]);

      // Générer le tableau de bord
      const dashboard = await get().generateDashboard(userProfile);

      set({
        userProfile,
        matchingSettings,
        recommendations,
        proximityAlerts,
        recentMatches,
        smartNotifications,
        dashboard,
        isInitialized: true,
        isLoading: false
      });

      // Démarrer les services en arrière-plan
      get().startBackgroundServices();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      set({ 
        error: 'Erreur lors de l\'initialisation du système de matching',
        isLoading: false 
      });
    }
  },

  // Chargement du profil utilisateur (version simplifiée)
  loadUserProfile: async (userId: string): Promise<UserProfile> => {
    try {
      // Récupérer les données utilisateur de base
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Créer un profil utilisateur par défaut (temporaire)
      const userProfile: UserProfile = {
        id: userData.id,
        display_name: userData.display_name || userData.email,
        email: userData.email,
        avatar_url: userData.avatar_url,
        location: userData.location,
        latitude: userData.latitude,
        longitude: userData.longitude,
        bio: userData.bio,
        created_at: userData.created_at,
        skills: [],
        certifications: [],
        preferences: get().getDefaultPreferences(),
        stats: {
          total_tasks_completed: 0,
          total_tasks_created: 0,
          total_hours_volunteered: 0,
          average_rating: 0,
          response_time_minutes: 60,
          completion_rate: 0,
          reliability_score: 0,
          last_active: new Date().toISOString(),
          streak_days: 0
        },
        availability: get().getDefaultAvailability(),
        reputation_score: 50,
        trust_level: 'new',
        badges: []
      };

      return userProfile;
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      throw error;
    }
  },

  // Chargement des paramètres de matching (version simplifiée)
  loadMatchingSettings: async (userId: string): Promise<MatchingSettings> => {
    // Retourner les paramètres par défaut en attendant la migration
    return get().getDefaultMatchingSettings(userId);
  },

  // Chargement des recommandations (version simplifiée)
  loadRecommendations: async (_userId: string): Promise<Recommendation[]> => {
    // Retourner un tableau vide en attendant la migration
    return [];
  },

  // Chargement des alertes de proximité (version simplifiée)
  loadProximityAlerts: async (_userId: string): Promise<ProximityAlert[]> => {
    // Retourner un tableau vide en attendant la migration
    return [];
  },

  // Chargement des matches récents (version simplifiée)
  loadRecentMatches: async (_userId: string): Promise<MatchResult[]> => {
    // Retourner un tableau vide en attendant la migration
    return [];
  },

  // Chargement des notifications intelligentes (version simplifiée)
  loadSmartNotifications: async (_userId: string): Promise<SmartNotification[]> => {
    // Retourner un tableau vide en attendant la migration
    return [];
  },

  // Chargement des tâches disponibles
  loadAvailableTasks: async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
      return [];
    }
  },

  // Chargement des utilisateurs disponibles
  loadAvailableUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      return [];
    }
  },

  // Chargement d'une tâche par ID
  loadTaskById: async (taskId: number) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement de la tâche:', error);
      throw error;
    }
  },

  // Conversion d'une tâche en profil de matching
  convertTaskToMatchingProfile: (task: any): TaskMatchingProfile => ({
    id: task.id,
    title: task.title,
    description: task.description,
    location: task.location,
    latitude: task.latitude,
    longitude: task.longitude,
    category: task.category || 'general',
    budget_credits: task.budget_credits || 0,
    estimated_duration: task.estimated_duration || 60,
    priority: task.priority || 'medium',
    complexity: task.complexity || 'moderate',
    required_skills: task.required_skills || [],
    user_id: task.user_id,
    created_at: task.created_at,
    updated_at: task.updated_at
  }),

  // Génération du tableau de bord
  generateDashboard: async (userProfile: UserProfile): Promise<MatchingDashboard> => {
    return {
      user_profile: userProfile,
      recent_matches: [],
      pending_recommendations: [],
      proximity_alerts: [],
      response_time: 0,
      success_rate: 0
    };
  },

  // Calcul des statistiques utilisateur
  calculateUserStats: async (_userId: string) => {
    return {
      totalRecommendations: 0,
      unreadRecommendations: 0,
      totalAlerts: 0,
      unreadAlerts: 0,
      totalNotifications: 0,
      unreadNotifications: 0
    };
  },

  // Actions de recommandations (version simplifiée)
  acceptRecommendation: async (recommendationId: string) => {
    console.log('Accepter recommandation:', recommendationId);
  },

  dismissRecommendation: async (recommendationId: string) => {
    console.log('Rejeter recommandation:', recommendationId);
  },

  markRecommendationAsViewed: async (recommendationId: string) => {
    console.log('Marquer recommandation comme vue:', recommendationId);
  },

  // Actions de notifications (version simplifiée)
  sendSmartNotification: async (notification: Omit<SmartNotification, 'id' | 'created_at'>) => {
    console.log('Envoyer notification:', notification);
  },

  markNotificationAsRead: async (notificationId: string) => {
    console.log('Marquer notification comme lue:', notificationId);
  },

  clearAllNotifications: async () => {
    console.log('Effacer toutes les notifications');
  },

  // Actions de paramètres (version simplifiée)
  updateMatchingSettings: async (settings: Partial<MatchingSettings>) => {
    console.log('Mettre à jour les paramètres:', settings);
  },

  toggleAutoMatching: async (enabled: boolean) => {
    console.log('Basculer le matching automatique:', enabled);
  },

  // Actions de matching (version simplifiée)
  findBestTasksForUser: async (_userId: string): Promise<MatchResult[]> => {
    return [];
  },

  calculateCompatibility: async (userId: string, taskId: number): Promise<MatchResult> => {
    return {
      user_id: userId,
      task_id: taskId,
      compatibility_score: 0,
      match_breakdown: {
        proximity_score: 0,
        skill_match_score: 0,
        availability_score: 0,
        reputation_score: 0,
        budget_score: 0,
        response_time_score: 0,
        history_score: 0
      },
      reasons: [],
      recommendations: [],
      created_at: new Date().toISOString()
    };
  },

  // Actions manquantes
  updateUserProfile: async (profile: Partial<UserProfile>) => {
    console.log('Mettre à jour le profil:', profile);
  },

  generateRecommendations: async () => {
    console.log('Générer des recommandations');
  },

  generateProximityAlerts: async () => {
    console.log('Générer des alertes de proximité');
  },

  // Actions utilitaires
  refreshDashboard: async () => {
    console.log('Actualiser le tableau de bord');
  },

  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),

  // Méthodes par défaut
  getDefaultPreferences: () => ({
    max_distance_km: 10,
    preferred_categories: [],
    preferred_time_slots: [],
    min_task_budget: 0,
    notification_settings: {
      proximity_alerts: true,
      skill_matches: true,
      urgent_tasks: true,
      new_messages: true,
      task_updates: true,
      email_notifications: true,
      push_notifications: true
    },
    language_preference: 'fr',
    communication_style: 'friendly'
  }),

  getDefaultAvailability: () => ({
    is_available: true,
    next_available: new Date().toISOString(),
    current_status: 'available',
    auto_accept_radius: 5,
    auto_accept_categories: []
  }),

  getDefaultMatchingSettings: (userId: string): MatchingSettings => ({
    user_id: userId,
    auto_matching_enabled: true,
    max_daily_recommendations: 10,
    min_compatibility_score: 0.4,
    max_distance_km: 10,
    preferred_categories: [],
    blacklisted_categories: [],
    notification_frequency: 'hourly',
    learning_mode: true,
    privacy_level: 'public'
  }),

  startBackgroundServices: () => {
    console.log('Services de matching démarrés');
  },

  stopBackgroundServices: () => {
    console.log('Services de matching arrêtés');
  }
}));
