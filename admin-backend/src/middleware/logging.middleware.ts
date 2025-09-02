import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { morganStream } from '../utils/logger';
import { supabase } from '../config/database.config';

// Configuration Morgan pour le logging HTTP
export const httpLogger = morgan('combined', {
  stream: morganStream,
  skip: (req: Request, res: Response) => {
    // Skip logging pour les requêtes de health check
    return req.url === '/health' || req.url === '/metrics';
  }
});

// Middleware pour logger les requêtes avec plus de détails
export const detailedLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const originalSend = res.send;
  
  // Capturer les données de la requête
  const requestData = {
    method: req.method,
    url: req.url,
    headers: {
      'user-agent': req.get('User-Agent'),
      'content-type': req.get('Content-Type'),
      'authorization': req.get('Authorization') ? '[REDACTED]' : undefined
    },
    ip: req.ip,
    body: req.method !== 'GET' ? req.body : undefined,
    query: req.query,
    params: req.params,
    timestamp: new Date().toISOString()
  };
  
  // Override de la méthode send pour capturer la réponse
  res.send = function(data) {
    const duration = Date.now() - start;
    
    const responseData = {
      ...requestData,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: Buffer.byteLength(data, 'utf8'),
      adminId: (req as any).admin?.id,
      userId: (req as any).user?.id
    };
    
    // Logger dans la base de données pour les requêtes importantes
    if (shouldLogToDatabase(req, res)) {
      logToDatabase(responseData).catch(error => {
        console.error('Erreur lors du log en base:', error);
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Détermine si une requête doit être loggée en base de données
const shouldLogToDatabase = (req: Request, res: Response): boolean => {
  // Logger les erreurs
  if (res.statusCode >= 400) {
    return true;
  }
  
  // Logger les actions sensibles
  const sensitivePaths = [
    '/api/admin/auth/login',
    '/api/admin/users/suspend',
    '/api/admin/users/ban',
    '/api/admin/transactions/process',
    '/api/admin/notifications/broadcast'
  ];
  
  if (sensitivePaths.some(path => req.url.includes(path))) {
    return true;
  }
  
  // Logger les requêtes POST, PUT, DELETE
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return true;
  }
  
  return false;
};

// Log en base de données
const logToDatabase = async (logData: any): Promise<void> => {
  try {
    await supabase
      .from('request_logs')
      .insert({
        method: logData.method,
        url: logData.url,
        status_code: logData.statusCode,
        duration: parseInt(logData.duration),
        response_size: logData.responseSize,
        ip_address: logData.ip,
        user_agent: logData.headers['user-agent'],
        admin_id: logData.adminId,
        user_id: logData.userId,
        request_body: logData.body,
        query_params: logData.query,
        path_params: logData.params,
        created_at: logData.timestamp
      });
  } catch (error) {
    console.error('Erreur lors de l\'insertion du log:', error);
  }
};

// Middleware pour logger les erreurs
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    adminId: (req as any).admin?.id,
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString()
  };
  
  // Logger l'erreur
  console.error('Application Error:', errorData);
  
  // Logger en base de données
  logErrorToDatabase(errorData).catch(err => {
    console.error('Erreur lors du log d\'erreur en base:', err);
  });
  
  next(error);
};

// Log d'erreur en base de données
const logErrorToDatabase = async (errorData: any): Promise<void> => {
  try {
    await supabase
      .from('error_logs')
      .insert({
        message: errorData.message,
        stack: errorData.stack,
        method: errorData.method,
        url: errorData.url,
        ip_address: errorData.ip,
        user_agent: errorData.userAgent,
        admin_id: errorData.adminId,
        user_id: errorData.userId,
        created_at: errorData.timestamp
      });
  } catch (error) {
    console.error('Erreur lors de l\'insertion du log d\'erreur:', error);
  }
};

// Middleware pour logger les performances
export const performanceLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Logger les requêtes lentes (> 1 seconde)
    if (duration > 1000) {
      console.warn(`Requête lente détectée: ${req.method} ${req.url} - ${duration}ms`);
      
      // Logger en base de données
      logPerformanceToDatabase({
        method: req.method,
        url: req.url,
        duration,
        statusCode: res.statusCode,
        adminId: (req as any).admin?.id,
        timestamp: new Date().toISOString()
      }).catch(error => {
        console.error('Erreur lors du log de performance:', error);
      });
    }
  });
  
  next();
};

// Log de performance en base de données
const logPerformanceToDatabase = async (perfData: any): Promise<void> => {
  try {
    await supabase
      .from('performance_logs')
      .insert({
        method: perfData.method,
        url: perfData.url,
        duration: perfData.duration,
        status_code: perfData.statusCode,
        admin_id: perfData.adminId,
        created_at: perfData.timestamp
      });
  } catch (error) {
    console.error('Erreur lors de l\'insertion du log de performance:', error);
  }
};

// Middleware pour logger les actions admin
export const adminActionLogger = (action: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalSend = res.send;
    
    res.send = function(data) {
      if (res.statusCode < 400 && (req as any).admin) {
        const actionData = {
          admin_id: (req as any).admin.id,
          action,
          details: {
            method: req.method,
            url: req.url,
            body: req.body,
            params: req.params,
            query: req.query
          },
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        };
        
        // Logger l'action admin
        logAdminActionToDatabase(actionData).catch(error => {
          console.error('Erreur lors du log d\'action admin:', error);
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Log d'action admin en base de données
const logAdminActionToDatabase = async (actionData: any): Promise<void> => {
  try {
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: actionData.admin_id,
        action: actionData.action,
        details: actionData.details,
        ip_address: actionData.ip_address,
        user_agent: actionData.user_agent,
        created_at: actionData.timestamp
      });
  } catch (error) {
    console.error('Erreur lors de l\'insertion du log d\'action admin:', error);
  }
};

// Middleware pour logger les tentatives de sécurité
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Détecter les tentatives suspectes
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /<script/i, // XSS
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /eval\(/i, // Code injection
  ];
  
  const url = req.url;
  const userAgent = req.get('User-Agent') || '';
  const body = JSON.stringify(req.body || {});
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(userAgent) || pattern.test(body)) {
      const securityData = {
        type: 'suspicious_request',
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent,
        body: req.body,
        timestamp: new Date().toISOString()
      };
      
      console.warn('Tentative suspecte détectée:', securityData);
      
      // Logger en base de données
      logSecurityToDatabase(securityData).catch(error => {
        console.error('Erreur lors du log de sécurité:', error);
      });
      
      break;
    }
  }
  
  next();
};

// Log de sécurité en base de données
const logSecurityToDatabase = async (securityData: any): Promise<void> => {
  try {
    await supabase
      .from('security_logs')
      .insert({
        type: securityData.type,
        method: securityData.method,
        url: securityData.url,
        ip_address: securityData.ip,
        user_agent: securityData.userAgent,
        details: securityData.body,
        created_at: securityData.timestamp
      });
  } catch (error) {
    console.error('Erreur lors de l\'insertion du log de sécurité:', error);
  }
};
