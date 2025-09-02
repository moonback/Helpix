import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AuthRequest, DateRange } from '../types';
import { successResponse, errorResponse, validateDateRange } from '../utils/helpers';

export class AnalyticsController {
  private analyticsService = new AnalyticsService();
  
  // Obtenir le dashboard analytics complet
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { start, end } = req.query;
      
      let dateRange: DateRange;
      
      if (start && end) {
        dateRange = validateDateRange({ start: new Date(start as string), end: new Date(end as string) });
      } else {
        // Par défaut, les 30 derniers jours
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
        dateRange = { start: startDate, end: endDate };
      }
      
      const dashboard = await this.analyticsService.getAnalyticsDashboard(dateRange);
      
      res.json(successResponse(dashboard, 'Dashboard analytics récupéré'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'DASHBOARD_FETCH_FAILED'));
    }
  }
  
  // Obtenir les métriques générales
  async getGeneralMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { start, end } = req.query;
      
      if (!start || !end) {
        res.status(400).json(errorResponse('Dates de début et fin requises', 'DATE_RANGE_REQUIRED'));
        return;
      }
      
      const dateRange = validateDateRange({ 
        start: new Date(start as string), 
        end: new Date(end as string) 
      });
      
      const metrics = await this.analyticsService.getGeneralMetrics(dateRange);
      
      res.json(successResponse(metrics, 'Métriques générales récupérées'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'GENERAL_METRICS_FAILED'));
    }
  }
  
  // Obtenir les analytics géographiques
  async getGeographicAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await this.analyticsService.getGeographicAnalytics();
      
      res.json(successResponse(analytics, 'Analytics géographiques récupérées'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'GEOGRAPHIC_ANALYTICS_FAILED'));
    }
  }
  
  // Obtenir les analytics temporelles
  async getTemporalAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'week' } = req.query;
      
      if (!['day', 'week', 'month'].includes(period as string)) {
        res.status(400).json(errorResponse('Période invalide. Utilisez: day, week, month', 'INVALID_PERIOD'));
        return;
      }
      
      const analytics = await this.analyticsService.getTemporalAnalytics(period as 'day' | 'week' | 'month');
      
      res.json(successResponse(analytics, 'Analytics temporelles récupérées'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'TEMPORAL_ANALYTICS_FAILED'));
    }
  }
  
  // Obtenir les performances des utilisateurs
  async getUserPerformance(req: Request, res: Response): Promise<void> {
    try {
      const performance = await this.analyticsService.getUserPerformance();
      
      res.json(successResponse(performance, 'Performances utilisateur récupérées'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'USER_PERFORMANCE_FAILED'));
    }
  }
  
  // Obtenir la détection de fraude
  async getFraudDetection(req: Request, res: Response): Promise<void> {
    try {
      const fraud = await this.analyticsService.detectFraud();
      
      res.json(successResponse(fraud, 'Détection de fraude récupérée'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'FRAUD_DETECTION_FAILED'));
    }
  }
  
  // Obtenir les analytics de revenus
  async getRevenueAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { start, end } = req.query;
      
      if (!start || !end) {
        res.status(400).json(errorResponse('Dates de début et fin requises', 'DATE_RANGE_REQUIRED'));
        return;
      }
      
      const dateRange = validateDateRange({ 
        start: new Date(start as string), 
        end: new Date(end as string) 
      });
      
      const analytics = await this.analyticsService.getRevenueAnalytics(dateRange);
      
      res.json(successResponse(analytics, 'Analytics de revenus récupérées'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'REVENUE_ANALYTICS_FAILED'));
    }
  }
  
  // Obtenir les analytics d'engagement
  async getEngagementAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await this.analyticsService.getEngagementAnalytics();
      
      res.json(successResponse(analytics, 'Analytics d\'engagement récupérées'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'ENGAGEMENT_ANALYTICS_FAILED'));
    }
  }
  
  // Obtenir les performances système
  async getSystemPerformance(req: Request, res: Response): Promise<void> {
    try {
      const performance = await this.analyticsService.getSystemPerformance();
      
      res.json(successResponse(performance, 'Performances système récupérées'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'SYSTEM_PERFORMANCE_FAILED'));
    }
  }
  
  // Exporter les données analytics
  async exportAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { type, format, start, end } = req.body;
      const adminId = req.admin?.id;
      
      if (!adminId) {
        res.status(401).json(errorResponse('Non authentifié', 'NOT_AUTHENTICATED'));
        return;
      }
      
      if (!type || !format || !start || !end) {
        res.status(400).json(errorResponse('Type, format et dates requises', 'MISSING_PARAMETERS'));
        return;
      }
      
      if (!['users', 'tasks', 'transactions', 'analytics'].includes(type)) {
        res.status(400).json(errorResponse('Type d\'export invalide', 'INVALID_EXPORT_TYPE'));
        return;
      }
      
      if (!['csv', 'json', 'xlsx'].includes(format)) {
        res.status(400).json(errorResponse('Format d\'export invalide', 'INVALID_EXPORT_FORMAT'));
        return;
      }
      
      const dateRange = validateDateRange({ 
        start: new Date(start), 
        end: new Date(end) 
      });
      
      // TODO: Implémenter l'export selon le type
      let data: any;
      
      switch (type) {
        case 'analytics':
          data = await this.analyticsService.getAnalyticsDashboard(dateRange);
          break;
        default:
          res.status(400).json(errorResponse('Type d\'export non supporté', 'UNSUPPORTED_EXPORT_TYPE'));
          return;
      }
      
      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=analytics_${type}_${new Date().toISOString().split('T')[0]}.json`);
        res.send(JSON.stringify(data, null, 2));
      } else if (format === 'csv') {
        // TODO: Convertir en CSV
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=analytics_${type}_${new Date().toISOString().split('T')[0]}.csv`);
        res.send('CSV export not implemented yet');
      } else {
        res.status(400).json(errorResponse('Format d\'export non supporté', 'UNSUPPORTED_FORMAT'));
      }
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'ANALYTICS_EXPORT_FAILED'));
    }
  }
  
  // Obtenir les métriques en temps réel
  async getRealTimeMetrics(req: Request, res: Response): Promise<void> {
    try {
      // Métriques en temps réel (dernières 24h)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setHours(endDate.getHours() - 24);
      
      const dateRange = { start: startDate, end: endDate };
      
      const [
        generalMetrics,
        systemPerformance
      ] = await Promise.all([
        this.analyticsService.getGeneralMetrics(dateRange),
        this.analyticsService.getSystemPerformance()
      ]);
      
      const realTimeMetrics = {
        ...generalMetrics,
        systemPerformance,
        timestamp: new Date()
      };
      
      res.json(successResponse(realTimeMetrics, 'Métriques temps réel récupérées'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'REALTIME_METRICS_FAILED'));
    }
  }
  
  // Obtenir les tendances
  async getTrends(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'week', metric } = req.query;
      
      if (!['day', 'week', 'month'].includes(period as string)) {
        res.status(400).json(errorResponse('Période invalide', 'INVALID_PERIOD'));
        return;
      }
      
      const temporalAnalytics = await this.analyticsService.getTemporalAnalytics(period as 'day' | 'week' | 'month');
      
      // Calculer les tendances
      const trends = this.calculateTrends(temporalAnalytics, metric as string);
      
      res.json(successResponse(trends, 'Tendances récupérées'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'TRENDS_FAILED'));
    }
  }
  
  // Obtenir les alertes
  async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const [
        fraudDetection,
        systemPerformance
      ] = await Promise.all([
        this.analyticsService.detectFraud(),
        this.analyticsService.getSystemPerformance()
      ]);
      
      const alerts = [];
      
      // Alertes de fraude
      if (fraudDetection.suspiciousTransactions.length > 0) {
        alerts.push({
          type: 'fraud',
          severity: 'high',
          message: `${fraudDetection.suspiciousTransactions.length} transactions suspectes détectées`,
          count: fraudDetection.suspiciousTransactions.length
        });
      }
      
      if (fraudDetection.suspiciousUsers.length > 0) {
        alerts.push({
          type: 'fraud',
          severity: 'medium',
          message: `${fraudDetection.suspiciousUsers.length} utilisateurs suspects détectés`,
          count: fraudDetection.suspiciousUsers.length
        });
      }
      
      // Alertes système
      if (systemPerformance.errorRate > 5) {
        alerts.push({
          type: 'system',
          severity: 'high',
          message: `Taux d'erreur élevé: ${systemPerformance.errorRate}%`,
          value: systemPerformance.errorRate
        });
      }
      
      if (systemPerformance.responseTime.average > 1000) {
        alerts.push({
          type: 'performance',
          severity: 'medium',
          message: `Temps de réponse lent: ${systemPerformance.responseTime.average}ms`,
          value: systemPerformance.responseTime.average
        });
      }
      
      res.json(successResponse(alerts, 'Alertes récupérées'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'ALERTS_FAILED'));
    }
  }
  
  // Méthode privée pour calculer les tendances
  private calculateTrends(data: any[], metric: string): any {
    if (data.length < 2) {
      return { trend: 'stable', percentage: 0 };
    }
    
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    
    const latestValue = latest[metric] || 0;
    const previousValue = previous[metric] || 0;
    
    if (previousValue === 0) {
      return { trend: 'stable', percentage: 0 };
    }
    
    const percentage = ((latestValue - previousValue) / previousValue) * 100;
    const trend = percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable';
    
    return {
      trend,
      percentage: Math.round(percentage * 100) / 100,
      current: latestValue,
      previous: previousValue
    };
  }
}
