// Store Zustand pour le système de matching intelligent
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
import { Task } from '@/types';
import { MatchingAlgorithm, RecommendationService } from '@/lib/matchingAlgorithm';

interface MatchingStore {
  // État
  userProfile: UserProfile | null;
  recommendations: Recommendation[];
  proximityAlerts: ProximityAlert[];
  recentMatches: MatchResult[];
  matchingSettings: MatchingSettings | null;
  smartNotifications: SmartNotification[];
  dashboard: MatchingDashboard | null;
  
  // État de chargement
  isLoading: boolean;
  error: string | null;
  
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

  // Initialisation du système de matching
  initializeMatching: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Charger le profil utilisateur
      const userProfile = await get().loadUserProfile(userId);
      if (!userProfile) {
        throw new Error('Profil utilisateur non trouvé');
      }
      
      // Charger les paramètres de matching
      const matchingSettings = await get().loadMatchingSettings(userId);
      
      // Charger les données existantes
      const [recommendations, proximityAlerts, recentMatches, smartNotifications] = await Promise.all([
        get().loadRecommendations(userId),
        get().loadProximityAlerts(userId),
        get().loadRecentMatches(userId),
        get().loadSmartNotifications(userId)
      ]);
      
      // Générer le dashboard
      const dashboard = await get().generateDashboard(userProfile);
      
      set({
        userProfile,
        matchingSettings,
        recommendations,
        proximityAlerts,
        recentMatches,
        smartNotifications,
        dashboard
      });
      
      // Démarrer les services en arrière-plan
      if (matchingSettings?.auto_matching_enabled) {
        get().startBackgroundServices();
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du matching:', error);
      set({ error: 'Erreur lors de l\'initialisation du système de matching' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Chargement du profil utilisateur
  loadUserProfile: async (userId: string): Promise<UserProfile> => {
    try {
      // Récupérer les données utilisateur de base
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Récupérer les compétences
      const { data: skills, error: skillsError } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId);

      if (skillsError) throw skillsError;

      // Récupérer les certifications
      const { data: certifications, error: certError } = await supabase
        .from('user_certifications')
        .select('*')
        .eq('user_id', userId);

      if (certError) throw certError;

      // Récupérer les badges
      const { data: badges, error: badgesError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);

      if (badgesError) throw badgesError;

      // Calculer les statistiques
      const stats = await get().calculateUserStats(userId);

      // Créer le profil complet
      const userProfile: UserProfile = {
        id: userData.id,
        display_name: userData.display_name || userData.name,
        email: userData.email,
        avatar_url: userData.avatar_url,
        location: userData.location,
        latitude: userData.latitude,
        longitude: userData.longitude,
        bio: userData.bio,
        created_at: userData.created_at,
        skills: skills || [],
        certifications: certifications || [],
        preferences: userData.preferences || get().getDefaultPreferences(),
        stats,
        availability: userData.availability || get().getDefaultAvailability(),
        reputation_score: userData.reputation_score || 50,
        trust_level: userData.trust_level || 'new',
        badges: badges || []
      };

      return userProfile;
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      return null;
    }
  },

  // Chargement des paramètres de matching
  loadMatchingSettings: async (userId: string): Promise<MatchingSettings> => {
    try {
      const { data, error } = await supabase
        .from('matching_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Pas d'erreur si pas de données
        throw error;
      }

      return data || get().getDefaultMatchingSettings(userId);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      return get().getDefaultMatchingSettings(userId);
    }
  },

  // Chargement des recommandations
  loadRecommendations: async (userId: string): Promise<Recommendation[]> => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_dismissed', false)
        .gt('expires_at', new Date().toISOString())
        .order('score', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error);
      return [];
    }
  },

  // Chargement des alertes de proximité
  loadProximityAlerts: async (userId: string): Promise<ProximityAlert[]> => {
    try {
      const { data, error } = await supabase
        .from('proximity_alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_viewed', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error);
      return [];
    }
  },

