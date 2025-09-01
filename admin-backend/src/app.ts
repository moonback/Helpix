import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { appConfig } from './config/app.config';
import { httpLogger, detailedLogger, errorLogger, performanceLogger, securityLogger } from './middleware/logging.middleware';
import { generalRateLimit } from './middleware/rateLimit.middleware';
import { sanitizeInput } from './middleware/validation.middleware';

// Import des routes
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import tasksRoutes from './routes/tasks.routes';
import analyticsRoutes from './routes/analytics.routes';
import adminRoutes from './routes/admin.routes';

// Import des services
import { AuthService } from './services/auth.service';
import { supabase } from './config/database.config';
import { getRedisClient } from './config/redis.config';
import logger from './utils/logger';

class AdminBackendApp {
  public app: express.Application;
  private authService: AuthService;

  constructor() {
    this.app = express();
    this.authService = new AuthService();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeDatabase();
  }

  private initializeMiddlewares(): void {
    // Sécurité
    this.app.use(helmet({
      contentSecurityPolicy: appConfig.helmetCspEnabled ? undefined : false,
      crossOriginEmbedderPolicy: false
    }));

    // CORS
    this.app.use(cors({
      origin: appConfig.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Compression
    this.app.use(compression());

    // Logging HTTP
    this.app.use(httpLogger);
    this.app.use(detailedLogger);
    this.app.use(performanceLogger);
    this.app.use(securityLogger);

    // Rate limiting global
    this.app.use(generalRateLimit);

    // Parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Sanitisation des entrées
    this.app.use(sanitizeInput);

    // Trust proxy pour les IPs réelles
    this.app.set('trust proxy', 1);
  }

  private initializeRoutes(): void {
    // Route de santé
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Admin Backend is healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: appConfig.nodeEnv
      });
    });

    // Route de métriques (pour Prometheus)
    this.app.get('/metrics', (req, res) => {
      // TODO: Implémenter les métriques Prometheus
      res.setHeader('Content-Type', 'text/plain');
      res.send('# Metrics endpoint - to be implemented\n');
    });

    // Routes API
    this.app.use('/api/admin/auth', authRoutes);
    this.app.use('/api/admin/users', usersRoutes);
    this.app.use('/api/admin/tasks', tasksRoutes);
    this.app.use('/api/admin/analytics', analyticsRoutes);
    this.app.use('/api/admin', adminRoutes);

    // Route 404
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Route non trouvée',
        path: req.originalUrl,
        method: req.method
      });
    });
  }

  private initializeErrorHandling(): void {
    // Gestionnaire d'erreurs global
    this.app.use(errorLogger);

    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Erreur non gérée:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Ne pas exposer les détails d'erreur en production
      const isDevelopment = appConfig.nodeEnv === 'development';
      
      res.status(error.statusCode || 500).json({
        success: false,
        error: isDevelopment ? error.message : 'Erreur interne du serveur',
        ...(isDevelopment && { stack: error.stack })
      });
    });
  }

  private async initializeDatabase(): Promise<void> {
    try {
      // Test de connexion Supabase
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        logger.warn('Connexion Supabase limitée:', error.message);
      } else {
        logger.info('Connexion Supabase établie');
      }

      // Test de connexion Redis
      try {
        const redis = await getRedisClient();
        await redis.ping();
        logger.info('Connexion Redis établie');
      } catch (redisError) {
        logger.warn('Connexion Redis échouée:', redisError);
      }

      // Créer l'admin par défaut si nécessaire
      await this.createDefaultAdmin();

    } catch (error) {
      logger.error('Erreur lors de l\'initialisation de la base de données:', error);
    }
  }

  private async createDefaultAdmin(): Promise<void> {
    try {
      // Vérifier si un admin existe déjà
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', appConfig.adminEmail)
        .single();

      if (existingAdmin) {
        logger.info('Admin par défaut existe déjà');
        return;
      }

      // Créer l'admin par défaut
      await this.authService.createAdmin({
        email: appConfig.adminEmail,
        name: 'Administrateur',
        password: appConfig.adminPassword,
        role: 'super_admin' as any,
        permissions: Object.values(require('./types').Permission)
      });

      logger.info('Admin par défaut créé avec succès');

    } catch (error) {
      logger.error('Erreur lors de la création de l\'admin par défaut:', error);
    }
  }

  public async start(): Promise<void> {
    try {
      this.app.listen(appConfig.port, () => {
        logger.info(`🚀 Admin Backend démarré sur le port ${appConfig.port}`);
        logger.info(`📊 Environnement: ${appConfig.nodeEnv}`);
        logger.info(`🔗 API Version: ${appConfig.apiVersion}`);
        logger.info(`🌐 CORS Origin: ${appConfig.corsOrigin}`);
        
        if (appConfig.nodeEnv === 'development') {
          logger.info(`📖 Documentation: http://localhost:${appConfig.port}/api/admin`);
          logger.info(`❤️  Santé: http://localhost:${appConfig.port}/health`);
        }
      });
    } catch (error) {
      logger.error('Erreur lors du démarrage du serveur:', error);
      process.exit(1);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  logger.info('Signal SIGTERM reçu, arrêt gracieux...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Signal SIGINT reçu, arrêt gracieux...');
  process.exit(0);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  logger.error('Exception non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesse rejetée non gérée:', { reason, promise });
  process.exit(1);
});

export default AdminBackendApp;
