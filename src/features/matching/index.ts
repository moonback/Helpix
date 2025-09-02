// Export du système de matching intelligent
export { default as MatchingPage } from './MatchingPage';
export { default as MatchingDashboard } from './components/MatchingDashboard';
export { default as SmartNotifications } from './components/SmartNotifications';
export { default as ProximityAlerts } from './components/ProximityAlerts';
export { default as MatchingNotificationBadge } from './components/MatchingNotificationBadge';
export { default as HomeRecommendations } from './components/HomeRecommendations';

// Export des hooks
export { useMatching, useRecommendations, useProximityAlerts, useSmartNotifications, useMatchingSettings, useMatchingDashboard } from '../../hooks/useMatching';

// Export du store
export { useMatchingStore } from '../../stores/matchingStore';

// Export des types
export type {
  UserProfile,
  TaskMatchingProfile,
  MatchResult,
  MatchBreakdown,
  MatchingCriteria,
  Recommendation,
  ProximityAlert,
  SmartNotification,
  MatchingDashboard as MatchingDashboardType,
  MatchingSettings,
  UserSkill,
  UserCertification,
  UserBadge,
  SkillCategory,
  UserPreferences,
  UserStats,
  UserAvailability,
  NotificationSettings,
  TimeSlot,
  MatchingStats,
  SkillGap,
  MatchingHistory
} from '../../types/matching';

// Export de l'algorithme
export { MatchingAlgorithm, RecommendationService } from '../../lib/matchingAlgorithm';