  // Chargement des matches récents
  loadRecentMatches: async (userId: string): Promise<MatchResult[]> => {
    try {
      const { data, error } = await supabase
        .from('matching_history')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des matches:', error);
      return [];
    }
  },

  // Chargement des notifications intelligentes
  loadSmartNotifications: async (userId: string): Promise<SmartNotification[]> => {
    try {
      const { data, error } = await supabase
        .from('smart_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      return [];
    }
  },

  // Génération des recommandations
  generateRecommendations: async () => {
    try {
      const { userProfile } = get();
      if (!userProfile) return;

      // Récupérer les tâches disponibles
      const tasks = await get().loadAvailableTasks();
      const taskProfiles = tasks.map(get().convertTaskToMatchingProfile);

      // Générer les recommandations
      const recommendations = RecommendationService.generateRecommendations(
        userProfile,
        taskProfiles,
        10
      );

      // Sauvegarder en base
      if (recommendations.length > 0) {
        const { error } = await supabase
          .from('recommendations')
          .upsert(recommendations);

        if (error) throw error;
      }

      set({ recommendations });
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations:', error);
      set({ error: 'Erreur lors de la génération des recommandations' });
    }
  },

  // Génération des alertes de proximité
  generateProximityAlerts: async () => {
    try {
      const { userProfile } = get();
      if (!userProfile || !userProfile.latitude || !userProfile.longitude) return;

      // Récupérer les tâches récentes
      const tasks = await get().loadAvailableTasks();
      const taskProfiles = tasks.map(get().convertTaskToMatchingProfile);

      // Générer les alertes
      const alerts = MatchingAlgorithm.generateProximityAlerts(
        userProfile,
        taskProfiles,
        userProfile.preferences.max_distance_km
      );

      // Sauvegarder en base
      if (alerts.length > 0) {
        const { error } = await supabase
          .from('proximity_alerts')
          .upsert(alerts);

        if (error) throw error;
      }

      set({ proximityAlerts: alerts });
    } catch (error) {
      console.error('Erreur lors de la génération des alertes:', error);
    }
  },

  // Trouver les meilleurs matches pour une tâche
  findBestMatchesForTask: async (taskId: number): Promise<MatchResult[]> => {
    try {
      // Récupérer la tâche
      const task = await get().loadTaskById(taskId);
      if (!task) return [];

      const taskProfile = get().convertTaskToMatchingProfile(task);

      // Récupérer les utilisateurs disponibles
      const users = await get().loadAvailableUsers();
      const userProfiles = await Promise.all(
        users.map(user => get().loadUserProfile(user.id))
      );

      const validProfiles = userProfiles.filter(Boolean) as UserProfile[];

      // Calculer les matches
      const matches = MatchingAlgorithm.findBestMatches(taskProfile, validProfiles, 10);

      return matches;
    } catch (error) {
      console.error('Erreur lors de la recherche de matches:', error);
      return [];
    }
  },

  // Trouver les meilleures tâches pour un utilisateur
  findBestTasksForUser: async (userId: string): Promise<MatchResult[]> => {
    try {
      const userProfile = await get().loadUserProfile(userId);
      if (!userProfile) return [];

      const tasks = await get().loadAvailableTasks();
      const taskProfiles = tasks.map(get().convertTaskToMatchingProfile);

      const matches = MatchingAlgorithm.findBestTasksForUser(userProfile, taskProfiles, 20);

      return matches;
    } catch (error) {
      console.error('Erreur lors de la recherche de tâches:', error);
      return [];
    }
  },

  // Calculer la compatibilité
  calculateCompatibility: async (userId: string, taskId: number): Promise<MatchResult> => {
    try {
      const [userProfile, task] = await Promise.all([
        get().loadUserProfile(userId),
        get().loadTaskById(taskId)
      ]);

      if (!userProfile || !task) {
        throw new Error('Utilisateur ou tâche non trouvé');
      }

      const taskProfile = get().convertTaskToMatchingProfile(task);
      return MatchingAlgorithm.calculateCompatibility(userProfile, taskProfile);
    } catch (error) {
      console.error('Erreur lors du calcul de compatibilité:', error);
      throw error;
    }
  },

  // Accepter une recommandation
  acceptRecommendation: async (recommendationId: string) => {
    try {
      const { error } = await supabase
        .from('recommendations')
        .update({ is_accepted: true, is_dismissed: false })
        .eq('id', recommendationId);

      if (error) throw error;

      // Mettre à jour l'état local
      set(state => ({
        recommendations: state.recommendations.map(rec =>
          rec.id === recommendationId ? { ...rec, is_accepted: true, is_dismissed: false } : rec
        )
      }));
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
      set({ error: 'Erreur lors de l\'acceptation de la recommandation' });
    }
  },

  // Rejeter une recommandation
  dismissRecommendation: async (recommendationId: string) => {
    try {
      const { error } = await supabase
        .from('recommendations')
        .update({ is_dismissed: true, is_accepted: false })
        .eq('id', recommendationId);

      if (error) throw error;

      // Mettre à jour l'état local
      set(state => ({
        recommendations: state.recommendations.map(rec =>
          rec.id === recommendationId ? { ...rec, is_dismissed: true, is_accepted: false } : rec
        )
      }));
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      set({ error: 'Erreur lors du rejet de la recommandation' });
    }
  },

  // Marquer une recommandation comme vue
  markRecommendationAsViewed: async (recommendationId: string) => {
    try {
      const { error } = await supabase
        .from('recommendations')
        .update({ is_viewed: true })
        .eq('id', recommendationId);

      if (error) throw error;

      // Mettre à jour l'état local
      set(state => ({
        recommendations: state.recommendations.map(rec =>
          rec.id === recommendationId ? { ...rec, is_viewed: true } : rec
        )
      }));
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
    }
  },

  // Envoyer une notification intelligente
  sendSmartNotification: async (notification: Omit<SmartNotification, 'id' | 'created_at'>) => {
    try {
      const newNotification: SmartNotification = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('smart_notifications')
        .insert([newNotification]);

      if (error) throw error;

      // Mettre à jour l'état local
      set(state => ({
        smartNotifications: [newNotification, ...state.smartNotifications]
      }));
    } catch (error) {
      console.error('Erreur lors de l\'envoi de notification:', error);
    }
  },

  // Marquer une notification comme lue
  markNotificationAsRead: async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('smart_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Mettre à jour l'état local
      set(state => ({
        smartNotifications: state.smartNotifications.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      }));
    } catch (error) {
      console.error('Erreur lors du marquage de notification:', error);
    }
  },

