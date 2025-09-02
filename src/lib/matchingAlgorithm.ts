// Algorithme de matching intelligent pour Helpix
import { 
  UserProfile, 
  TaskMatchingProfile, 
  MatchResult, 
  MatchBreakdown, 
  MatchingCriteria,
  Recommendation,
  ProximityAlert
} from '@/types/matching';
import { calculateDistance } from './utils';

/**
 * Algorithme principal de matching entre utilisateurs et tâches
 */
export class MatchingAlgorithm {
  private static readonly DEFAULT_WEIGHTS = {
    proximity: 0.25,
    skill_match: 0.30,
    availability: 0.15,
    reputation: 0.15,
    budget: 0.10,
    response_time: 0.05
  };

  /**
   * Calcule le score de compatibilité entre un utilisateur et une tâche
   */
  static calculateCompatibility(
    user: UserProfile,
    task: TaskMatchingProfile,
    criteria?: Partial<MatchingCriteria>
  ): MatchResult {
    const weights = { ...this.DEFAULT_WEIGHTS, ...criteria };
    
    const breakdown: MatchBreakdown = {
      proximity_score: this.calculateProximityScore(user, task),
      skill_match_score: this.calculateSkillMatchScore(user, task),
      availability_score: this.calculateAvailabilityScore(user, task),
      reputation_score: this.calculateReputationScore(user),
      budget_score: this.calculateBudgetScore(user, task),
      response_time_score: this.calculateResponseTimeScore(user),
      history_score: this.calculateHistoryScore(user)
    };

    const compatibility_score = 
      breakdown.proximity_score * weights.proximity +
      breakdown.skill_match_score * weights.skill_match +
      breakdown.availability_score * weights.availability +
      breakdown.reputation_score * weights.reputation +
      breakdown.budget_score * weights.budget +
      breakdown.response_time_score * weights.response_time +
      breakdown.history_score * (weights.history_weight || 0.1);

    const reasons = this.generateMatchReasons(breakdown);
    const recommendations = this.generateRecommendations(breakdown, user, task);

    return {
      user_id: user.id,
      task_id: task.id,
      compatibility_score: Math.round(compatibility_score * 100) / 100,
      match_breakdown: breakdown,
      reasons,
      recommendations,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Calcule le score de proximité géographique
   */
  private static calculateProximityScore(user: UserProfile, task: TaskMatchingProfile): number {
    if (!user.latitude || !user.longitude || !task.latitude || !task.longitude) {
      return 0.5; // Score neutre si pas de géolocalisation
    }

    const distance = calculateDistance(
      user.latitude,
      user.longitude,
      task.latitude,
      task.longitude
    );

    // Score basé sur la distance (0-1)
    if (distance <= 1) return 1.0; // Très proche
    if (distance <= 5) return 0.9; // Proche
    if (distance <= 10) return 0.7; // Moyennement proche
    if (distance <= 25) return 0.5; // Assez loin
    if (distance <= 50) return 0.3; // Loin
    return 0.1; // Très loin
  }

  /**
   * Calcule le score de correspondance des compétences
   */
  private static calculateSkillMatchScore(user: UserProfile, task: TaskMatchingProfile): number {
    if (task.required_skills.length === 0) {
      return 0.8; // Score élevé si pas de compétences requises
    }

    let totalScore = 0;
    let totalWeight = 0;

    for (const requiredSkill of task.required_skills) {
      const userSkill = user.skills.find(skill => 
        skill.skill_name.toLowerCase() === requiredSkill.toLowerCase() ||
        this.areSkillsRelated(skill.skill_name, requiredSkill)
      );

      if (userSkill) {
        const skillScore = this.getSkillProficiencyScore(userSkill.proficiency_level);
        const weight = 1.0; // Poids par défaut
        totalScore += skillScore * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Calcule le score de disponibilité
   */
  private static calculateAvailabilityScore(user: UserProfile, task: TaskMatchingProfile): number {
    if (!user.availability.is_available) {
      return 0.1; // Très faible si pas disponible
    }

    // Vérifier si l'utilisateur est disponible dans les créneaux préférés
    const now = new Date();
    const taskDeadline = task.deadline ? new Date(task.deadline) : null;
    
    if (taskDeadline && taskDeadline < now) {
      return 0; // Tâche expirée
    }

    // Score basé sur la disponibilité et les préférences
    let availabilityScore = 0.5; // Score de base

    if (user.availability.current_status === 'available') {
      availabilityScore += 0.3;
    }

    // Vérifier les créneaux préférés
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    
    const preferredSlot = user.preferences.preferred_time_slots.find(slot => 
      slot.day_of_week === currentDay &&
      slot.is_available &&
      currentTime >= slot.start_time &&
      currentTime <= slot.end_time
    );

    if (preferredSlot) {
      availabilityScore += 0.2;
    }

    return Math.min(1, availabilityScore);
  }

  /**
   * Calcule le score de réputation
   */
  private static calculateReputationScore(user: UserProfile): number {
    const reputationScore = user.reputation_score / 100; // Normaliser sur 0-1
    
    // Bonus pour les utilisateurs vérifiés
    let bonus = 0;
    if (user.trust_level === 'expert') bonus = 0.2;
    else if (user.trust_level === 'trusted') bonus = 0.1;
    else if (user.trust_level === 'verified') bonus = 0.05;

    return Math.min(1, reputationScore + bonus);
  }

  /**
   * Calcule le score de budget
   */
  private static calculateBudgetScore(user: UserProfile, task: TaskMatchingProfile): number {
    const taskBudget = task.budget_credits;
    const userMinBudget = user.preferences.min_task_budget;
    const userMaxBudget = user.preferences.max_task_budget;

    if (taskBudget < userMinBudget) {
      return 0.2; // Budget trop faible
    }

    if (userMaxBudget && taskBudget > userMaxBudget) {
      return 0.3; // Budget trop élevé
    }

    // Score optimal si le budget est dans la fourchette préférée
    if (userMaxBudget) {
      const budgetRatio = (taskBudget - userMinBudget) / (userMaxBudget - userMinBudget);
      return 0.5 + (0.5 * (1 - Math.abs(budgetRatio - 0.5) * 2));
    }

    return 0.8; // Pas de limite max, score élevé
  }

  /**
   * Calcule le score de temps de réponse
   */
  private static calculateResponseTimeScore(user: UserProfile): number {
    const responseTime = user.stats.response_time_minutes;
    
    if (responseTime <= 30) return 1.0; // Excellent
    if (responseTime <= 60) return 0.8; // Bon
    if (responseTime <= 120) return 0.6; // Moyen
    if (responseTime <= 240) return 0.4; // Lent
    return 0.2; // Très lent
  }

  /**
   * Calcule le score d'historique
   */
  private static calculateHistoryScore(user: UserProfile): number {
    const completionRate = user.stats.completion_rate;
    const totalTasks = user.stats.total_tasks_completed;
    
    // Score basé sur le taux de completion
    let historyScore = completionRate / 100;
    
    // Bonus pour l'expérience
    if (totalTasks >= 50) historyScore += 0.1;
    else if (totalTasks >= 20) historyScore += 0.05;
    else if (totalTasks >= 5) historyScore += 0.02;

    return Math.min(1, historyScore);
  }

  /**
   * Génère les raisons du match
   */
  private static generateMatchReasons(
    breakdown: MatchBreakdown
  ): string[] {
    const reasons: string[] = [];

    if (breakdown.proximity_score >= 0.8) {
      reasons.push("Très proche de votre localisation");
    } else if (breakdown.proximity_score >= 0.6) {
      reasons.push("À proximité de votre zone");
    }

    if (breakdown.skill_match_score >= 0.8) {
      reasons.push("Compétences parfaitement adaptées");
    } else if (breakdown.skill_match_score >= 0.6) {
      reasons.push("Compétences correspondantes");
    }

    if (breakdown.availability_score >= 0.8) {
      reasons.push("Disponible immédiatement");
    } else if (breakdown.availability_score >= 0.6) {
      reasons.push("Disponible dans vos créneaux");
    }

    if (breakdown.reputation_score >= 0.9) {
      reasons.push("Excellente réputation");
    } else if (breakdown.reputation_score >= 0.7) {
      reasons.push("Bonne réputation");
    }

    if (breakdown.response_time_score >= 0.8) {
      reasons.push("Réponse rapide garantie");
    }

    return reasons;
  }

  /**
   * Génère les recommandations d'amélioration
   */
  private static generateRecommendations(
    breakdown: MatchBreakdown,
    user: UserProfile,
    task: TaskMatchingProfile
  ): string[] {
    const recommendations: string[] = [];

    if (breakdown.skill_match_score < 0.5) {
      const missingSkills = task.required_skills.filter(skill => 
        !user.skills.some(userSkill => 
          userSkill.skill_name.toLowerCase() === skill.toLowerCase()
        )
      );
      if (missingSkills.length > 0) {
        recommendations.push(`Développez vos compétences en: ${missingSkills.join(', ')}`);
      }
    }

    if (breakdown.reputation_score < 0.6) {
      recommendations.push("Améliorez votre réputation en complétant plus de tâches");
    }

    if (breakdown.response_time_score < 0.6) {
      recommendations.push("Répondez plus rapidement aux offres d'aide");
    }

    if (breakdown.availability_score < 0.5) {
      recommendations.push("Mettez à jour votre disponibilité");
    }

    return recommendations;
  }

  /**
   * Trouve les meilleurs matches pour une tâche
   */
  static findBestMatches(
    task: TaskMatchingProfile,
    users: UserProfile[],
    limit: number = 10
  ): MatchResult[] {
    const matches = users
      .map(user => this.calculateCompatibility(user, task))
      .filter(match => match.compatibility_score >= 0.3) // Seuil minimum
      .sort((a, b) => b.compatibility_score - a.compatibility_score)
      .slice(0, limit);

    return matches;
  }

  /**
   * Trouve les meilleures tâches pour un utilisateur
   */
  static findBestTasksForUser(
    user: UserProfile,
    tasks: TaskMatchingProfile[],
    limit: number = 20
  ): MatchResult[] {
    const matches = tasks
      .filter(task => task.user_id !== user.id) // Exclure ses propres tâches
      .map(task => this.calculateCompatibility(user, task))
      .filter(match => match.compatibility_score >= 0.4) // Seuil plus élevé pour l'utilisateur
      .sort((a, b) => b.compatibility_score - a.compatibility_score)
      .slice(0, limit);

    return matches;
  }

  /**
   * Génère des alertes de proximité
   */
  static generateProximityAlerts(
    user: UserProfile,
    tasks: TaskMatchingProfile[],
    maxDistance: number = 5
  ): ProximityAlert[] {
    if (!user.latitude || !user.longitude) {
      return [];
    }

    return tasks
      .filter(task => 
        task.latitude && 
        task.longitude && 
        task.user_id !== user.id
      )
      .map(task => {
        const distance = calculateDistance(
          user.latitude!,
          user.longitude!,
          task.latitude!,
          task.longitude!
        );
        return { task, distance };
      })
      .filter(({ distance }) => distance <= maxDistance)
      .map(({ task, distance }) => ({
        id: `alert_${user.id}_${task.id}_${Date.now()}`,
        user_id: user.id,
        task_id: task.id,
        distance_km: Math.round(distance * 100) / 100,
        created_at: new Date().toISOString(),
        is_sent: false,
        is_viewed: false
      }));
  }

  /**
   * Utilitaires pour les compétences
   */
  private static getSkillProficiencyScore(level: string): number {
    switch (level) {
      case 'expert': return 1.0;
      case 'advanced': return 0.8;
      case 'intermediate': return 0.6;
      case 'beginner': return 0.4;
      default: return 0.2;
    }
  }



  private static areSkillsRelated(skill1: string, skill2: string): boolean {
    // Mapping de compétences liées
    const skillGroups: Record<string, string[]> = {
      'bricolage': ['réparation', 'maintenance', 'outils', 'construction'],
      'jardinage': ['botanique', 'entretien', 'nature', 'plantes'],
      'informatique': ['technologie', 'ordinateur', 'logiciel', 'programmation'],
      'cuisine': ['alimentation', 'recette', 'gastronomie'],
      'transport': ['véhicule', 'conduite', 'livraison', 'déménagement'],
      'nettoyage': ['ménage', 'entretien', 'hygiène'],
      'éducation': ['enseignement', 'cours', 'formation', 'apprentissage']
    };

    const skill1Lower = skill1.toLowerCase();
    const skill2Lower = skill2.toLowerCase();

    // Vérifier si les compétences sont dans le même groupe
    for (const [mainSkill, relatedSkills] of Object.entries(skillGroups)) {
      if (
        (skill1Lower.includes(mainSkill) || relatedSkills.some(s => skill1Lower.includes(s))) &&
        (skill2Lower.includes(mainSkill) || relatedSkills.some(s => skill2Lower.includes(s)))
      ) {
        return true;
      }
    }

    return false;
  }
}

/**
 * Service de recommandations intelligentes
 */
export class RecommendationService {
  /**
   * Génère des recommandations personnalisées pour un utilisateur
   */
  static generateRecommendations(
    user: UserProfile,
    tasks: TaskMatchingProfile[],
    limit: number = 10
  ): Recommendation[] {
    const matches = MatchingAlgorithm.findBestTasksForUser(user, tasks, limit * 2);
    
    return matches.map((match) => {
      const type = this.determineRecommendationType(match);
      const reason = this.generateRecommendationReason(match);
      
      return {
        id: `rec_${user.id}_${match.task_id}_${Date.now()}`,
        user_id: user.id,
        task_id: match.task_id,
        type,
        score: match.compatibility_score,
        reason,
        priority: this.determinePriority(match),
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
        is_viewed: false,
        is_accepted: false,
        is_dismissed: false
      };
    }).slice(0, limit);
  }

  private static determineRecommendationType(
    match: MatchResult
  ): Recommendation['type'] {
    if (match.match_breakdown.proximity_score >= 0.8) {
      return 'proximity';
    } else if (match.match_breakdown.skill_match_score >= 0.8) {
      return 'skill_match';
    } else if (match.match_breakdown.reputation_score >= 0.9) {
      return 'history';
    } else {
      return 'budget';
    }
  }

  private static generateRecommendationReason(
    match: MatchResult
  ): string {
    // Déterminer le type basé sur les scores
    if (match.match_breakdown.proximity_score >= 0.8) {
      return "Une tâche parfaite à proximité de chez vous !";
    } else if (match.match_breakdown.skill_match_score >= 0.8) {
      return "Vos compétences correspondent parfaitement à cette tâche";
    } else if (match.match_breakdown.history_score >= 0.7) {
      return "Basé sur votre historique d'aide réussie";
    } else if (match.match_breakdown.budget_score >= 0.8) {
      return "Une opportunité intéressante dans votre budget";
    } else {
      return "Recommandation personnalisée pour vous";
    }
  }

  private static determinePriority(
    match: MatchResult
  ): Recommendation['priority'] {
    if (match.compatibility_score >= 0.8) return 'high';
    if (match.compatibility_score >= 0.6) return 'medium';
    return 'low';
  }
}
