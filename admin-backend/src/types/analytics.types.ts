export interface DateRange {
  start: Date;
  end: Date;
}

export interface GeneralMetrics {
  users: {
    total: number;
    active: number;
    growth: number;
  };
  tasks: {
    total: number;
    completed: number;
    completionRate: number;
  };
  financial: {
    transactions: number;
    volume: number;
    averageTransaction: number;
  };
}

export interface GeographicAnalytics {
  location: string;
  count: number;
  latitude?: number;
  longitude?: number;
}

export interface TemporalAnalytics {
  period: string;
  users: number;
  tasks: number;
  transactions: number;
  revenue: number;
}

export interface UserPerformance {
  id: string;
  name: string;
  tasksCreated: number;
  helpOffers: number;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  rating: number;
  completionRate: number;
}

export interface FraudDetection {
  suspiciousTransactions: Array<{
    id: string;
    user_id: string;
    amount: number;
    type: string;
    created_at: Date;
    risk_score: number;
  }>;
  suspiciousUsers: Array<{
    user_id: string;
    name: string;
    tasks_created_24h: number;
    risk_score: number;
  }>;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
  averageTransactionValue: number;
  topEarners: Array<{
    user_id: string;
    name: string;
    total_earned: number;
    tasks_completed: number;
  }>;
}

export interface EngagementAnalytics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
  taskEngagement: {
    averageTasksPerUser: number;
    averageCompletionTime: number;
    repeatUsers: number;
  };
}

export interface SystemPerformance {
  responseTime: {
    average: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  uptime: number;
  databasePerformance: {
    queryTime: number;
    connectionPool: number;
  };
  cacheHitRate: number;
}

export interface AnalyticsDashboard {
  generalMetrics: GeneralMetrics;
  geographicAnalytics: GeographicAnalytics[];
  temporalAnalytics: TemporalAnalytics[];
  userPerformance: UserPerformance[];
  fraudDetection: FraudDetection;
  revenueAnalytics: RevenueAnalytics;
  engagementAnalytics: EngagementAnalytics;
  systemPerformance: SystemPerformance;
  lastUpdated: Date;
}

export interface AnalyticsFilters {
  dateRange: DateRange;
  location?: string;
  category?: string;
  userSegment?: string;
  taskStatus?: string;
}

export interface ExportRequest {
  type: 'users' | 'tasks' | 'transactions' | 'analytics';
  format: 'csv' | 'json' | 'xlsx';
  filters: AnalyticsFilters;
  fields?: string[];
}

export interface ReportSchedule {
  id: string;
  name: string;
  type: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  filters: AnalyticsFilters;
  isActive: boolean;
  lastRun?: Date;
  nextRun: Date;
  created_at: Date;
}