  // Effacer toutes les notifications
  clearAllNotifications: async () => {
    try {
      const { userProfile } = get();
      if (!userProfile) return;

      const { error } = await supabase
        .from('smart_notifications')
        .update({ is_read: true })
        .eq('user_id', userProfile.id);

      if (error) throw error;

      set({ smartNotifications: [] });
    } catch (error) {
      console.error('Erreur lors de l\'effacement:', error);
    }
  },

  // Mettre à jour les paramètres de matching
  updateMatchingSettings: async (settings: Partial<MatchingSettings>) => {
    try {
      const { userProfile } = get();
      if (!userProfile) return;

      const currentSettings = get().matchingSettings || get().getDefaultMatchingSettings(userProfile.id);
      const updatedSettings = { ...currentSettings, ...settings, user_id: userProfile.id };

      const { error } = await supabase
        .from('matching_settings')
        .upsert(updatedSettings);

      if (error) throw error;

      set({ matchingSettings: updatedSettings });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      set({ error: 'Erreur lors de la mise à jour des paramètres' });
    }
  },

  // Activer/désactiver le matching automatique
  toggleAutoMatching: async (enabled: boolean) => {
    await get().updateMatchingSettings({ auto_matching_enabled: enabled });
    
    if (enabled) {
      get().startBackgroundServices();
    } else {
      get().stopBackgroundServices();
    }
  },

