import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { 
  authenticateAdmin, 
  requirePermission 
} from '../middleware/auth.middleware';
import { 
  validateDateRange,
  validateExportRequest 
} from '../middleware/validation.middleware';
import { 
  generalRateLimit,
  analyticsRateLimit,
  exportRateLimit 
} from '../middleware/rateLimit.middleware';
import { Permission } from '../types';

const router = Router();
const analyticsController = new AnalyticsController();

// Toutes les routes nécessitent une authentification admin
router.use(authenticateAdmin);

// Routes d'analytics (permission VIEW_ANALYTICS)
router.get('/dashboard',
  requirePermission(Permission.VIEW_ANALYTICS),
  analyticsRateLimit,
  analyticsController.getDashboard.bind(analyticsController)
);

router.get('/metrics',
  requirePermission(Permission.VIEW_ANALYTICS),
  analyticsRateLimit,
  analyticsController.getGeneralMetrics.bind(analyticsController)
);

router.get('/geographic',
  requirePermission(Permission.VIEW_ANALYTICS),
  analyticsRateLimit,
  analyticsController.getGeographicAnalytics.bind(analyticsController)
);

router.get('/temporal',
  requirePermission(Permission.VIEW_ANALYTICS),
  analyticsRateLimit,
  analyticsController.getTemporalAnalytics.bind(analyticsController)
);

router.get('/user-performance',
  requirePermission(Permission.VIEW_ANALYTICS),
  analyticsRateLimit,
  analyticsController.getUserPerformance.bind(analyticsController)
);

router.get('/fraud-detection',
  requirePermission(Permission.VIEW_ANALYTICS),
  analyticsRateLimit,
  analyticsController.getFraudDetection.bind(analyticsController)
);

router.get('/revenue',
  requirePermission(Permission.VIEW_ANALYTICS),
  analyticsRateLimit,
  analyticsController.getRevenueAnalytics.bind(analyticsController)
);

router.get('/engagement',
  requirePermission(Permission.VIEW_ANALYTICS),
  analyticsRateLimit,
  analyticsController.getEngagementAnalytics.bind(analyticsController)
);

router.get('/system-performance',
  requirePermission(Permission.VIEW_ANALYTICS),
  analyticsRateLimit,
  analyticsController.getSystemPerformance.bind(analyticsController)
);

router.get('/real-time',
  requirePermission(Permission.VIEW_ANALYTICS),
  analyticsRateLimit,
  analyticsController.getRealTimeMetrics.bind(analyticsController)
);

router.get('/trends',
  requirePermission(Permission.VIEW_ANALYTICS),
  analyticsRateLimit,
  analyticsController.getTrends.bind(analyticsController)
);

router.get('/alerts',
  requirePermission(Permission.VIEW_ANALYTICS),
  analyticsRateLimit,
  analyticsController.getAlerts.bind(analyticsController)
);

// Routes d'export (permission EXPORT_DATA)
router.post('/export',
  requirePermission(Permission.EXPORT_DATA),
  exportRateLimit,
  validateExportRequest,
  analyticsController.exportAnalytics.bind(analyticsController)
);

export default router;
