import { supabase } from '../config/database.config';
import { 
  DateRange,
  GeneralMetrics,
  GeographicAnalytics,
  TemporalAnalytics,
  UserPerformance,
  FraudDetection,
  RevenueAnalytics,
  EngagementAnalytics,
  SystemPerformance,
  AnalyticsDashboard
} from '../types';
import { getDateThreshold, calculateDistance } from '../utils/helpers';

export class AnalyticsService {
  // Métriques générales
  async getGeneralMetrics(dateRange: DateRange): Promise<GeneralMetrics> {
    const [
      totalUsers,
      activeUsers,
      totalTasks,
      completedTasks,
      totalTransactions,
      totalVolume
    ] = await Promise.all([
      this.getTotalUsers(dateRange),
      this.getActiveUsers(dateRange),
      this.getTotalTasks(dateRange),
      this.getCompletedTasks(dateRange),
      this.getTotalTransactions(dateRange),
      this.getTotalVolume(dateRange)
    ]);
    
    const userGrowth = await this.getUserGrowth(dateRange);
    
    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        growth: userGrowth
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      },
      financial: {
        transactions: totalTransactions,
        volume: totalVolume,
        averageTransaction: totalTransactions > 0 ? totalVolume / totalTransactions : 0
      }
    };
  }
  
  // Analytics géographiques
  async getGeographicAnalytics(): Promise<GeographicAnalytics[]> {
    const { data, error } = await supabase
      .from('users')
      .select('location, latitude, longitude, created_at')
      .not('location', 'is', null);
    
    if (error) {
      throw new Error(`Erreur lors de la récupération des données géographiques: ${error.message}`);
    }
    
    // Grouper par ville/pays
    const locationStats = new Map();
    
    data?.forEach(user => {
      const location = user.location.split(',')[0].trim();
      const key = location.toLowerCase();
      
      if (locationStats.has(key)) {
        const stat = locationStats.get(key);
        stat.count++;
        stat.latitude = user.latitude || stat.latitude;
        stat.longitude = user.longitude || stat.longitude;
      } else {
        locationStats.set(key, {
          location,
          count: 1,
          latitude: user.latitude,
          longitude: user.longitude
        });
      }
    });
    
    return Array.from(locationStats.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }
  
  // Analytics temporelles
  async getTemporalAnalytics(period: 'day' | 'week' | 'month'): Promise<TemporalAnalytics[]> {
    const threshold = getDateThreshold(period);
    
    const { data, error } = await supabase
      .from('tasks')
      .select('created_at, status, budget')
      .gte('created_at', threshold.toISOString());
    
    if (error) {
      throw new Error(`Erreur lors de la récupération des données temporelles: ${error.message}`);
    }
    
    // Grouper par période
    const grouped = this.groupByPeriod(data || [], period);
    
    return grouped;
  }
  
  // Performance des utilisateurs
  async getUserPerformance(): Promise<UserPerformance[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        rating,
        total_tasks,
        completed_tasks,
        wallets(balance, total_earned, total_spent)
      `)
      .limit(100);
    
    if (error) {
      throw new Error(`Erreur lors de la récupération des performances utilisateur: ${error.message}`);
    }
    
    return data?.map(user => ({
      id: user.id,
      name: user.name,
      tasksCreated: user.total_tasks || 0,
      helpOffers: 0, // À calculer depuis help_offers
      balance: user.wallets?.[0]?.balance || 0,
      totalEarned: user.wallets?.[0]?.total_earned || 0,
      totalSpent: user.wallets?.[0]?.total_spent || 0,
      rating: user.rating || 0,
      completionRate: user.total_tasks > 0 ? (user.completed_tasks / user.total_tasks) * 100 : 0
    })) || [];
  }
  
  // Détection de fraude
  async detectFraud(): Promise<FraudDetection> {
    const [
      suspiciousTransactionsResult,
      suspiciousUsersResult
    ] = await Promise.all([
      // Transactions suspectes (montants élevés)
      supabase
        .from('transactions')
        .select('*')
        .gte('amount', 1000)
        .eq('status', 'completed'),
      
      // Utilisateurs avec beaucoup de tâches créées rapidement
      supabase
        .from('tasks')
        .select('user_id, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ]);
    
    if (suspiciousTransactionsResult.error) {
      throw new Error(`Erreur lors de la détection de fraude: ${suspiciousTransactionsResult.error.message}`);
    }
    
    // Grouper les tâches par utilisateur
    const userTaskCounts = new Map();
    suspiciousUsersResult.data?.forEach(task => {
      const count = userTaskCounts.get(task.user_id) || 0;
      userTaskCounts.set(task.user_id, count + 1);
    });
    
    const suspiciousUsers = Array.from(userTaskCounts.entries())
      .filter(([_, count]) => count > 10)
      .map(([userId, tasks_created_24h]) => ({
        user_id: userId,
        name: '', // À récupérer depuis users
        tasks_created_24h,
        risk_score: Math.min(tasks_created_24h / 10, 10) // Score de 0 à 10
      }));
    
    return {
      suspiciousTransactions: suspiciousTransactionsResult.data?.map(transaction => ({
        id: transaction.id,
        user_id: transaction.user_id,
        amount: transaction.amount,
        type: transaction.type,
        created_at: new Date(transaction.created_at),
        risk_score: Math.min(transaction.amount / 1000, 10) // Score basé sur le montant
      })) || [],
      suspiciousUsers
    };
  }
  
  // Analytics de revenus
  async getRevenueAnalytics(dateRange: DateRange): Promise<RevenueAnalytics> {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString())
      .eq('status', 'completed');
    
    if (error) {
      throw new Error(`Erreur lors de la récupération des revenus: ${error.message}`);
    }
    
    const totalRevenue = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
    
    // Revenus mensuels
    const monthlyRevenue = this.calculateMonthlyRevenue(transactions || []);
    
    // Revenus par catégorie
    const revenueByCategory = await this.calculateRevenueByCategory(transactions || []);
    
    // Top earners
    const topEarners = await this.getTopEarners(transactions || []);
    
    return {
      totalRevenue,
      monthlyRevenue,
      revenueByCategory,
      averageTransactionValue: transactions?.length ? totalRevenue / transactions.length : 0,
      topEarners
    };
  }
  
  // Analytics d'engagement
  async getEngagementAnalytics(): Promise<EngagementAnalytics> {
    const [
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      userRetention,
      taskEngagement
    ] = await Promise.all([
      this.getDailyActiveUsers(),
      this.getWeeklyActiveUsers(),
      this.getMonthlyActiveUsers(),
      this.getUserRetention(),
      this.getTaskEngagement()
    ]);
    
    return {
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      userRetention,
      taskEngagement
    };
  }
  
  // Performance système
  async getSystemPerformance(): Promise<SystemPerformance> {
    // Ces métriques seraient normalement récupérées depuis un système de monitoring
    // Pour l'instant, on retourne des valeurs simulées
    return {
      responseTime: {
        average: 150, // ms
        p95: 300,
        p99: 500
      },
      errorRate: 0.5, // %
      uptime: 99.9, // %
      databasePerformance: {
        queryTime: 50, // ms
        connectionPool: 8 // connexions actives
      },
      cacheHitRate: 85 // %
    };
  }
  
  // Dashboard complet
  async getAnalyticsDashboard(dateRange: DateRange): Promise<AnalyticsDashboard> {
    const [
      generalMetrics,
      geographicAnalytics,
      temporalAnalytics,
      userPerformance,
      fraudDetection,
      revenueAnalytics,
      engagementAnalytics,
      systemPerformance
    ] = await Promise.all([
      this.getGeneralMetrics(dateRange),
      this.getGeographicAnalytics(),
      this.getTemporalAnalytics('week'),
      this.getUserPerformance(),
      this.detectFraud(),
      this.getRevenueAnalytics(dateRange),
      this.getEngagementAnalytics(),
      this.getSystemPerformance()
    ]);
    
    return {
      generalMetrics,
      geographicAnalytics,
      temporalAnalytics,
      userPerformance,
      fraudDetection,
      revenueAnalytics,
      engagementAnalytics,
      systemPerformance,
      lastUpdated: new Date()
    };
  }
  
  // Méthodes privées
  private async getTotalUsers(dateRange: DateRange): Promise<number> {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .lte('created_at', dateRange.end.toISOString());
    
    if (error) throw error;
    return count || 0;
  }
  
  private async getActiveUsers(dateRange: DateRange): Promise<number> {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .lte('created_at', dateRange.end.toISOString());
    
    if (error) throw error;
    return count || 0;
  }
  
  private async getTotalTasks(dateRange: DateRange): Promise<number> {
    const { count, error } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());
    
    if (error) throw error;
    return count || 0;
  }
  
  private async getCompletedTasks(dateRange: DateRange): Promise<number> {
    const { count, error } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());
    
    if (error) throw error;
    return count || 0;
  }
  
  private async getTotalTransactions(dateRange: DateRange): Promise<number> {
    const { count, error } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());
    
    if (error) throw error;
    return count || 0;
  }
  
  private async getTotalVolume(dateRange: DateRange): Promise<number> {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());
    
    if (error) throw error;
    return data?.reduce((sum, t) => sum + t.amount, 0) || 0;
  }
  
  private async getUserGrowth(dateRange: DateRange): Promise<number> {
    const previousPeriodStart = new Date(dateRange.start.getTime() - (dateRange.end.getTime() - dateRange.start.getTime()));
    const previousPeriodEnd = dateRange.start;
    
    const [currentUsers, previousUsers] = await Promise.all([
      this.getTotalUsers(dateRange),
      this.getTotalUsers({ start: previousPeriodStart, end: previousPeriodEnd })
    ]);
    
    return previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers) * 100 : 0;
  }
  
  private groupByPeriod(data: any[], period: 'day' | 'week' | 'month'): TemporalAnalytics[] {
    const groups = new Map();
    
    data.forEach(item => {
      const date = new Date(item.created_at);
      let key: string;
      
      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }
      
      if (!groups.has(key)) {
        groups.set(key, {
          period: key,
          users: 0,
          tasks: 0,
          transactions: 0,
          revenue: 0
        });
      }
      
      const group = groups.get(key);
      group.tasks++;
      group.revenue += item.budget || 0;
    });
    
    return Array.from(groups.values()).sort((a, b) => a.period.localeCompare(b.period));
  }
  
  private calculateMonthlyRevenue(transactions: any[]): Array<{ month: string; revenue: number; transactions: number }> {
    const monthly = new Map();
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.created_at);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthly.has(month)) {
        monthly.set(month, { month, revenue: 0, transactions: 0 });
      }
      
      const data = monthly.get(month);
      data.revenue += transaction.amount;
      data.transactions++;
    });
    
    return Array.from(monthly.values()).sort((a, b) => a.month.localeCompare(b.month));
  }
  
  private async calculateRevenueByCategory(transactions: any[]): Promise<Array<{ category: string; revenue: number; percentage: number }>> {
    // Cette méthode nécessiterait de joindre avec les tâches pour obtenir les catégories
    // Pour l'instant, on retourne des données simulées
    return [
      { category: 'Ménage', revenue: 1000, percentage: 40 },
      { category: 'Jardinage', revenue: 600, percentage: 24 },
      { category: 'Bricolage', revenue: 500, percentage: 20 },
      { category: 'Autre', revenue: 400, percentage: 16 }
    ];
  }
  
  private async getTopEarners(transactions: any[]): Promise<Array<{ user_id: string; name: string; total_earned: number; tasks_completed: number }>> {
    // Grouper par utilisateur
    const userEarnings = new Map();
    
    transactions.forEach(transaction => {
      if (transaction.type === 'credit') {
        const userId = transaction.user_id;
        if (!userEarnings.has(userId)) {
          userEarnings.set(userId, { user_id: userId, total_earned: 0, tasks_completed: 0 });
        }
        userEarnings.get(userId).total_earned += transaction.amount;
        userEarnings.get(userId).tasks_completed++;
      }
    });
    
    return Array.from(userEarnings.values())
      .sort((a, b) => b.total_earned - a.total_earned)
      .slice(0, 10);
  }
  
  private async getDailyActiveUsers(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_activity_at', today.toISOString());
    
    if (error) throw error;
    return count || 0;
  }
  
  private async getWeeklyActiveUsers(): Promise<number> {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_activity_at', weekAgo.toISOString());
    
    if (error) throw error;
    return count || 0;
  }
  
  private async getMonthlyActiveUsers(): Promise<number> {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_activity_at', monthAgo.toISOString());
    
    if (error) throw error;
    return count || 0;
  }
  
  private async getUserRetention(): Promise<{ day1: number; day7: number; day30: number }> {
    // Calcul simplifié de la rétention
    return {
      day1: 85, // %
      day7: 60, // %
      day30: 40 // %
    };
  }
  
  private async getTaskEngagement(): Promise<{ averageTasksPerUser: number; averageCompletionTime: number; repeatUsers: number }> {
    const { data: users, error } = await supabase
      .from('users')
      .select('total_tasks');
    
    if (error) throw error;
    
    const totalTasks = users?.reduce((sum, user) => sum + (user.total_tasks || 0), 0) || 0;
    const userCount = users?.length || 1;
    
    return {
      averageTasksPerUser: totalTasks / userCount,
      averageCompletionTime: 2.5, // jours
      repeatUsers: Math.floor(userCount * 0.7) // 70% des utilisateurs
    };
  }
}
