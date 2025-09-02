// Types pour le système de matching intelligent

export interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  bio?: string;
  created_at: string;
  
  // Compétences et expertise
  skills: UserSkill[];
  certifications: UserCertification[];
  preferences: UserPreferences;
  
  // Historique et performance
  stats: UserStats;
  availability: UserAvailability;
  
  // Réputation et confiance
  reputation_score: number;
  trust_level: 'new' | 'verified' | 'trusted' | 'expert';
  badges: UserBadge[];
}

export interface UserSkill {
  id: string;
  skill_name: string;
  category: SkillCategory;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified: boolean;
  experience_years?: number;
  certifications?: string[];
  created_at: string;
}

export type SkillCategory = 
  | 'home_improvement' | 'technology' | 'gardening' | 'cooking' | 'transportation'
  | 'education' | 'healthcare' | 'business' | 'art' | 'sports' | 'language'
  | 'maintenance' | 'cleaning' | 'organization' | 'communication' | 'other';

export interface UserCertification {
  id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  document_url?: string;
}

export interface UserPreferences {
  max_distance_km: number;
  preferred_categories: SkillCategory[];
  preferred_time_slots: TimeSlot[];
  min_task_budget: number;
  max_task_budget?: number;
  notification_settings: NotificationSettings;
  language_preference: string;
  communication_style: 'formal' | 'casual' | 'friendly';
}

export interface TimeSlot {
  day_of_week: number; // 0-6 (dimanche-samedi)
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
}

export interface NotificationSettings {
  proximity_alerts: boolean;
  skill_matches: boolean;
  urgent_tasks: boolean;
  new_messages: boolean;
  task_updates: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

export interface UserStats {
  total_tasks_completed: number;
  total_tasks_created: number;
  total_hours_volunteered: number;
  average_rating: number;
  response_time_minutes: number;
  completion_rate: number;
  reliability_score: number;
  last_active: string;
  streak_days: number;
}

export interface UserAvailability {
  is_available: boolean;
  next_available: string;
  current_status: 'available' | 'busy' | 'away' | 'offline';
  auto_accept_radius: number; // km
  auto_accept_categories: SkillCategory[];
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'achievement' | 'skill' | 'community' | 'special';
  earned_at: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Types pour le matching algorithm
export interface MatchingCriteria {
  user_id: string;
  task_id: number;
  proximity_weight: number; // 0-1
  skill_match_weight: number; // 0-1
  availability_weight: number; // 0-1
  reputation_weight: number; // 0-1
  budget_weight: number; // 0-1
  response_time_weight: number; // 0-1
  history_weight: number; // 0-1
}

export interface MatchResult {
  user_id: string;
  task_id: number;
  compatibility_score: number; // 0-100
  match_breakdown: MatchBreakdown;
  reasons: string[];
  recommendations: string[];
  created_at: string;
}

export interface MatchBreakdown {
  proximity_score: number;
  skill_match_score: number;
  availability_score: number;
  reputation_score: number;
  budget_score: number;
  response_time_score: number;
  history_score: number;
}

export interface TaskMatchingProfile {
  id: number;
  title: string;
  description: string;
  category: 'local' | 'remote';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  required_skills: string[];
  budget_credits: number;
  estimated_duration: number;
  deadline?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  user_id: string;
  
  // Profil de matching
  complexity: 'simple' | 'moderate' | 'complex';
  urgency_level: number; // 1-10
  skill_requirements: SkillRequirement[];
  preferred_helper_profile?: PreferredHelperProfile;
}

export interface SkillRequirement {
  skill_name: string;
  category: SkillCategory;
  required_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  is_mandatory: boolean;
  weight: number; // 0-1
}

export interface PreferredHelperProfile {
  min_reputation_score: number;
  min_completion_rate: number;
  max_response_time_minutes: number;
  preferred_certifications: string[];
  preferred_badges: string[];
  max_distance_km: number;
}

// Types pour les recommandations
export interface Recommendation {
  id: string;
  user_id: string;
  task_id: number;
  type: 'proximity' | 'skill_match' | 'urgency' | 'history' | 'budget';
  score: number;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  expires_at: string;
  is_viewed: boolean;
  is_accepted: boolean;
  is_dismissed: boolean;
}

export interface ProximityAlert {
  id: string;
  user_id: string;
  task_id: number;
  distance_km: number;
  created_at: string;
  is_sent: boolean;
  is_viewed: boolean;
}

// Types pour l'interface utilisateur
export interface MatchingDashboard {
  user_profile: UserProfile;
  recent_matches: MatchResult[];
  pending_recommendations: Recommendation[];
  proximity_alerts: ProximityAlert[];
  matching_stats: MatchingStats;
  skill_gaps: SkillGap[];
  improvement_suggestions: string[];
}

export interface MatchingStats {
  total_matches: number;
  successful_matches: number;
  average_compatibility: number;
  response_rate: number;
  completion_rate: number;
  top_skills: SkillCategory[];
  preferred_categories: SkillCategory[];
  average_distance: number;
}

export interface SkillGap {
  skill_name: string;
  category: SkillCategory;
  demand_level: 'low' | 'medium' | 'high';
  potential_earnings: number;
  learning_resources: string[];
}

// Types pour les notifications intelligentes
export interface SmartNotification {
  id: string;
  user_id: string;
  type: 'task_match' | 'proximity_alert' | 'skill_opportunity' | 'deadline_reminder';
  title: string;
  message: string;
  data: {
    task_id?: number;
    match_score?: number;
    distance_km?: number;
    skill_name?: string;
    deadline?: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  expires_at: string;
  is_read: boolean;
  action_url?: string;
}

// Types pour l'historique de matching
export interface MatchingHistory {
  id: string;
  user_id: string;
  task_id: number;
  action: 'viewed' | 'applied' | 'accepted' | 'rejected' | 'completed';
  compatibility_score: number;
  timestamp: string;
  notes?: string;
}

// Types pour les paramètres de matching
export interface MatchingSettings {
  user_id: string;
  auto_matching_enabled: boolean;
  max_daily_recommendations: number;
  min_compatibility_score: number;
  max_distance_km: number;
  preferred_categories: SkillCategory[];
  blacklisted_categories: SkillCategory[];
  notification_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  learning_mode: boolean; // Pour améliorer les recommandations
  privacy_level: 'public' | 'friends' | 'private';
}