  // Rafraîchir le dashboard
  refreshDashboard: async () => {
    try {
      const { userProfile } = get();
      if (!userProfile) return;

      const dashboard = await get().generateDashboard(userProfile);
      set({ dashboard });
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    }
  },

  // Services en arrière-plan
  startBackgroundServices: () => {
    // Générer des recommandations toutes les heures
    const recommendationInterval = setInterval(() => {
      get().generateRecommendations();
    }, 60 * 60 * 1000);

    // Générer des alertes de proximité toutes les 30 minutes
    const proximityInterval = setInterval(() => {
      get().generateProximityAlerts();
    }, 30 * 60 * 1000);

    // Stocker les intervalles pour les arrêter plus tard
    (get() as any).intervals = { recommendationInterval, proximityInterval };
  },

  stopBackgroundServices: () => {
    const intervals = (get() as any).intervals;
    if (intervals) {
      clearInterval(intervals.recommendationInterval);
      clearInterval(intervals.proximityInterval);
      (get() as any).intervals = null;
    }
  },

  // Méthodes utilitaires
  loadAvailableTasks: async (): Promise<Task[]> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
      return [];
    }
  },

  loadAvailableUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, latitude, longitude, availability')
        .eq('availability->is_available', true)
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      return [];
    }
  },

  loadTaskById: async (taskId: number): Promise<Task | null> => {
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
      return null;
    }
  },

  convertTaskToMatchingProfile: (task: Task): TaskMatchingProfile => {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      required_skills: task.required_skills,
      budget_credits: task.budget_credits,
      estimated_duration: task.estimated_duration,
      deadline: task.deadline,
      location: task.location,
      latitude: task.latitude,
      longitude: task.longitude,
      created_at: task.created_at,
      user_id: task.user_id,
      complexity: task.complexity || 'moderate',
      urgency_level: task.priority === 'urgent' ? 9 : task.priority === 'high' ? 7 : task.priority === 'medium' ? 5 : 3,
      skill_requirements: task.required_skills.map(skill => ({
        skill_name: skill,
        category: 'other' as any,
        required_level: 'intermediate' as any,
        is_mandatory: true,
        weight: 1.0
      }))
    };
  },

  calculateUserStats: async (userId: string) => {
    try {
      // Récupérer les statistiques depuis la base de données
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || {
        total_tasks_completed: 0,
        total_tasks_created: 0,
        total_hours_volunteered: 0,
        average_rating: 0,
        response_time_minutes: 60,
        completion_rate: 0,
        reliability_score: 0,
        last_active: new Date().toISOString(),
        streak_days: 0
      };
    } catch (error) {
      console.error('Erreur lors du calcul des stats:', error);
      return {
        total_tasks_completed: 0,
        total_tasks_created: 0,
        total_hours_volunteered: 0,
        average_rating: 0,
        response_time_minutes: 60,
        completion_rate: 0,
        reliability_score: 0,
        last_active: new Date().toISOString(),
        streak_days: 0
      };
    }
  },

  generateDashboard: async (userProfile: UserProfile): Promise<MatchingDashboard> => {
    const stats = {
      total_matches: 0,
      successful_matches: 0,
      average_compatibility: 0,
      response_rate: 0,
      completion_rate: userProfile.stats.completion_rate,
      top_skills: userProfile.skills.slice(0, 5).map(s => s.category),
      preferred_categories: userProfile.preferences.preferred_categories,
      average_distance: 0
    };

    return {
      user_profile: userProfile,
      recent_matches: get().recentMatches,
      pending_recommendations: get().recommendations,
      proximity_alerts: get().proximityAlerts,
      matching_stats: stats,
      skill_gaps: [],
      improvement_suggestions: []
    };
  },

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

  // Actions utilitaires
  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  

}));
