import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/helpers';
import { supabase } from '../config/database.config';
import { AdminUser, Permission, AuthRequest } from '../types';
import { logSecurityEvent } from '../utils/logger';

export const authenticateAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logSecurityEvent('missing_token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url
      });
      
      res.status(401).json({
        success: false,
        error: 'Token d\'accès requis'
      });
      return;
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token d\'accès requis'
      });
      return;
    }
    
    // Vérifier le token JWT
    const decoded = verifyToken(token);
    
    // Récupérer l'admin depuis la base de données
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', decoded.id)
      .eq('is_active', true)
      .single();
    
    if (error || !admin) {
      logSecurityEvent('invalid_token', {
        adminId: decoded.id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url
      });
      
      res.status(401).json({
        success: false,
        error: 'Utilisateur admin invalide'
      });
      return;
    }
    
    // Mettre à jour la dernière connexion
    await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id);
    
    req.admin = admin as AdminUser;
    next();
    
  } catch (error) {
    logSecurityEvent('token_verification_failed', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url
    });
    
    res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
  }
};

export const requirePermission = (permission: Permission) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
      return;
    }
    
    if (!req.admin.permissions.includes(permission)) {
      logSecurityEvent('insufficient_permissions', {
        adminId: req.admin.id,
        requiredPermission: permission,
        userPermissions: req.admin.permissions,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url
      });
      
      res.status(403).json({
        success: false,
        error: 'Permission insuffisante',
        required: permission
      });
      return;
    }
    
    next();
  };
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
      return;
    }
    
    if (!roles.includes(req.admin.role)) {
      logSecurityEvent('insufficient_role', {
        adminId: req.admin.id,
        adminRole: req.admin.role,
        requiredRoles: roles,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url
      });
      
      res.status(403).json({
        success: false,
        error: 'Rôle insuffisant',
        required: roles
      });
      return;
    }
    
    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      next();
      return;
    }
    
    const decoded = verifyToken(token);
    
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', decoded.id)
      .eq('is_active', true)
      .single();
    
    if (!error && admin) {
      req.admin = admin as AdminUser;
    }
    
    next();
    
  } catch (error) {
    // En cas d'erreur, on continue sans authentification
    next();
  }
};

export const validateAdminSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.admin) {
    res.status(401).json({
      success: false,
      error: 'Session admin requise'
    });
    return;
  }
  
  // Vérifier si la session est encore valide
  const { data: session, error } = await supabase
    .from('admin_sessions')
    .select('*')
    .eq('admin_id', req.admin.id)
    .eq('is_active', true)
    .single();
  
  if (error || !session) {
    res.status(401).json({
      success: false,
      error: 'Session expirée'
    });
    return;
  }
  
  // Vérifier l'expiration de la session
  if (new Date() > new Date(session.expires_at)) {
    // Désactiver la session expirée
    await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('id', session.id);
    
    res.status(401).json({
      success: false,
      error: 'Session expirée'
    });
    return;
  }
  
  next();
};

export const logAdminActivity = (action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log l'activité admin après l'envoi de la réponse
      if (req.admin && res.statusCode < 400) {
        supabase
          .from('admin_logs')
          .insert({
            admin_id: req.admin.id,
            action,
            details: {
              method: req.method,
              url: req.url,
              ip: req.ip,
              userAgent: req.get('User-Agent'),
              body: req.method !== 'GET' ? req.body : undefined,
              params: req.params,
              query: req.query
            },
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          })
          .then(() => {
            // Log réussi
          })
          .catch((error) => {
            console.error('Erreur lors du log admin:', error);
          });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};
