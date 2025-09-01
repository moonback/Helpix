import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { getRedisClient } from '../config/redis.config';
import { generateRateLimitKey } from '../utils/helpers';
import { logSecurityEvent } from '../utils/logger';

// Store personnalisé pour Redis
const redisStore = {
  async increment(key: string, windowMs: number): Promise<{ totalHits: number; resetTime: Date }> {
    const redis = await getRedisClient();
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const redisKey = `rate_limit:${key}:${window}`;
    
    const totalHits = await redis.incr(redisKey);
    await redis.expire(redisKey, Math.ceil(windowMs / 1000));
    
    const resetTime = new Date((window + 1) * windowMs);
    
    return { totalHits, resetTime };
  },
  
  async decrement(key: string): Promise<void> {
    const redis = await getRedisClient();
    const pattern = `rate_limit:${key}:*`;
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.decr(keys[0]);
    }
  },
  
  async resetKey(key: string): Promise<void> {
    const redis = await getRedisClient();
    const pattern = `rate_limit:${key}:*`;
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
};

// Configuration de base pour le rate limiting
const createRateLimit = (options: {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    ...options,
    store: redisStore,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      const key = options.keyGenerator ? options.keyGenerator(req) : req.ip;
      
      logSecurityEvent('rate_limit_exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
        key,
        limit: options.max,
        windowMs: options.windowMs
      });
      
      res.status(429).json({
        success: false,
        error: options.message || 'Trop de requêtes, veuillez réessayer plus tard',
        retryAfter: Math.ceil(options.windowMs / 1000)
      });
    }
  });
};

// Rate limiting général pour l'API
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer dans 15 minutes',
  keyGenerator: (req: Request) => req.ip
});

// Rate limiting strict pour l'authentification
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives de connexion par fenêtre
  message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes',
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request) => `auth:${req.ip}`
});

// Rate limiting pour les requêtes sensibles
export const sensitiveRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 requêtes par heure
  message: 'Trop de requêtes sensibles, veuillez réessayer dans 1 heure',
  keyGenerator: (req: Request) => `sensitive:${req.ip}`
});

// Rate limiting pour les exports de données
export const exportRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 exports par heure
  message: 'Trop d\'exports de données, veuillez réessayer dans 1 heure',
  keyGenerator: (req: Request) => `export:${req.ip}`
});

// Rate limiting pour les notifications
export const notificationRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 notifications par minute
  message: 'Trop de notifications envoyées, veuillez réessayer dans 1 minute',
  keyGenerator: (req: Request) => `notification:${req.ip}`
});

// Rate limiting pour les uploads de fichiers
export const uploadRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // 20 uploads par heure
  message: 'Trop d\'uploads de fichiers, veuillez réessayer dans 1 heure',
  keyGenerator: (req: Request) => `upload:${req.ip}`
});

// Rate limiting par utilisateur admin
export const adminUserRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requêtes par fenêtre par admin
  message: 'Trop de requêtes pour cet utilisateur admin, veuillez réessayer dans 15 minutes',
  keyGenerator: (req: Request) => {
    const adminId = (req as any).admin?.id;
    return adminId ? `admin:${adminId}` : req.ip;
  }
});

// Rate limiting pour les recherches
export const searchRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 recherches par minute
  message: 'Trop de recherches, veuillez réessayer dans 1 minute',
  keyGenerator: (req: Request) => `search:${req.ip}`
});

// Rate limiting pour les analytics
export const analyticsRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 requêtes d'analytics par fenêtre
  message: 'Trop de requêtes d\'analytics, veuillez réessayer dans 5 minutes',
  keyGenerator: (req: Request) => `analytics:${req.ip}`
});

// Middleware pour bypasser le rate limiting pour certains IPs
export const bypassRateLimit = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: any): void => {
    if (allowedIPs.includes(req.ip)) {
      // Bypass du rate limiting pour les IPs autorisées
      return next();
    }
    next();
  };
};

// Middleware pour ajuster le rate limiting selon le rôle admin
export const adaptiveRateLimit = (req: Request, res: Response, next: any): void => {
  const admin = (req as any).admin;
  
  if (admin) {
    // Ajuster les limites selon le rôle
    switch (admin.role) {
      case 'super_admin':
        // Pas de limite pour les super admins
        return next();
      case 'admin':
        // Limite élevée pour les admins
        return adminUserRateLimit(req, res, next);
      case 'moderator':
        // Limite modérée pour les modérateurs
        return createRateLimit({
          windowMs: 15 * 60 * 1000,
          max: 100,
          keyGenerator: () => `moderator:${admin.id}`
        })(req, res, next);
      default:
        // Limite standard pour les autres rôles
        return generalRateLimit(req, res, next);
    }
  }
  
  // Pas d'admin, utiliser le rate limiting général
  return generalRateLimit(req, res, next);
};

// Middleware pour logger les tentatives de rate limiting
export const logRateLimitAttempts = (req: Request, res: Response, next: any): void => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (res.statusCode === 429) {
      logSecurityEvent('rate_limit_triggered', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
        adminId: (req as any).admin?.id,
        timestamp: new Date().toISOString()
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};
